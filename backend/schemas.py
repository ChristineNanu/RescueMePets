from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class VetRegister(BaseModel):
    username: str
    email: str
    password: str
    name: str
    clinic: str
    phone: str
    specialization: str = "General"
    center_id: int

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
    vaccinated: Optional[bool] = False
    neutered: Optional[bool] = False
    microchipped: Optional[bool] = False
    good_with_kids: Optional[bool] = False
    good_with_pets: Optional[bool] = False
    energy_level: Optional[str] = "medium"
    personality_badges: Optional[str] = ""
    sponsored: Optional[bool] = False

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

class PaymentRequest(BaseModel):
    user_id: int
    adoption_id: int
    phone: str
    amount: int

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        phone = v.strip().replace('+', '').replace(' ', '')
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        if not phone.startswith('254'):
            phone = '254' + phone
        if len(phone) != 12:
            raise ValueError('Invalid phone number. Use format: 0712345678 or 254712345678')
        return phone

    @field_validator('amount')
    @classmethod
    def validate_amount(cls, v):
        if v < 1:
            raise ValueError('Amount must be at least KES 1')
        if v > 150000:
            raise ValueError('Amount cannot exceed KES 150,000')
        return v

class B2CRequest(BaseModel):
    user_id: int
    phone: str
    amount: int
    occasion: str = "Adoption Refund"
    remarks: str = "RescueMePets refund"

    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        phone = v.strip().replace('+', '').replace(' ', '')
        if phone.startswith('0'):
            phone = '254' + phone[1:]
        if not phone.startswith('254'):
            phone = '254' + phone
        if len(phone) != 12:
            raise ValueError('Invalid phone number')
        return phone

class PaymentCallback(BaseModel):
    Body: dict

class ApplicationEdit(BaseModel):
    message: str

class StatusUpdate(BaseModel):
    status: str  # approved, rejected

class WaitlistRequest(BaseModel):
    user_id: int
    animal_id: int

class SponsorRequest(BaseModel):
    user_id: int
    animal_id: int
    amount: int  # in cents e.g. 500 = $5

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class WalletTopUp(BaseModel):
    amount: int  # in cents

class QuizAnswers(BaseModel):
    activity: str
    home: str
    has_kids: bool
    has_pets: bool
    experience: str
    time_home: str
    species_pref: str

class SupportTicketCreate(BaseModel):
    user_id: int
    adoption_id: int
    issue: str

class TicketStatusUpdate(BaseModel):
    status: str
    vet_id: Optional[int] = None

class VetMessageCreate(BaseModel):
    name: str
    email: str
    message: str
    user_id: Optional[int] = None
