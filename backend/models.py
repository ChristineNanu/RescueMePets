from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
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

class Animal(Base):
    __tablename__ = "animals"
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
