from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data
from database import SessionLocal, engine, get_db
import hashlib
import traceback

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

@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
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
