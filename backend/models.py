from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    company_name = Column(String, nullable=True)
    subscription_tier = Column(String, default="free")  # free, starter, professional, enterprise
    
    purchased_agents = relationship("PurchasedAgent", back_populates="user")
    usage_logs = relationship("UsageLog", back_populates="user")

class Agent(Base):
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True)  # email, scheduling, data_entry, support, content, research
    description = Column(Text)
    icon = Column(String)  # emoji or icon name
    price_monthly = Column(Float)
    tasks_included = Column(Integer)  # tasks per month
    features = Column(Text)  # JSON string of features
    is_popular = Column(Boolean, default=False)
    total_purchases = Column(Integer, default=0)
    rating = Column(Float, default=5.0)
    
    purchased_by = relationship("PurchasedAgent", back_populates="agent")

class PurchasedAgent(Base):
    __tablename__ = "purchased_agents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    purchased_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    tasks_used = Column(Integer, default=0)
    tasks_limit = Column(Integer)
    
    user = relationship("User", back_populates="purchased_agents")
    agent = relationship("Agent", back_populates="purchased_by")
    usage_logs = relationship("UsageLog", back_populates="purchased_agent")

class UsageLog(Base):
    __tablename__ = "usage_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    purchased_agent_id = Column(Integer, ForeignKey("purchased_agents.id"))
    task_type = Column(String)
    input_text = Column(Text)
    output_text = Column(Text)
    tokens_used = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="usage_logs")
    purchased_agent = relationship("PurchasedAgent", back_populates="usage_logs")
