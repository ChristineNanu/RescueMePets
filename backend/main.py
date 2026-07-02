from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data
from database import SessionLocal, engine, get_db
import hashlib, traceback
from daraja import stk_push, query_stk_status, b2c_payout

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()
sample_data.create_sample_data(db)
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
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return get_password_hash(plain) == hashed

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
    }

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(username=user.username, email=user.email, password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id, "username": db_user.username}

@app.get("/animals")
def get_animals(species: str = None, search: str = None, status: str = None, user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Animal)
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
    if user_id:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
        favorites = [f.animal_id for f in favs]
    return [animal_to_dict(a, favorites) for a in animals]

@app.get("/animals/{animal_id}")
def get_animal(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    favorites = []
    if user_id:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
        favorites = [f.animal_id for f in favs]
    return animal_to_dict(animal, favorites)

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
def adopt(adoption: schemas.AdoptionCreate, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter(models.Animal.id == adoption.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    if animal.status == "adopted":
        raise HTTPException(status_code=400, detail="Animal already adopted")
    existing = db.query(models.Adoption).filter(
        models.Adoption.user_id == adoption.user_id,
        models.Adoption.animal_id == adoption.animal_id,
        models.Adoption.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending application for this animal")
    db_adoption = models.Adoption(
        user_id=adoption.user_id,
        animal_id=adoption.animal_id,
        message=adoption.message,
        read=False  # new applications unread until reviewed
    )
    db.add(db_adoption)
    animal.status = "pending"
    db.commit()
    return {"message": "Adoption request submitted successfully", "adoption_id": db_adoption.id}

@app.get("/my-applications")
def get_my_applications(user_id: int, db: Session = Depends(get_db)):
    adoptions = db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id
    ).order_by(models.Adoption.created_at.desc()).all()
    return [{
        "id": a.id,
        "animal_id": a.animal_id,
        "animal_name": a.animal.name,
        "animal_image": a.animal.image,
        "animal_species": a.animal.species,
        "message": a.message,
        "status": a.status,
        "read": a.read if a.read is not None else True,
        "created_at": a.created_at.isoformat()
    } for a in adoptions]

@app.get("/notifications/unread-count")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    count = db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id,
        models.Adoption.read == False
    ).count()
    return {"count": count}

@app.post("/notifications/mark-read")
def mark_notifications_read(user_id: int, db: Session = Depends(get_db)):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id,
        models.Adoption.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "Marked as read"}

# Temporary endpoint to simulate admin approving/rejecting — remove when admin panel is built
@app.patch("/applications/{adoption_id}/status")
def update_application_status(adoption_id: int, body: schemas.StatusUpdate, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found")
    old_status = adoption.status
    adoption.status = body.status
    # Mark as unread so user gets notified
    if body.status in ("approved", "rejected") and old_status == "pending":
        adoption.read = False
        if body.status == "approved":
            adoption.animal.status = "adopted"
        elif body.status == "rejected":
            adoption.animal.status = "available"
    db.commit()
    return {"message": f"Status updated to {body.status}"}

@app.post("/favorites")
def toggle_favorite(req: schemas.FavoriteRequest, db: Session = Depends(get_db)):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == req.user_id,
        models.Favorite.animal_id == req.animal_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    fav = models.Favorite(user_id=req.user_id, animal_id=req.animal_id)
    db.add(fav)
    db.commit()
    return {"favorited": True}

@app.get("/favorites")
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
    favorites = [f.animal_id for f in favs]
    animals = db.query(models.Animal).filter(models.Animal.id.in_(favorites)).all()
    return [animal_to_dict(a, favorites) for a in animals]

@app.post("/waitlist")
def join_waitlist(req: schemas.WaitlistRequest, db: Session = Depends(get_db)):
    existing = db.query(models.Waitlist).filter(
        models.Waitlist.user_id == req.user_id,
        models.Waitlist.animal_id == req.animal_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist")
    db.add(models.Waitlist(user_id=req.user_id, animal_id=req.animal_id))
    db.commit()
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == req.animal_id).count()
    return {"message": "Added to waitlist", "count": count}

@app.get("/waitlist/{animal_id}")
def get_waitlist(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == animal_id).count()
    on_list = False
    if user_id:
        on_list = db.query(models.Waitlist).filter(
            models.Waitlist.animal_id == animal_id,
            models.Waitlist.user_id == user_id
        ).first() is not None
    return {"count": count, "on_waitlist": on_list}

@app.get("/profile")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "email": user.email, "avatar": user.avatar or "", "wallet_balance": user.wallet_balance or 0}

@app.patch("/profile")
def update_profile(user_id: int, body: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
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

@app.post("/wallet/topup")
def topup_wallet(user_id: int, body: schemas.WalletTopUp, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.wallet_balance = (user.wallet_balance or 0) + body.amount
    db.commit()
    return {"wallet_balance": user.wallet_balance}

@app.post("/sponsor")
def sponsor_animal(req: schemas.SponsorRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if (user.wallet_balance or 0) < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    existing = db.query(models.Sponsor).filter(
        models.Sponsor.user_id == req.user_id, models.Sponsor.animal_id == req.animal_id
    ).first()
    if existing:
        existing.amount = req.amount
    else:
        db.add(models.Sponsor(user_id=req.user_id, animal_id=req.animal_id, amount=req.amount))
    user.wallet_balance -= req.amount
    db.commit()
    total = sum(s.amount for s in db.query(models.Sponsor).filter(models.Sponsor.animal_id == req.animal_id).all())
    return {"message": "Sponsorship confirmed", "wallet_balance": user.wallet_balance, "total_sponsored": total}

@app.get("/sponsor/{animal_id}")
def get_sponsors(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    sponsors = db.query(models.Sponsor).filter(models.Sponsor.animal_id == animal_id).all()
    total = sum(s.amount for s in sponsors)
    user_amount = next((s.amount for s in sponsors if s.user_id == user_id), 0) if user_id else 0
    return {"total": total, "count": len(sponsors), "user_amount": user_amount, "goal": 5000}

@app.get("/my-sponsorships")
def get_my_sponsorships(user_id: int, db: Session = Depends(get_db)):
    sponsors = db.query(models.Sponsor).filter(models.Sponsor.user_id == user_id).all()
    return [{"id": s.id, "animal_id": s.animal_id, "animal_name": s.animal.name, "animal_image": s.animal.image, "animal_species": s.animal.species, "amount": s.amount, "created_at": s.created_at.isoformat()} for s in sponsors]

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_animals": db.query(models.Animal).count(),
        "available": db.query(models.Animal).filter(models.Animal.status == "available").count(),
        "adopted": db.query(models.Animal).filter(models.Animal.status == "adopted").count(),
        "centers": db.query(models.Center).count(),
    }

# ─── M-PESA PAYMENT ENDPOINTS ───────────────────────────────────────────────

@app.post("/pay/stk-push")
def initiate_stk_push(req: schemas.PaymentRequest, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == req.adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Adoption not found")
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
        user_id=req.user_id,
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
def check_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status == "pending" and payment.checkout_request_id:
        try:
            result = query_stk_status(payment.checkout_request_id)
            result_code = result.get("ResultCode")
            # Only update if explicitly success (0) - ignore processing states
            if str(result_code) == "0":
                payment.status = "completed"
                if payment.adoption:
                    payment.adoption.status = "approved"
                db.commit()
            # Code 1032 = cancelled by user, 1037 = timeout - only then mark failed
            elif str(result_code) in ["1032", "1037", "1"]:
                payment.status = "failed"
                db.commit()
            # All other codes = still processing, leave as pending
        except Exception:
            pass  # Keep as pending if query fails

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
def test_complete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Complete a payment manually for testing. Remove in production."""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = "completed"
    payment.mpesa_receipt = "TEST123456"
    if payment.adoption:
        payment.adoption.status = "approved"
    db.commit()
    
    return {"message": "Payment completed for testing", "payment_id": payment.id}

@app.post("/pay/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    try:
        stk_callback = body["Body"]["stkCallback"]
        checkout_request_id = stk_callback["CheckoutRequestID"]
        result_code = stk_callback["ResultCode"]

        payment = db.query(models.Payment).filter(
            models.Payment.checkout_request_id == checkout_request_id
        ).first()

        if not payment:
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        if result_code == 0:
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            receipt = next((i["Value"] for i in metadata if i["Name"] == "MpesaReceiptNumber"), None)
            payment.status = "completed"
            payment.mpesa_receipt = receipt
            if payment.adoption:
                payment.adoption.status = "approved"
        else:
            payment.status = "failed"

        db.commit()
    except Exception:
        traceback.print_exc()

    return {"ResultCode": 0, "ResultDesc": "Accepted"}

@app.get("/my-payments")
def get_my_payments(user_id: int, db: Session = Depends(get_db)):
    payments = db.query(models.Payment).filter(
        models.Payment.user_id == user_id
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
def initiate_b2c(req: schemas.B2CRequest, db: Session = Depends(get_db)):
    """B2C - Send money FROM business TO user phone (refunds/payouts)."""
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
