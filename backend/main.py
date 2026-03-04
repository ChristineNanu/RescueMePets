from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from models import User, Agent, PurchasedAgent, UsageLog
from schemas import UserCreate, UserLogin, PurchaseAgentRequest, ExecuteAgentRequest
from sample_data import create_sample_data
from database import SessionLocal, engine, get_db, Base
import hashlib
import json

Base.metadata.create_all(bind=engine)

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

def get_password_hash(password):
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password, hashed_password):
    return get_password_hash(plain_password) == hashed_password

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already taken")
    
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already in use")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username, 
        email=user.email, 
        password=hashed_password,
        company_name=user.company_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Account created successfully"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {
        "message": "Login successful", 
        "user_id": db_user.id,
        "subscription_tier": db_user.subscription_tier
    }

@app.get("/agents")
def get_agents(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Agent)
    if category:
        query = query.filter(Agent.category == category)
    agents = query.all()
    
    # Parse features JSON for each agent
    result = []
    for agent in agents:
        agent_dict = {
            "id": agent.id,
            "name": agent.name,
            "category": agent.category,
            "description": agent.description,
            "icon": agent.icon,
            "price_monthly": agent.price_monthly,
            "tasks_included": agent.tasks_included,
            "features": json.loads(agent.features),
            "is_popular": agent.is_popular,
            "total_purchases": agent.total_purchases,
            "rating": agent.rating
        }
        result.append(agent_dict)
    
    return result

@app.get("/agents/{agent_id}")
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    return {
        "id": agent.id,
        "name": agent.name,
        "category": agent.category,
        "description": agent.description,
        "icon": agent.icon,
        "price_monthly": agent.price_monthly,
        "tasks_included": agent.tasks_included,
        "features": json.loads(agent.features),
        "is_popular": agent.is_popular,
        "total_purchases": agent.total_purchases,
        "rating": agent.rating
    }

@app.post("/purchase-agent")
def purchase_agent(request: PurchaseAgentRequest, db: Session = Depends(get_db)):
    user_id = 1  # TODO: Get from auth
    
    agent = db.query(Agent).filter(Agent.id == request.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if already purchased
    existing = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == user_id,
        PurchasedAgent.agent_id == request.agent_id,
        PurchasedAgent.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Agent already purchased")
    
    purchased = PurchasedAgent(
        user_id=user_id,
        agent_id=request.agent_id,
        tasks_limit=agent.tasks_included
    )
    db.add(purchased)
    
    # Update agent stats
    agent.total_purchases += 1
    
    db.commit()
    db.refresh(purchased)
    
    return {"message": "Agent purchased successfully", "id": purchased.id}

@app.get("/my-agents")
def get_my_agents(db: Session = Depends(get_db)):
    user_id = 1  # TODO: Get from auth
    
    purchased = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == user_id,
        PurchasedAgent.is_active == True
    ).all()
    
    result = []
    for p in purchased:
        agent = p.agent
        result.append({
            "purchased_id": p.id,
            "agent_id": agent.id,
            "name": agent.name,
            "category": agent.category,
            "icon": agent.icon,
            "tasks_used": p.tasks_used,
            "tasks_limit": p.tasks_limit,
            "purchased_at": p.purchased_at.isoformat()
        })
    
    return result

@app.post("/execute-agent")
def execute_agent(request: ExecuteAgentRequest, db: Session = Depends(get_db)):
    user_id = 1  # TODO: Get from auth
    
    purchased = db.query(PurchasedAgent).filter(
        PurchasedAgent.id == request.purchased_agent_id,
        PurchasedAgent.user_id == user_id
    ).first()
    
    if not purchased:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if purchased.tasks_used >= purchased.tasks_limit:
        raise HTTPException(status_code=403, detail="Task limit reached")
    
    # Simulate AI execution (in production, call OpenAI API here)
    output = f"AI Response: Processed '{request.input_text}' for {request.task_type}"
    
    # Log usage
    log = UsageLog(
        user_id=user_id,
        purchased_agent_id=purchased.id,
        task_type=request.task_type,
        input_text=request.input_text,
        output_text=output,
        tokens_used=100
    )
    db.add(log)
    
    # Update usage count
    purchased.tasks_used += 1
    
    db.commit()
    
    return {
        "output": output,
        "tasks_remaining": purchased.tasks_limit - purchased.tasks_used
    }

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    total_agents = db.query(Agent).count()
    total_purchases = db.query(PurchasedAgent).count()
    total_tasks = db.query(UsageLog).count()
    
    return {
        "total_agents": total_agents,
        "total_purchases": total_purchases,
        "total_tasks_executed": total_tasks
    }

@app.post("/reset-db")
def reset_database(db: Session = Depends(get_db)):
    try:
        db.query(UsageLog).delete()
        db.query(PurchasedAgent).delete()
        db.query(Agent).delete()
        db.query(User).delete()
        db.commit()
        return {"message": "Database reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load-sample-data")
def load_sample_data_endpoint(db: Session = Depends(get_db)):
    try:
        create_sample_data(db)
        return {"message": "Sample data loaded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
