from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data
from database import SessionLocal, engine, get_db
import hashlib, traceback

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
        read=True  # own submission is always read
    )
    db.add(db_adoption)
    animal.status = "pending"
    db.commit()
    return {"message": "Adoption request submitted successfully"}

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
    count = db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id,
        models.Adoption.read == False
    ).count()
    return {"count": count}

@app.post("/notifications/mark-read")
def mark_notifications_read(user_id: int, db: Session = Depends(get_db)):
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

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_animals": db.query(models.Animal).count(),
        "available": db.query(models.Animal).filter(models.Animal.status == "available").count(),
        "adopted": db.query(models.Animal).filter(models.Animal.status == "adopted").count(),
        "centers": db.query(models.Center).count(),
    }

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
