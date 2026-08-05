from fastapi import FastAPI, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data, auth, push
from database import SessionLocal, engine, get_db
import hashlib, traceback, bcrypt
from daraja import stk_push, query_stk_status, b2c_payout
from starlette.concurrency import run_in_threadpool

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()
sample_data.create_sample_data(db)
# Seed admin account if not exists
admin_user = db.query(models.User).filter(models.User.username == "admin").first()
if not admin_user:
    db.add(models.User(
        username="admin",
        email="admin@rescuemepets.com",
        password=bcrypt.hashpw("admin1234".encode(), bcrypt.gensalt()).decode(),
        role="admin"
    ))
    db.commit()
elif len(admin_user.password) == 64 and all(c in '0123456789abcdef' for c in admin_user.password):
    # Migrate legacy SHA-256 admin hash to bcrypt
    admin_user.password = bcrypt.hashpw("admin1234".encode(), bcrypt.gensalt()).decode()
    db.commit()
db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    # support legacy SHA-256 hashes during transition
    if len(hashed) == 64 and all(c in '0123456789abcdef' for c in hashed):
        return hashlib.sha256(plain.encode()).hexdigest() == hashed
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False

def audit(db: Session, user_id, action: str, entity: str, entity_id=None, detail=""):
    db.add(models.AuditLog(user_id=user_id, action=action, entity=entity, entity_id=entity_id, detail=detail))
    # don't commit here — caller commits

def require_ticket_participant(ticket, current_user: models.User, db: Session):
    if current_user.role == "admin" or ticket.user_id == current_user.id:
        return
    if current_user.role == "vet":
        vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
        if vet and ticket.vet_id == vet.id:
            return
    raise HTTPException(status_code=403, detail="You don't have access to this ticket")

def require_dev_env():
    import os
    if os.getenv("ENV", "development") == "production":
        raise HTTPException(status_code=403, detail="This endpoint is disabled in production")

