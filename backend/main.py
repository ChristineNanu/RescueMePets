from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data
import database
import hashlib

database.Base.metadata.create_all(bind=database.engine)

# Create sample data
db = database.SessionLocal()
sample_data.create_sample_data(db)
db.close()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username already exists
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Check if email already exists
    db_user_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    db_user = models.User(username=user.username, email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id}

@app.get("/animals")
def get_animals(db: Session = Depends(get_db)):
    animals = db.query(models.Animal).all()
    result = []
    for animal in animals:
        animal_dict = {
            "id": animal.id,
            "name": animal.name,
            "species": animal.species,
            "breed": animal.breed,
            "age": animal.age,
            "description": animal.description,
            "image": animal.image,
            "center_id": animal.center_id,
            "center": {
                "id": animal.center.id,
                "name": animal.center.name,
                "location": animal.center.location,
                "contact": animal.center.contact
            } if animal.center else None
        }
        result.append(animal_dict)
    return result

@app.get("/centers", response_model=list[schemas.Center])
def get_centers(db: Session = Depends(get_db)):
    centers = db.query(models.Center).all()
    return centers

@app.post("/adopt")
def adopt(adoption: schemas.AdoptionCreate, db: Session = Depends(get_db)):
    db_adoption = models.Adoption(**adoption.dict())
    db.add(db_adoption)
    db.commit()
    db.refresh(db_adoption)
    return {"message": "Adoption request submitted"}
