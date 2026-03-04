from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class Agent(BaseModel):
    id: int
    name: str
    category: str
    description: str
    icon: str
    price_monthly: float
    tasks_included: int
    features: str
    is_popular: bool
    total_purchases: int
    rating: float
    
    class Config:
        from_attributes = True

class PurchaseAgentRequest(BaseModel):
    agent_id: int

class PurchasedAgent(BaseModel):
    id: int
    user_id: int
    agent_id: int
    purchased_at: datetime
    is_active: bool
    tasks_used: int
    tasks_limit: int
    agent: Agent
    
    class Config:
        from_attributes = True

class ExecuteAgentRequest(BaseModel):
    purchased_agent_id: int
    input_text: str
    task_type: str

class UsageLog(BaseModel):
    id: int
    task_type: str
    input_text: str
    output_text: str
    tokens_used: int
    created_at: datetime
    
    class Config:
        from_attributes = True
