from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from models import User, Animal as AnimalModel, Center as CenterModel, Adoption
from schemas import UserCreate, UserLogin, Animal, Center, AdoptionCreate, AnimalCreate, AnimalUpdate
from sample_data import create_sample_data
from database import SessionLocal, engine, get_db, Base
from sql_engine import SimpleSQL
import hashlib

Base.metadata.create_all(bind=engine)

# Create sample data
db = SessionLocal()
create_sample_data(db)
db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# password hashing 
def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # make sure username isn't taken
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")

    
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use")

    # create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user_id": db_user.id}

@app.get("/animals")
def get_animals(db: Session = Depends(get_db)):
    animals = db.query(AnimalModel).all()
    result = []
    # build response with center info included
    for animal in animals:
        animal_data = {
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
        result.append(animal_data)
    return result

@app.get("/centers", response_model=list[Center])
def get_centers(db: Session = Depends(get_db)):
    try:
        centers = db.query(CenterModel).all()
        return centers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/adopt")
def adopt(adoption: AdoptionCreate, db: Session = Depends(get_db)):
    db_adoption = Adoption(**adoption.dict())
    db.add(db_adoption)
    db.commit()
    db.refresh(db_adoption)
    return {"message": "Adoption request submitted"}

@app.post("/animals")
def create_animal(animal: AnimalCreate, db: Session = Depends(get_db)):
    try:
        # Convert to dict and handle empty image
        animal_data = animal.dict()
        if not animal_data.get('image'):
            animal_data['image'] = f"https://picsum.photos/400/300?random={animal_data['center_id']}"
        
        db_animal = AnimalModel(**animal_data)
        db.add(db_animal)
        db.commit()
        db.refresh(db_animal)
        return {"message": "Animal created successfully", "id": db_animal.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating animal: {str(e)}")

@app.put("/animals/{animal_id}")
def update_animal(animal_id: int, animal: AnimalUpdate, db: Session = Depends(get_db)):
    db_animal = db.query(AnimalModel).filter(AnimalModel.id == animal_id).first()
    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    update_data = animal.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_animal, field, value)
    
    db.commit()
    db.refresh(db_animal)
    return {"message": "Animal updated successfully"}

@app.delete("/animals/{animal_id}")
def delete_animal(animal_id: int, db: Session = Depends(get_db)):
    db_animal = db.query(AnimalModel).filter(AnimalModel.id == animal_id).first()
    if not db_animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    
    db.delete(db_animal)
    db.commit()
    return {"message": "Animal deleted successfully"}

@app.get("/test")
def test_endpoint():
    return {"message": "Backend is working!", "timestamp": "2024"}

@app.post("/sql")
def execute_sql(request: dict, db: Session = Depends(get_db)):
    query = request.get('query', '')
    if not query:
        return {"error": "No query provided"}
    
    sql_engine = SimpleSQL(db)
    result = sql_engine.execute_query(query)
    return result

@app.get("/tables")
def get_tables():
    # Return info about our database schema
    return {
        "tables": {
            "users": {
                "columns": ["id", "username", "email", "password"],
                "primary_key": "id",
                "unique_keys": ["username", "email"]
            },
            "animals": {
                "columns": ["id", "name", "species", "breed", "age", "description", "image", "center_id"],
                "primary_key": "id",
                "foreign_keys": {"center_id": "centers.id"}
            },
            "centers": {
                "columns": ["id", "name", "location", "contact"],
                "primary_key": "id"
            },
            "adoptions": {
                "columns": ["id", "user_id", "animal_id", "message", "created_at"],
                "primary_key": "id",
                "foreign_keys": {"user_id": "users.id", "animal_id": "animals.id"}
            }
        }
    }
