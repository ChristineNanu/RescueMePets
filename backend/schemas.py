from pydantic import BaseModel, field_validator
from typing import Optional

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

class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

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
    animal_id: int
    message: str
    application_type: Optional[str] = "adopt"  # adopt | foster

class FavoriteRequest(BaseModel):
    animal_id: int

class PaymentRequest(BaseModel):
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
    user_id: int  # recipient of the payout, not the caller
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
    animal_id: int

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    avatar: Optional[str] = None

class QuizAnswers(BaseModel):
    activity: str
    home: str
    has_kids: bool
    has_pets: bool
    experience: str
    time_home: str
    species_pref: str

class SupportTicketCreate(BaseModel):
    adoption_id: int
    issue: str

class TicketStatusUpdate(BaseModel):
    status: str
    vet_id: Optional[int] = None
    resolution_note: Optional[str] = None

class TicketMessageCreate(BaseModel):
    message: str

class VetMessageCreate(BaseModel):
    name: str
    email: str
    message: str
    user_id: Optional[int] = None

class MedicalRecordCreate(BaseModel):
    animal_id: int
    record_type: str  # vaccination | treatment | checkup | medication | weight
    title: str
    description: Optional[str] = ""
    weight_kg: Optional[float] = None
    date: str  # ISO date string e.g. "2025-01-15"

class PostAdoptionCheckinCreate(BaseModel):
    adoption_id: int
    checkin_type: str   # 1_week | 1_month | 6_months
    wellbeing: str      # great | good | okay | struggling
    notes: Optional[str] = ""
    photo_url: Optional[str] = ""

class PushSubscriptionKeys(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKeys

class PushUnsubscribeRequest(BaseModel):
    endpoint: str

class FosterJournalEntryCreate(BaseModel):
    note: str
    photo_url: Optional[str] = ""