def animal_to_dict(animal, favorites=None):
    return {
        "id": animal.id,
        "name": animal.name,
        "species": animal.species,
        "breed": animal.breed,
        "age": animal.age,
        "description": animal.description,
        "image": animal.image,
        "status": animal.status,
        "tags": animal.tags.split(",") if animal.tags else [],
        "center_id": animal.center_id,
        "center": {
            "id": animal.center.id,
            "name": animal.center.name,
            "location": animal.center.location,
            "contact": animal.center.contact
        } if animal.center else None,
        "is_favorited": animal.id in (favorites or []),
        "vaccinated": animal.vaccinated or False,
        "neutered": animal.neutered or False,
        "microchipped": animal.microchipped or False,
        "good_with_kids": animal.good_with_kids or False,
        "good_with_pets": animal.good_with_pets or False,
        "energy_level": animal.energy_level or "medium",
        "personality_badges": animal.personality_badges.split(",") if animal.personality_badges else [],
        "photos": [p.strip() for p in animal.photos.split(",") if p.strip()] if animal.photos else [],
        "sponsored": animal.sponsored or False,
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(username=user.username, email=user.email, password=get_password_hash(user.password), role="adopter")
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

@app.post("/register/vet")
def register_vet(data: schemas.VetRegister, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == data.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    center = db.query(models.Center).filter(models.Center.id == data.center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Center not found")
    user = models.User(username=data.username, email=data.email, password=get_password_hash(data.password), role="vet")
    db.add(user)
    db.flush()
    vet = models.Vet(name=data.name, clinic=data.clinic, phone=data.phone, specialization=data.specialization, center_id=data.center_id, user_id=user.id)
    db.add(vet)
    db.commit()
    return {"message": "Vet registered successfully"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Username not found. Please check your username or register.")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")
    vet = db.query(models.Vet).filter(models.Vet.user_id == db_user.id).first()
    tokens = auth.create_token_pair(db_user, db)
    return {
        "message": "Login successful",
        "user_id": db_user.id,
        "username": db_user.username,
        "role": db_user.role,
        "vet_id": vet.id if vet else None,
        **tokens,
    }

@app.post("/auth/refresh", response_model=schemas.TokenPair)
def refresh_token(body: schemas.RefreshRequest, db: Session = Depends(get_db)):
    user = auth.verify_refresh_token(body.refresh_token, db)
    return auth.create_token_pair(user, db)

@app.post("/auth/logout")
def logout(body: schemas.RefreshRequest, db: Session = Depends(get_db)):
    auth.revoke_refresh_token(body.refresh_token, db)
    return {"message": "Logged out"}

@app.get("/animals")
def get_animals(species: str = None, search: str = None, status: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user_optional)):
    query = db.query(models.Animal).filter(models.Animal.deleted_at == None)
    if species and species != "all":
        query = query.filter(models.Animal.species == species)
    if status and status != "all":
        query = query.filter(models.Animal.status == status)
    if search:
        query = query.filter(
            models.Animal.name.ilike(f"%{search}%") |
            models.Animal.breed.ilike(f"%{search}%")
        )
    animals = query.all()
    favorites = []
    if current_user:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
        favorites = [f.animal_id for f in favs]
    return [animal_to_dict(a, favorites) for a in animals]

@app.get("/animals/{animal_id}")
def get_animal(animal_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user_optional)):
    animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    favorites = []
    if current_user:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
        favorites = [f.animal_id for f in favs]
    return animal_to_dict(animal, favorites)

@app.post("/animals")
def create_animal(animal: schemas.AnimalBase, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    db_animal = models.Animal(**animal.model_dump())
    db.add(db_animal)
    db.commit()
    db.refresh(db_animal)
    return animal_to_dict(db_animal)

@app.put("/animals/{animal_id}")
def update_animal(animal_id: int, animal: schemas.AnimalBase, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    db_animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    for k, v in animal.model_dump().items():
        setattr(db_animal, k, v)
    db.commit()
    return animal_to_dict(db_animal)

@app.delete("/animals/{animal_id}")
def delete_animal(animal_id: int, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    db_animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    from datetime import datetime, timezone
    db_animal.deleted_at = datetime.now(timezone.utc)
    audit(db, current_user.id, "delete_animal", "animal", animal_id, db_animal.name)
    db.commit()
    return {"message": "Animal deleted"}

@app.get("/admin/applications")
def get_all_applications(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    adoptions = db.query(models.Adoption).order_by(models.Adoption.created_at.desc()).all()
    return [{
        "id": a.id, "user_id": a.user_id, "username": a.user.username,
        "animal_id": a.animal_id, "animal_name": a.animal.name,
        "animal_image": a.animal.image, "animal_species": a.animal.species,
        "message": a.message, "status": a.status,
        "application_type": a.application_type,
        "created_at": a.created_at.isoformat()
    } for a in adoptions]

@app.put("/applications/{adoption_id}/status")
def update_application_status(adoption_id: int, body: schemas.StatusUpdate, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found")
    old_status = adoption.status
    adoption.status = body.status
    if body.status in ("approved", "rejected") and old_status == "pending":
        adoption.read = False
        if body.status == "approved":
            adoption.animal.status = "adopted"
        elif body.status == "rejected":
            adoption.animal.status = "available"
    audit(db, current_user.id, f"{body.status}_application", "adoption", adoption_id,
          f"animal={adoption.animal.name}")
    db.commit()
    if body.status in ("approved", "rejected") and old_status == "pending":
        verb = "approved! 🎉" if body.status == "approved" else "updated"
        push.send_push_to_user(db, adoption.user_id,
            f"Your application for {adoption.animal.name} was {verb}",
            "Tap to see the details.", "/my-profile")
        if body.status == "rejected":
            waiters = db.query(models.Waitlist).filter(models.Waitlist.animal_id == adoption.animal_id).all()
            for w in waiters:
                push.send_push_to_user(db, w.user_id,
                    f"{adoption.animal.name} is available again!",
                    "You're on the waitlist — apply now before someone else does.",
                    f"/adopt?animalId={adoption.animal_id}")
    return {"message": f"Status updated to {body.status}"}

@app.get("/admin/users")
def get_all_users(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return [{"id": u.id, "username": u.username, "email": u.email, "role": u.role} for u in users]

@app.get("/admin/analytics")
def get_analytics(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    from sqlalchemy import func as sqlfunc

    def as_aware(dt):
        return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

    # ── Funnel ──────────────────────────────────────────────
    total_apps = db.query(models.Adoption).count()
    pending = db.query(models.Adoption).filter(models.Adoption.status == "pending").count()
    approved = db.query(models.Adoption).filter(models.Adoption.status == "approved").count()
    rejected = db.query(models.Adoption).filter(models.Adoption.status == "rejected").count()
    fostering = db.query(models.Adoption).filter(
        models.Adoption.application_type == "foster",
        models.Adoption.status == "approved",
        models.Adoption.foster_finalized_at.is_(None),
    ).count()
    decided = approved + rejected
    approval_rate = round((approved / decided) * 100, 1) if decided else None

    # ── Avg time to decision, in hours (application submitted -> admin decision) ──
    decisions = db.query(models.AuditLog).filter(
        models.AuditLog.entity == "adoption",
        models.AuditLog.action.in_(["approved_application", "rejected_application"])
    ).all()
    diffs_hours = []
    for d in decisions:
        adoption = db.query(models.Adoption).filter(models.Adoption.id == d.entity_id).first()
        if adoption:
            hours = (as_aware(d.created_at) - as_aware(adoption.created_at)).total_seconds() / 3600
            diffs_hours.append(hours)
    avg_decision_hours = round(sum(diffs_hours) / len(diffs_hours), 1) if diffs_hours else None

    # ── Most favorited animals ──────────────────────────────
    top_favs = db.query(models.Favorite.animal_id, sqlfunc.count(models.Favorite.id).label("cnt")) \
        .group_by(models.Favorite.animal_id) \
        .order_by(sqlfunc.count(models.Favorite.id).desc()) \
        .limit(5).all()
    most_favorited = []
    for animal_id, cnt in top_favs:
        a = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
        if a:
            most_favorited.append({"id": a.id, "name": a.name, "image": a.image, "species": a.species, "favorite_count": cnt})

    # ── Revenue ─────────────────────────────────────────────
    completed_payments = db.query(models.Payment).filter(models.Payment.status == "completed").all()

    # ── Adoptions by center ─────────────────────────────────
    by_center = []
    for c in db.query(models.Center).all():
        animal_ids = [row[0] for row in db.query(models.Animal.id).filter(models.Animal.center_id == c.id).all()]
        adopted_count = db.query(models.Adoption).filter(
            models.Adoption.animal_id.in_(animal_ids), models.Adoption.status == "approved"
        ).count() if animal_ids else 0
        by_center.append({"center_id": c.id, "name": c.name, "adoptions": adopted_count})

    # ── Monthly application trend, last 6 months ────────────
    now = datetime.now(timezone.utc)
    y, m = now.year, now.month
    buckets = []
    for _ in range(6):
        buckets.append((y, m))
        m -= 1
        if m == 0:
            m, y = 12, y - 1
    buckets.reverse()
    counts = {f"{yy:04d}-{mm:02d}": 0 for yy, mm in buckets}
    for (created,) in db.query(models.Adoption.created_at).all():
        key = f"{created.year:04d}-{created.month:02d}"
        if key in counts:
            counts[key] += 1
    monthly_trend = [{"month": k, "applications": v} for k, v in sorted(counts.items())]

    return {
        "funnel": {
            "total_applications": total_apps,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": approval_rate,
            "currently_fostering": fostering,
        },
        "avg_decision_hours": avg_decision_hours,
        "most_favorited": most_favorited,
        "revenue": {
            "adoption_fees_kes": sum(p.amount for p in completed_payments),
            "adoption_fee_payment_count": len(completed_payments),
        },
        "adoptions_by_center": by_center,
        "monthly_trend": monthly_trend,
    }

def _parse_report_range(start_date: str, end_date: str):
    from datetime import datetime, timezone, timedelta
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end = datetime.strptime(end_date, "%Y-%m-%d").replace(tzinfo=timezone.utc) + timedelta(days=1)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format — use YYYY-MM-DD")
    if start >= end:
        raise HTTPException(status_code=400, detail="start_date must be before end_date")
    return start, end

def _in_range(dt, start, end):
    from datetime import timezone
    d = dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)
    return start <= d < end

@app.get("/admin/reports/summary")
def get_report_summary(start_date: str, end_date: str, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    start, end = _parse_report_range(start_date, end_date)

    adoptions = [a for a in db.query(models.Adoption).all() if _in_range(a.created_at, start, end)]
    approved = [a for a in adoptions if a.status == "approved"]
    rejected = [a for a in adoptions if a.status == "rejected"]
    pending = [a for a in adoptions if a.status == "pending"]
    decided = len(approved) + len(rejected)
    approval_rate = round((len(approved) / decided) * 100, 1) if decided else None

    payments = [p for p in db.query(models.Payment).filter(models.Payment.status == "completed").all() if _in_range(p.created_at, start, end)]
    foster_applications = [a for a in adoptions if a.application_type == "foster"]

    by_center = []
    for c in db.query(models.Center).all():
        animal_ids = {row[0] for row in db.query(models.Animal.id).filter(models.Animal.center_id == c.id).all()}
        center_adoptions = [a for a in approved if a.animal_id in animal_ids]
        by_center.append({"center_id": c.id, "name": c.name, "adoptions": len(center_adoptions)})

    audit_summary = {}
    for a in db.query(models.AuditLog).all():
        if _in_range(a.created_at, start, end):
            audit_summary[a.action] = audit_summary.get(a.action, 0) + 1

    return {
        "period": {"start": start_date, "end": end_date},
        "funnel": {
            "total_applications": len(adoptions),
            "approved": len(approved),
            "rejected": len(rejected),
            "pending": len(pending),
            "approval_rate": approval_rate,
            "foster_applications": len(foster_applications),
        },
        "revenue": {
            "adoption_fees_kes": sum(p.amount for p in payments),
            "payment_count": len(payments),
        },
        "by_center": by_center,
        "audit_summary": audit_summary,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }

@app.get("/admin/reports/export.csv")
def export_report_csv(start_date: str, end_date: str, dataset: str, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    import csv, io
    from fastapi.responses import StreamingResponse

    start, end = _parse_report_range(start_date, end_date)
    output = io.StringIO()
    writer = csv.writer(output)

    if dataset == "applications":
        writer.writerow(["ID", "Adopter", "Animal", "Type", "Status", "Submitted"])
        for a in db.query(models.Adoption).all():
            if _in_range(a.created_at, start, end):
                writer.writerow([a.id, a.user.username, a.animal.name, a.application_type, a.status, a.created_at.isoformat()])
    elif dataset == "payments":
        writer.writerow(["ID", "Adopter", "Amount (KES)", "Status", "M-Pesa Receipt", "Date"])
        for p in db.query(models.Payment).filter(models.Payment.status == "completed").all():
            if _in_range(p.created_at, start, end):
                writer.writerow([p.id, p.user.username, p.amount, p.status, p.mpesa_receipt or "", p.created_at.isoformat()])
    else:
        raise HTTPException(status_code=400, detail="dataset must be one of: applications, payments")

    filename = f"rescuemepets_{dataset}_{start_date}_to_{end_date}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )

@app.get("/centers/{center_id}")
def get_center(center_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Center).filter(models.Center.id == center_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Center not found")
    animals = db.query(models.Animal).filter(models.Animal.center_id == center_id).all()
    return {
        "id": c.id, "name": c.name, "location": c.location, "contact": c.contact,
        "phone": c.phone or "", "website": c.website or "",
        "description": c.description or "", "opening_hours": c.opening_hours or "",
        "map_query": c.map_query or "",
        "animals": [animal_to_dict(a) for a in animals]
    }

@app.get("/centers/{center_id}/stories")
def get_center_stories(center_id: int, db: Session = Depends(get_db)):
    stories = db.query(models.RescueStory).filter(models.RescueStory.center_id == center_id).all()
    return [{
        "id": s.id,
        "adopter_name": s.adopter_name,
        "animal_name": s.animal_name,
        "animal_image": s.animal_image,
        "story": s.story,
        "adopted_on": s.adopted_on,
    } for s in stories]

@app.get("/centers")
def get_centers(db: Session = Depends(get_db)):
    centers = db.query(models.Center).all()
    result = []
    for c in centers:
        animal_count = db.query(models.Animal).filter(
            models.Animal.center_id == c.id,
            models.Animal.status == "available"
        ).count()
        result.append({
            "id": c.id, "name": c.name,
            "location": c.location, "contact": c.contact,
            "phone": c.phone or "",
            "website": c.website or "",
            "description": c.description or "",
            "opening_hours": c.opening_hours or "",
            "map_query": c.map_query or "",
            "animal_count": animal_count
        })
    return result

@app.post("/adopt")
def adopt(adoption: schemas.AdoptionCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter(models.Animal.id == adoption.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    if animal.status == "adopted":
        raise HTTPException(status_code=400, detail="Animal already adopted")
    if animal.status == "pending":
        raise HTTPException(status_code=400, detail="This animal already has a pending application")
    existing = db.query(models.Adoption).filter(
        models.Adoption.user_id == current_user.id,
        models.Adoption.animal_id == adoption.animal_id,
        models.Adoption.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending application for this animal")
    application_type = adoption.application_type if adoption.application_type in ("adopt", "foster") else "adopt"

    # Atomic compare-and-swap: only claim the animal if it's still "available" right
    # now, closing the TOCTOU gap between the check above and this write under
    # concurrent requests for the same animal.
    claimed = db.query(models.Animal).filter(
        models.Animal.id == adoption.animal_id,
        models.Animal.status == "available"
    ).update({"status": "pending"})
    if claimed == 0:
        db.rollback()
        raise HTTPException(status_code=400, detail="This animal already has a pending application")

    db_adoption = models.Adoption(
        user_id=current_user.id,
        animal_id=adoption.animal_id,
        message=adoption.message,
        application_type=application_type,
        read=False
    )
    db.add(db_adoption)
    db.commit()
    return {"message": "Adoption request submitted successfully", "adoption_id": db_adoption.id}

@app.get("/my-applications")
def get_my_applications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoptions = db.query(models.Adoption).filter(
        models.Adoption.user_id == current_user.id
    ).order_by(models.Adoption.created_at.desc()).all()
    return [{
        "id": a.id,
        "animal_id": a.animal_id,
        "animal_name": a.animal.name,
        "animal_image": a.animal.image,
        "animal_species": a.animal.species,
        "message": a.message,
        "status": a.status,
        "application_type": a.application_type,
        "foster_finalized_at": a.foster_finalized_at.isoformat() if a.foster_finalized_at else None,
        "read": a.read if a.read is not None else True,
        "created_at": a.created_at.isoformat()
    } for a in adoptions]

@app.get("/notifications/unread-count")
def get_unread_count(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    count = db.query(models.Adoption).filter(
        models.Adoption.user_id == current_user.id,
        models.Adoption.read == False
    ).count()
    return {"count": count}

@app.post("/notifications/mark-read")
def mark_notifications_read(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db.query(models.Adoption).filter(
        models.Adoption.user_id == current_user.id,
        models.Adoption.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "Marked as read"}

@app.patch("/applications/{adoption_id}")
def edit_application(adoption_id: int, body: schemas.ApplicationEdit, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(
        models.Adoption.id == adoption_id,
        models.Adoption.user_id == current_user.id,
        models.Adoption.status == "pending"
    ).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found or cannot be edited")
    adoption.message = body.message
    db.commit()
    return {"message": "Application updated"}

@app.delete("/applications/{adoption_id}")
def delete_application(adoption_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(
        models.Adoption.id == adoption_id,
        models.Adoption.user_id == current_user.id,
        models.Adoption.status == "pending"
    ).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found or cannot be withdrawn")
    adoption.animal.status = "available"
    db.delete(adoption)
    db.commit()
    return {"message": "Application withdrawn"}


@app.post("/favorites")
def toggle_favorite(req: schemas.FavoriteRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.animal_id == req.animal_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    fav = models.Favorite(user_id=current_user.id, animal_id=req.animal_id)
    db.add(fav)
    db.commit()
    return {"favorited": True}

@app.get("/favorites")
def get_favorites(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()
    favorites = [f.animal_id for f in favs]
    animals = db.query(models.Animal).filter(models.Animal.id.in_(favorites)).all()
    return [animal_to_dict(a, favorites) for a in animals]

@app.post("/waitlist")
def join_waitlist(req: schemas.WaitlistRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.Waitlist).filter(
        models.Waitlist.user_id == current_user.id,
        models.Waitlist.animal_id == req.animal_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist")
    db.add(models.Waitlist(user_id=current_user.id, animal_id=req.animal_id))
    db.commit()
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == req.animal_id).count()
    return {"message": "Added to waitlist", "count": count}

@app.get("/waitlist/{animal_id}")
def get_waitlist(animal_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user_optional)):
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == animal_id).count()
    on_list = False
    if current_user:
        on_list = db.query(models.Waitlist).filter(
            models.Waitlist.animal_id == animal_id,
            models.Waitlist.user_id == current_user.id
        ).first() is not None
    return {"count": count, "on_waitlist": on_list}

@app.get("/profile")
def get_profile(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return {"id": current_user.id, "username": current_user.username, "email": current_user.email, "avatar": current_user.avatar or ""}

@app.patch("/profile")
def update_profile(body: schemas.ProfileUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = current_user
    if body.username and body.username != user.username:
        if db.query(models.User).filter(models.User.username == body.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = body.username
    if body.email and body.email != user.email:
        if db.query(models.User).filter(models.User.email == body.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
        user.email = body.email
    if body.avatar is not None:
        user.avatar = body.avatar
    db.commit()
    return {"message": "Profile updated", "username": user.username, "email": user.email, "avatar": user.avatar}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_animals": db.query(models.Animal).count(),
        "available": db.query(models.Animal).filter(models.Animal.status == "available").count(),
        # Use completed/approved adoptions from the Adoption table as the adopted metric
        "adopted": db.query(models.Adoption).filter(models.Adoption.status == "approved").count(),
        "centers": db.query(models.Center).count(),
    }

# ─── M-PESA PAYMENT ENDPOINTS ───────────────────────────────────────────────

@app.post("/pay/stk-push")
def initiate_stk_push(req: schemas.PaymentRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == req.adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Adoption not found")
    if adoption.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This adoption doesn't belong to you")
    if adoption.application_type == "foster":
        raise HTTPException(status_code=400, detail="Foster applications don't require a payment")
    if req.amount < 1 or req.amount > 100000:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    animal = adoption.animal
    description = f"Adoption fee for {animal.name}"
    account_ref = f"ADOPT-{animal.name[:8].upper()}-{req.adoption_id}"

    try:
        result = stk_push(
            phone=req.phone,
            amount=req.amount,
            account_ref=account_ref,
            description=description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"M-PESA error: {str(e)}")

    if result.get("ResponseCode") != "0":
        raise HTTPException(status_code=400, detail=result.get("errorMessage", "STK Push failed"))

    payment = models.Payment(
        user_id=current_user.id,
        adoption_id=req.adoption_id,
        phone=req.phone,
        amount=req.amount,
        checkout_request_id=result.get("CheckoutRequestID"),
        merchant_request_id=result.get("MerchantRequestID"),
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "STK Push sent! Check your phone and enter your M-PESA PIN.",
        "checkout_request_id": result.get("CheckoutRequestID"),
        "payment_id": payment.id
    }

@app.get("/pay/status/{payment_id}")
def check_payment_status(payment_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="This payment doesn't belong to you")

    # If adoption is already approved, sync payment to completed
    if payment.status == "pending" and payment.adoption and payment.adoption.status == "approved":
        payment.status = "completed"
        db.commit()

    if payment.status == "pending" and payment.checkout_request_id:
        try:
            result = query_stk_status(payment.checkout_request_id)
            result_code = str(result.get("ResultCode", ""))
            print(f"STK Query result for payment {payment_id}: {result}")
            if result_code == "0":
                payment.status = "completed"
                payment.mpesa_receipt = payment.mpesa_receipt or result.get("MpesaReceiptNumber")
                if payment.adoption:
                    payment.adoption.status = "approved"
                    # Keep animal.status in lockstep with the adoption outcome — otherwise
                    # the animal stays "available"/"pending" forever after a real payment.
                    if payment.adoption.animal:
                        payment.adoption.animal.status = "adopted"
                db.commit()
        except Exception as e:
            print(f"STK query error for payment {payment_id}: {e}")

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "amount": payment.amount,
        "phone": payment.phone,
        "mpesa_receipt": payment.mpesa_receipt,
        "created_at": payment.created_at.isoformat()
    }

# TEST ENDPOINT - For local testing without M-PESA callback
@app.post("/pay/test-complete/{payment_id}")
def test_complete_payment(payment_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Complete a payment manually for testing. Disabled in production."""
    require_dev_env()
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="This payment doesn't belong to you")

    payment.status = "completed"
    payment.mpesa_receipt = "TEST123456"
    if payment.adoption:
        payment.adoption.status = "approved"
        # Mirror the real /pay/callback behavior so test payments and real
        # payments leave the animal in the same state.
        if payment.adoption.animal:
            payment.adoption.animal.status = "adopted"
    db.commit()
    
    return {"message": "Payment completed for testing", "payment_id": payment.id}

@app.post("/pay/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    print(f"M-PESA CALLBACK RECEIVED: {body}")
    try:
        stk_callback = body["Body"]["stkCallback"]
        checkout_request_id = stk_callback["CheckoutRequestID"]
        result_code = stk_callback["ResultCode"]
        print(f"Callback: checkout_id={checkout_request_id}, result_code={result_code}")

        payment = db.query(models.Payment).filter(
            models.Payment.checkout_request_id == checkout_request_id
        ).first()

        if not payment:
            print(f"Callback: no payment found for checkout_id={checkout_request_id}")
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        if result_code == 0:
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            receipt = next((i["Value"] for i in metadata if i["Name"] == "MpesaReceiptNumber"), None)
            payment.status = "completed"
            payment.mpesa_receipt = receipt
            if payment.adoption:
                payment.adoption.status = "approved"
                payment.adoption.read = False
                # This is the real production payment path — if animal.status isn't
                # flipped here, the animal stays visibly "available"/"pending" and
                # other users can keep applying/paying for it after it's been adopted.
                if payment.adoption.animal:
                    payment.adoption.animal.status = "adopted"
            print(f"Callback: payment {payment.id} completed, receipt={receipt}")
        else:
            payment.status = "failed"
            print(f"Callback: payment {payment.id} failed with code {result_code}")

        db.commit()
    except Exception:
        traceback.print_exc()

    return {"ResultCode": 0, "ResultDesc": "Accepted"}

@app.get("/my-payments")
def get_my_payments(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    payments = db.query(models.Payment).filter(
        models.Payment.user_id == current_user.id
    ).order_by(models.Payment.created_at.desc()).all()
    return [{
        "id": p.id,
        "amount": p.amount,
        "phone": p.phone,
        "status": p.status,
        "mpesa_receipt": p.mpesa_receipt,
        "animal_name": p.adoption.animal.name if p.adoption else None,
        "created_at": p.created_at.isoformat()
    } for p in payments]

# ─── B2C PAYOUT ENDPOINT ─────────────────────────────────────────────────────

@app.post("/pay/b2c")
def initiate_b2c(req: schemas.B2CRequest, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    """B2C - Send money FROM business TO user phone (refunds/payouts). Admin-only: moves real money."""
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        result = b2c_payout(
            phone=req.phone,
            amount=req.amount,
            occasion=req.occasion,
            remarks=req.remarks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"B2C error: {str(e)}")

    if result.get("ResponseCode") != "0":
        raise HTTPException(status_code=400, detail=result.get("errorMessage", "B2C payout failed"))

    audit(db, current_user.id, "b2c_payout", "user", user.id, f"KES {req.amount} to {req.phone}")
    db.commit()

    return {
        "message": f"Payout of KES {req.amount} initiated to {req.phone}",
        "conversation_id": result.get("ConversationID"),
        "originator_conversation_id": result.get("OriginatorConversationID")
    }

@app.post("/pay/b2c-callback")
async def b2c_callback(request: Request, db: Session = Depends(get_db)):
    """Webhook - Safaricom calls this after B2C payout completes."""
    body = await request.json()
    try:
        result = body.get("Result", {})
        result_code = result.get("ResultCode")
        transaction_id = result.get("TransactionID")
        amount = None
        phone = None
        items = result.get("ResultParameters", {}).get("ResultParameter", [])
        for item in items:
            if item.get("Key") == "TransactionAmount":
                amount = item.get("Value")
            if item.get("Key") == "ReceiverPartyPublicName":
                phone = item.get("Value")
        print(f"B2C Callback: code={result_code}, txn={transaction_id}, amount={amount}, phone={phone}")
    except Exception:
        traceback.print_exc()
    return {"ResultCode": 0, "ResultDesc": "Accepted"}

# ─── SUPPORT TICKETS ────────────────────────────────────────────────────────

@app.post("/support")
def create_ticket(req: schemas.SupportTicketCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == req.adoption_id).first()
    if not adoption or adoption.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This adoption doesn't belong to you")
    existing = db.query(models.SupportTicket).filter(
        models.SupportTicket.adoption_id == req.adoption_id,
        models.SupportTicket.status != "resolved"
    ).first()
    if existing:
        existing.issue = req.issue
        db.commit()
        return {"message": "Support ticket updated", "ticket_id": existing.id}
    ticket = models.SupportTicket(user_id=current_user.id, adoption_id=req.adoption_id, issue=req.issue)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"message": "Support ticket created", "ticket_id": ticket.id}

@app.delete("/support/{ticket_id}")
def delete_ticket(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(
        models.SupportTicket.id == ticket_id,
        models.SupportTicket.user_id == current_user.id,
        models.SupportTicket.status == "open"
    ).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found or cannot be deleted")
    db.delete(ticket)
    db.commit()
    return {"message": "Ticket withdrawn"}

@app.get("/support")
def get_tickets(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.user_id == current_user.id
    ).order_by(models.SupportTicket.created_at.desc()).all()
    return [{
        "id": t.id,
        "adoption_id": t.adoption_id,
        "animal_name": t.adoption.animal.name,
        "issue": t.issue,
        "status": t.status,
        "resolution_note": t.resolution_note,
        "created_at": t.created_at.isoformat(),
        "vet": {"name": t.vet.name, "clinic": t.vet.clinic, "phone": t.vet.phone, "specialization": t.vet.specialization} if t.vet else None
    } for t in tickets]

@app.get("/support/all")
def get_all_tickets(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()
    return [{
        "id": t.id,
        "adoption_id": t.adoption_id,
        "animal_name": t.adoption.animal.name,
        "center_id": t.adoption.animal.center_id,
        "issue": t.issue,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "vet": {"name": t.vet.name, "clinic": t.vet.clinic, "phone": t.vet.phone, "specialization": t.vet.specialization} if t.vet else None
    } for t in tickets]

@app.patch("/support/{ticket_id}")
def update_ticket(ticket_id: int, body: schemas.TicketStatusUpdate, current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if body.vet_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only an admin can assign a vet to a ticket")
    if current_user.role == "vet":
        vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
        if not vet or ticket.vet_id != vet.id:
            raise HTTPException(status_code=403, detail="You can only update tickets assigned to you")
    ticket.status = body.status
    if body.vet_id:
        ticket.vet_id = body.vet_id
        ticket.vet_read = False  # mark unread for vet when assigned
    if body.resolution_note is not None:
        ticket.resolution_note = body.resolution_note
    if body.status == "resolved":
        # notify adopter by marking adoption unread
        if ticket.adoption:
            ticket.adoption.read = False
        # a resolved ticket is no longer actionable — clear the vet's unread
        # flag regardless of who resolved it, so it stops inflating their
        # Active Tickets badge forever
        ticket.vet_read = True
    db.commit()
    if body.status == "resolved" and ticket.user_id:
        animal_name = ticket.adoption.animal.name if ticket.adoption else "your pet"
        push.send_push_to_user(db, ticket.user_id,
            f"Your ticket about {animal_name} was resolved",
            ticket.resolution_note or "Tap to see the resolution.", "/my-profile")
    return {"message": "Ticket updated"}

@app.get("/vets")
def get_vets(center_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Vet)
    if center_id:
        query = query.filter(models.Vet.center_id == center_id)
    return [{"id": v.id, "name": v.name, "clinic": v.clinic, "phone": v.phone, "specialization": v.specialization, "center_id": v.center_id} for v in query.all()]

@app.post("/vets/{vet_id}/message")
def send_vet_message(vet_id: int, body: schemas.VetMessageCreate, db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.id == vet_id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found")
    msg = models.VetMessage(vet_id=vet_id, user_id=body.user_id, name=body.name, email=body.email, message=body.message)
    db.add(msg)
    db.commit()
    return {"ok": True, "detail": f"Message sent to {vet.name}"}

@app.post("/quiz/match")
def quiz_match(answers: schemas.QuizAnswers, db: Session = Depends(get_db)):
    """Score all available animals against quiz answers and return top matches."""
    animals = db.query(models.Animal).filter(models.Animal.status == "available").all()
    scored = []
    for a in animals:
        score = 0
        # Activity level
        if answers.activity == "active" and a.energy_level == "high": score += 3
        elif answers.activity == "moderate" and a.energy_level == "medium": score += 3
        elif answers.activity == "relaxed" and a.energy_level == "low": score += 3
        elif answers.activity == "active" and a.energy_level == "medium": score += 1
        elif answers.activity == "relaxed" and a.energy_level == "medium": score += 1
        # Home type
        if answers.home == "house" and a.energy_level in ["high", "medium"]: score += 2
        if answers.home == "apartment" and a.energy_level == "low": score += 2
        if answers.home == "apartment" and a.species in ["Cat", "Rabbit", "Bird"]: score += 2
        if answers.home == "farm": score += 1
        # Kids
        if answers.has_kids and a.good_with_kids: score += 3
        if not answers.has_kids: score += 1  # neutral
        # Other pets
        if answers.has_pets and a.good_with_pets: score += 3
        if not answers.has_pets: score += 1
        # Experience
        if answers.experience == "first" and a.energy_level == "low": score += 2
        if answers.experience == "first" and a.species in ["Cat", "Rabbit", "Bird"]: score += 1
        if answers.experience == "experienced" and a.energy_level == "high": score += 2
        # Time at home
        if answers.time_home == "always" and a.energy_level == "high": score += 2
        if answers.time_home == "sometimes" and a.energy_level == "medium": score += 2
        if answers.time_home == "rarely" and a.energy_level == "low": score += 2
        if answers.time_home == "rarely" and a.species == "Cat": score += 2
        # Species preference
        if answers.species_pref != "any" and a.species == answers.species_pref: score += 4

        scored.append((score, a))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:6]
    return [animal_to_dict(a) for _, a in top]

# ─── TICKET MESSAGING ───────────────────────────────────────────────────────

@app.get("/tickets/{ticket_id}/messages")
def get_ticket_messages(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    require_ticket_participant(ticket, current_user, db)
    msgs = db.query(models.TicketMessage).filter(
        models.TicketMessage.ticket_id == ticket_id
    ).order_by(models.TicketMessage.created_at.asc()).all()
    return [{
        "id": m.id,
        "sender_id": m.sender_id,
        "sender_name": m.sender.username,
        "sender_role": m.sender_role,
        "message": m.message,
        "is_read": m.is_read,
        "created_at": m.created_at.isoformat()
    } for m in msgs]

@app.post("/tickets/{ticket_id}/messages")
async def send_ticket_message(ticket_id: int, body: schemas.TicketMessageCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    require_ticket_participant(ticket, current_user, db)
    sender_role = "vet" if current_user.role in ("vet", "admin") else "adopter"
    msg = models.TicketMessage(
        ticket_id=ticket_id,
        sender_id=current_user.id,
        sender_role=sender_role,
        message=body.message,
        is_read=False
    )
    db.add(msg)
    if sender_role == "vet":
        if ticket.adoption:
            ticket.adoption.read = False
    else:
        ticket.vet_read = False
    db.commit()
    db.refresh(msg)
    payload = {
        "type": "new_message",
        "id": msg.id,
        "sender_id": msg.sender_id,
        "sender_name": current_user.username,
        "sender_role": msg.sender_role,
        "message": msg.message,
        "is_read": False,
        "created_at": msg.created_at.isoformat()
    }
    # Broadcast to everyone in the ticket room
    await manager.broadcast_ticket(ticket_id, payload)
    # Notify the other party: live WS banner (if tab open) + push (even if closed)
    animal_name = ticket.adoption.animal.name if ticket.adoption else "your pet"
    if sender_role == "vet" and ticket.user_id:
        await manager.notify_user(ticket.user_id, {"type": "notification", "ticket_id": ticket_id, "preview": body.message[:80]})
        await run_in_threadpool(push.send_push_to_user, db, ticket.user_id,
            f"New message about {animal_name}", body.message[:120], f"/my-profile")
    elif sender_role == "adopter" and ticket.vet and ticket.vet.user_id:
        await manager.notify_user(ticket.vet.user_id, {"type": "notification", "ticket_id": ticket_id, "preview": body.message[:80]})
        await run_in_threadpool(push.send_push_to_user, db, ticket.vet.user_id,
            f"New message about {animal_name}", body.message[:120], f"/vet-portal")
    return {"message": "Message sent", "id": msg.id}

@app.patch("/tickets/{ticket_id}/messages/read")
def mark_messages_read(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Mark all messages on a ticket as read for the reader."""
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    require_ticket_participant(ticket, current_user, db)
    reader_role = "vet" if current_user.role in ("vet", "admin") else "adopter"
    # Only mark messages sent by the OTHER party as read
    other_role = "vet" if reader_role == "adopter" else "adopter"
    db.query(models.TicketMessage).filter(
        models.TicketMessage.ticket_id == ticket_id,
        models.TicketMessage.sender_role == other_role,
        models.TicketMessage.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "Messages marked as read"}

@app.get("/tickets/{ticket_id}/unread-count")
def ticket_unread_count(ticket_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    require_ticket_participant(ticket, current_user, db)
    reader_role = "vet" if current_user.role in ("vet", "admin") else "adopter"
    other_role = "vet" if reader_role == "adopter" else "adopter"
    count = db.query(models.TicketMessage).filter(
        models.TicketMessage.ticket_id == ticket_id,
        models.TicketMessage.sender_role == other_role,
        models.TicketMessage.is_read == False
    ).count()
    return {"count": count}

# ─── VET PORTAL ENDPOINTS ────────────────────────────────────────────────────

@app.get("/vet/profile")
def get_vet_profile(current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Vet profile not found")
    return {
        "id": vet.id, "name": vet.name, "clinic": vet.clinic,
        "phone": vet.phone, "specialization": vet.specialization,
        "center_id": vet.center_id,
        "center_name": vet.center.name if vet.center else ""
    }

@app.get("/vet/tickets")
def get_vet_tickets(current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Vet profile not found")
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.vet_id == vet.id
    ).order_by(models.SupportTicket.created_at.desc()).all()
    return [{
        "id": t.id, "adoption_id": t.adoption_id,
        "animal_name": t.adoption.animal.name,
        "adopter": t.user.username,
        "issue": t.issue, "status": t.status,
        "resolution_note": t.resolution_note,
        "vet_read": t.vet_read if t.vet_read is not None else True,
        "created_at": t.created_at.isoformat()
    } for t in tickets]

@app.get("/vet/unread-count")
def get_vet_unread(current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    if not vet:
        return {"count": 0}
    count = db.query(models.SupportTicket).filter(
        models.SupportTicket.vet_id == vet.id,
        models.SupportTicket.vet_read == False
    ).count()
    return {"count": count}

@app.post("/vet/mark-read")
def vet_mark_read(current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    if not vet:
        return {"message": "ok"}
    db.query(models.SupportTicket).filter(
        models.SupportTicket.vet_id == vet.id,
        models.SupportTicket.vet_read == False
    ).update({"vet_read": True})
    db.commit()
    return {"message": "Marked as read"}

@app.get("/vet/center-animals")
def get_vet_center_animals(current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    if not vet:
        raise HTTPException(status_code=404, detail="Vet profile not found")
    animals = db.query(models.Animal).filter(models.Animal.center_id == vet.center_id).all()
    return [animal_to_dict(a) for a in animals]

# ─── WEBSOCKET CONNECTION MANAGER ───────────────────────────────────────────

from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # ticket_id → list of active WebSocket connections
        self.rooms: Dict[int, List[WebSocket]] = {}
        # user_id → list of active WebSocket connections (for notifications)
        self.users: Dict[int, List[WebSocket]] = {}

    async def connect_ticket(self, ticket_id: int, ws: WebSocket):
        await ws.accept()
        self.rooms.setdefault(ticket_id, []).append(ws)

    async def connect_user(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self.users.setdefault(user_id, []).append(ws)

    def disconnect_ticket(self, ticket_id: int, ws: WebSocket):
        if ticket_id in self.rooms:
            self.rooms[ticket_id] = [c for c in self.rooms[ticket_id] if c != ws]

    def disconnect_user(self, user_id: int, ws: WebSocket):
        if user_id in self.users:
            self.users[user_id] = [c for c in self.users[user_id] if c != ws]

    async def broadcast_ticket(self, ticket_id: int, data: dict):
        for ws in list(self.rooms.get(ticket_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass

    async def notify_user(self, user_id: int, data: dict):
        for ws in list(self.users.get(user_id, [])):
            try:
                await ws.send_json(data)
            except Exception:
                pass

manager = ConnectionManager()

@app.websocket("/ws/ticket/{ticket_id}")
async def ticket_ws(ticket_id: int, websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    """Real-time chat channel for a support ticket. Browsers can't set headers on a
    ws:// handshake, so the access token travels as ?token=..."""
    user = auth.user_from_ws_token(token, db)
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first() if user else None
    if not user or not ticket:
        await websocket.close(code=1008)
        return
    try:
        require_ticket_participant(ticket, user, db)
    except HTTPException:
        await websocket.close(code=1008)
        return
    await manager.connect_ticket(ticket_id, websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive ping from client
    except WebSocketDisconnect:
        manager.disconnect_ticket(ticket_id, websocket)

@app.websocket("/ws/notifications/{user_id}")
async def notifications_ws(user_id: int, websocket: WebSocket, token: str = None, db: Session = Depends(get_db)):
    """Real-time notification channel for a user. Token travels as ?token=..."""
    user = auth.user_from_ws_token(token, db)
    if not user or (user.id != user_id and user.role != "admin"):
        await websocket.close(code=1008)
        return
    await manager.connect_user(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_user(user_id, websocket)

# ─── MEDICAL RECORDS ─────────────────────────────────────────────────────────

@app.get("/animals/{animal_id}/medical-records")
def get_medical_records(animal_id: int, db: Session = Depends(get_db)):
    records = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.animal_id == animal_id
    ).order_by(models.MedicalRecord.date.desc()).all()
    return [{
        "id": r.id,
        "record_type": r.record_type,
        "title": r.title,
        "description": r.description,
        "weight_kg": r.weight_kg,
        "date": r.date,
        "vet_name": r.vet.name if r.vet else None,
        "created_at": r.created_at.isoformat()
    } for r in records]

@app.post("/animals/{animal_id}/medical-records")
def add_medical_record(animal_id: int, body: schemas.MedicalRecordCreate, current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    vet = db.query(models.Vet).filter(models.Vet.user_id == current_user.id).first()
    record = models.MedicalRecord(
        animal_id=animal_id,
        vet_id=vet.id if vet else None,
        record_type=body.record_type,
        title=body.title,
        description=body.description,
        weight_kg=body.weight_kg,
        date=body.date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"id": record.id, "message": "Medical record added"}

@app.delete("/medical-records/{record_id}")
def delete_medical_record(record_id: int, current_user: models.User = Depends(auth.require_vet_or_admin), db: Session = Depends(get_db)):
    record = db.query(models.MedicalRecord).filter(models.MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Record deleted"}

# ─── POST-ADOPTION CHECK-INS ─────────────────────────────────────────────────

@app.post("/checkins")
def submit_checkin(body: schemas.PostAdoptionCheckinCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == body.adoption_id).first()
    if not adoption or adoption.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This adoption doesn't belong to you")
    checkin = models.PostAdoptionCheckin(**body.model_dump(), user_id=current_user.id)
    db.add(checkin)
    db.commit()
    return {"message": "Check-in submitted"}

@app.get("/checkins")
def get_checkins(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    checkins = db.query(models.PostAdoptionCheckin).filter(
        models.PostAdoptionCheckin.user_id == current_user.id
    ).order_by(models.PostAdoptionCheckin.created_at.desc()).all()
    return [{
        "id": c.id,
        "adoption_id": c.adoption_id,
        "checkin_type": c.checkin_type,
        "wellbeing": c.wellbeing,
        "notes": c.notes,
        "photo_url": c.photo_url,
        "animal_name": c.adoption.animal.name if c.adoption else None,
        "created_at": c.created_at.isoformat()
    } for c in checkins]

# ─── FOSTER-TO-ADOPT JOURNAL ──────────────────────────────────────────────────

@app.get("/adoptions/{adoption_id}/journal")
def get_foster_journal(adoption_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found")
    if adoption.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="This application doesn't belong to you")
    entries = db.query(models.FosterJournalEntry).filter(
        models.FosterJournalEntry.adoption_id == adoption_id
    ).order_by(models.FosterJournalEntry.created_at.desc()).all()
    return [{
        "id": e.id,
        "note": e.note,
        "photo_url": e.photo_url,
        "created_at": e.created_at.isoformat(),
    } for e in entries]

@app.post("/adoptions/{adoption_id}/journal")
def add_foster_journal_entry(adoption_id: int, body: schemas.FosterJournalEntryCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption or adoption.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This application doesn't belong to you")
    if adoption.application_type != "foster":
        raise HTTPException(status_code=400, detail="This application isn't a foster-to-adopt arrangement")
    if adoption.status != "approved":
        raise HTTPException(status_code=400, detail="The foster application must be approved before adding journal entries")
    entry = models.FosterJournalEntry(adoption_id=adoption_id, user_id=current_user.id, note=body.note, photo_url=body.photo_url)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"id": entry.id, "message": "Journal entry added"}

@app.post("/adoptions/{adoption_id}/finalize-foster")
def finalize_foster(adoption_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    from datetime import datetime, timezone
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption or adoption.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="This application doesn't belong to you")
    if adoption.application_type != "foster":
        raise HTTPException(status_code=400, detail="This application isn't a foster-to-adopt arrangement")
    if adoption.status != "approved":
        raise HTTPException(status_code=400, detail="The foster application must be approved first")
    if adoption.foster_finalized_at:
        raise HTTPException(status_code=400, detail="This foster has already been finalized into a full adoption")
    adoption.foster_finalized_at = datetime.now(timezone.utc)
    audit(db, current_user.id, "finalized_foster", "adoption", adoption_id, f"animal={adoption.animal.name}")
    db.commit()
    return {"message": "Foster arrangement finalized into a full adoption! 🎉"}

# ─── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────

@app.get("/push/vapid-public-key")
def get_vapid_public_key():
    return {"public_key": push.VAPID_PUBLIC_KEY}

@app.post("/push/subscribe")
def push_subscribe(body: schemas.PushSubscriptionCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    existing = db.query(models.PushSubscription).filter(models.PushSubscription.endpoint == body.endpoint).first()
    if existing:
        existing.user_id = current_user.id
        existing.p256dh = body.keys.p256dh
        existing.auth = body.keys.auth
    else:
        db.add(models.PushSubscription(
            user_id=current_user.id, endpoint=body.endpoint,
            p256dh=body.keys.p256dh, auth=body.keys.auth,
        ))
    db.commit()
    return {"message": "Subscribed"}

@app.post("/push/unsubscribe")
def push_unsubscribe(body: schemas.PushUnsubscribeRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    db.query(models.PushSubscription).filter(
        models.PushSubscription.endpoint == body.endpoint,
        models.PushSubscription.user_id == current_user.id,
    ).delete()
    db.commit()
    return {"message": "Unsubscribed"}

# ─── SQL INTERFACE (ADMIN ONLY) ───────────────────────────────────────────────

from sql_engine import SimpleSQL

@app.post("/sql/query")
async def run_sql_query(request: Request, current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    require_dev_env()
    body = await request.json()
    query = body.get("query", "").strip()
    if not query:
        raise HTTPException(status_code=400, detail="No query provided")
    audit(db, current_user.id, "sql_query", "database", None, query[:200])
    db.commit()
    sql = SimpleSQL(db)
    return sql.execute_query(query)

@app.get("/tables")
def get_tables(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    require_dev_env()
    sql = SimpleSQL(db)
    return sql.execute_query("SHOW TABLES")

@app.post("/reset-db")
def reset_db(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    require_dev_env()
    for table in reversed(models.Base.metadata.sorted_tables):
        db.execute(table.delete())
    db.commit()
    return {"message": "Database reset"}

@app.post("/load-sample-data")
def load_sample(current_user: models.User = Depends(auth.require_admin), db: Session = Depends(get_db)):
    require_dev_env()
    sample_data.create_sample_data(db)
    return {"message": "Sample data loaded"}
