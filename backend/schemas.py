from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class AnimalBase(BaseModel):
    name: str
    species: str
    breed: str
    age: int
    description: str
    image: str
    center_id: int

class Animal(AnimalBase):
    id: int
    center: Optional[dict]

    class Config:
        from_attributes = True

class CenterBase(BaseModel):
    name: str
    location: str
    contact: str

class Center(CenterBase):
    id: int

    class Config:
        from_attributes = True

class AdoptionCreate(BaseModel):
    user_id: int
    animal_id: int
    message: str
