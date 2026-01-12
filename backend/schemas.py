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
    image: Optional[str] = None
    center_id: int

class AnimalCreate(AnimalBase):
    pass

class AnimalUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    age: Optional[int] = None
    description: Optional[str] = None
    image: Optional[str] = None
    center_id: Optional[int] = None

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
