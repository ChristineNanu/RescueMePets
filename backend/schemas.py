from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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
    status: Optional[str] = "available"
    tags: Optional[str] = ""

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

class AdoptionOut(BaseModel):
    id: int
    animal_id: int
    message: str
    status: str
    created_at: datetime
    animal_name: Optional[str]
    animal_image: Optional[str]
    animal_species: Optional[str]
    class Config:
        from_attributes = True

class FavoriteRequest(BaseModel):
    user_id: int
    animal_id: int
