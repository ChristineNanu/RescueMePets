from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import database
Base = database.Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    avatar = Column(String, default="")
    wallet_balance = Column(Integer, default=0)
    role = Column(String, default="adopter")  # adopter | vet | admin
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class Animal(Base):
    __tablename__ = "animals"
    __table_args__ = (
        Index("ix_animals_species", "species"),
        Index("ix_animals_status", "status"),
        Index("ix_animals_center_id", "center_id"),
    )
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    species = Column(String)
    breed = Column(String)
    age = Column(Integer)
    description = Column(Text)
    image = Column(String)
    status = Column(String, default="available")
    tags = Column(String, default="")
    center_id = Column(Integer, ForeignKey("centers.id"))
    center = relationship("Center")
    vaccinated = Column(Boolean, default=False)
    neutered = Column(Boolean, default=False)
    microchipped = Column(Boolean, default=False)
    good_with_kids = Column(Boolean, default=False)
    good_with_pets = Column(Boolean, default=False)
    energy_level = Column(String, default="medium")
    personality_badges = Column(String, default="")
    photos = Column(String, default="")  # comma-separated extra photo URLs
    sponsored = Column(Boolean, default=False)
    deleted_at = Column(DateTime(timezone=True), nullable=True)

class CenterSubscription(Base):
    __tablename__ = "center_subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("centers.id"), unique=True)
    plan = Column(String, default="free")  # free, pro, premium
    sponsored_slots = Column(Integer, default=0)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    center = relationship("Center")

class Center(Base):
    __tablename__ = "centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    contact = Column(String)
    phone = Column(String, default="")
    website = Column(String, default="")
    description = Column(Text, default="")
    opening_hours = Column(String, default="")
    map_query = Column(String, default="")  # used for Google Maps embed

class Adoption(Base):
    __tablename__ = "adoptions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    animal_id = Column(Integer, ForeignKey("animals.id"))
    message = Column(Text)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read = Column(Boolean, default=True)   # False = unread notification
    user = relationship("User")
    animal = relationship("Animal")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    animal_id = Column(Integer, ForeignKey("animals.id"))
    animal = relationship("Animal")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    adoption_id = Column(Integer, ForeignKey("adoptions.id"), nullable=True)
    phone = Column(String)
    amount = Column(Integer)
    checkout_request_id = Column(String, nullable=True)
    merchant_request_id = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, completed, failed
    mpesa_receipt = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    adoption = relationship("Adoption")

class RescueStory(Base):
    __tablename__ = "rescue_stories"
    id = Column(Integer, primary_key=True, index=True)
    center_id = Column(Integer, ForeignKey("centers.id"))
    animal_id = Column(Integer, ForeignKey("animals.id"), nullable=True)
    adopter_name = Column(String)          # e.g. "The Kamau Family"
    animal_name = Column(String)           # denormalised for speed
    animal_image = Column(String)
    story = Column(Text)
    adopted_on = Column(String)            # e.g. "March 2025"
    center = relationship("Center")
    animal = relationship("Animal")

class Waitlist(Base):
    __tablename__ = "waitlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    animal_id = Column(Integer, ForeignKey("animals.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    animal = relationship("Animal")

class Sponsor(Base):
    __tablename__ = "sponsors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    animal_id = Column(Integer, ForeignKey("animals.id"))
    amount = Column(Integer) 
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    animal = relationship("Animal")

class Vet(Base):
    __tablename__ = "vets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    clinic = Column(String)
    phone = Column(String)
    specialization = Column(String, default="General")
    center_id = Column(Integer, ForeignKey("centers.id"))
    center = relationship("Center")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, unique=True)
    user = relationship("User")

class VetMessage(Base):
    __tablename__ = "vet_messages"
    id = Column(Integer, primary_key=True, index=True)
    vet_id = Column(Integer, ForeignKey("vets.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String)
    email = Column(String)
    message = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    vet = relationship("Vet")
    user = relationship("User")

class TicketMessage(Base):
    __tablename__ = "ticket_messages"
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("support_tickets.id"))
    sender_id = Column(Integer, ForeignKey("users.id"))
    sender_role = Column(String)  # vet | adopter
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sender = relationship("User")
    ticket = relationship("SupportTicket")

class MedicalRecord(Base):
    __tablename__ = "medical_records"
    id          = Column(Integer, primary_key=True, index=True)
    animal_id   = Column(Integer, ForeignKey("animals.id"))
    vet_id      = Column(Integer, ForeignKey("vets.id"), nullable=True)
    record_type = Column(String)   # vaccination | treatment | checkup | medication | weight
    title       = Column(String)
    description = Column(Text, default="")
    weight_kg   = Column(Float, nullable=True)
    date        = Column(String)   # ISO date string
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    animal      = relationship("Animal")
    vet         = relationship("Vet")

class PostAdoptionCheckin(Base):
    __tablename__ = "post_adoption_checkins"
    id           = Column(Integer, primary_key=True, index=True)
    adoption_id  = Column(Integer, ForeignKey("adoptions.id"))
    user_id      = Column(Integer, ForeignKey("users.id"))
    checkin_type = Column(String)   # 1_week | 1_month | 6_months
    wellbeing    = Column(String)   # great | good | okay | struggling
    notes        = Column(Text, default="")
    photo_url    = Column(String, default="")
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    adoption     = relationship("Adoption")
    user         = relationship("User")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String)          # e.g. delete_animal, approved_application, sql_query
    entity = Column(String)          # e.g. animal, adoption, database
    entity_id = Column(Integer, nullable=True)
    detail = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    adoption_id = Column(Integer, ForeignKey("adoptions.id"))
    issue = Column(Text)
    status = Column(String, default="open")  # open, in_progress, resolved
    resolution_note = Column(Text, nullable=True)
    vet_read = Column(Boolean, default=True)  # False = new unread ticket for vet
    vet_id = Column(Integer, ForeignKey("vets.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User")
    adoption = relationship("Adoption")
    vet = relationship("Vet")
