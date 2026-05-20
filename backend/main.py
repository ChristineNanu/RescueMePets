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
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
            "company_name": db_user.company_name,
            "subscription_tier": db_user.subscription_tier
        }
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
    agent = db.query(Agent).filter(Agent.id == request.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    existing = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == request.user_id,
        PurchasedAgent.agent_id == request.agent_id,
        PurchasedAgent.is_active == True
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Agent already purchased")
    
    purchased = PurchasedAgent(
        user_id=request.user_id,
        agent_id=request.agent_id,
        tasks_limit=agent.tasks_included
    )
    db.add(purchased)
    agent.total_purchases += 1
    db.commit()
    db.refresh(purchased)
    
    return {"message": "Agent purchased successfully", "id": purchased.id}

@app.get("/my-agents")
def get_my_agents(user_id: int, db: Session = Depends(get_db)):
    purchased = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == user_id,
        PurchasedAgent.is_active == True
    ).all()
    
    result = []
    for p in purchased:
        agent = p.agent
        result.append({
            "id": p.id,
            "agent": {
                "id": agent.id,
                "name": agent.name,
                "category": agent.category,
                "icon": agent.icon,
                "tasks_included": agent.tasks_included
            },
            "tasks_used": p.tasks_used,
            "tasks_limit": p.tasks_limit,
            "purchased_at": p.purchased_at.isoformat()
        })
    
    return result

@app.post("/execute-agent")
def execute_agent(request: ExecuteAgentRequest, db: Session = Depends(get_db)):
    purchased = db.query(PurchasedAgent).filter(
        PurchasedAgent.id == request.purchased_agent_id,
        PurchasedAgent.user_id == request.user_id
    ).first()
    
    if not purchased:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if purchased.tasks_used >= purchased.tasks_limit:
        raise HTTPException(status_code=403, detail="Task limit reached")
    
    result = f"✅ Task completed successfully!\n\nAgent: {purchased.agent.name}\nTask: {request.task_description}\n\nResult: Processed and executed as requested. In production, this would connect to real AI APIs."
    
    log = UsageLog(
        user_id=request.user_id,
        purchased_agent_id=purchased.id,
        task_description=request.task_description,
        result=result
    )
    db.add(log)
    purchased.tasks_used += 1
    db.commit()
    
    return {"result": result, "tasks_remaining": purchased.tasks_limit - purchased.tasks_used}

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

@app.get("/dashboard/stats")
def get_dashboard_stats(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    total_agents = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == user_id,
        PurchasedAgent.is_active == True
    ).count()
    
    total_tasks = db.query(UsageLog).filter(UsageLog.user_id == user_id).count()
    
    purchased_agents = db.query(PurchasedAgent).filter(
        PurchasedAgent.user_id == user_id,
        PurchasedAgent.is_active == True
    ).all()
    
    total_spent = sum(agent.agent.price_monthly for agent in purchased_agents)
    hours_saved = total_tasks * 0.5  # Estimate 30 min saved per task
    
    monthly_cost = 99 if user.subscription_tier == "starter" else 299 if user.subscription_tier == "professional" else 999
    
    return {
        "total_agents": total_agents,
        "total_tasks": total_tasks,
        "total_spent": total_spent,
        "hours_saved": int(hours_saved),
        "subscription_tier": user.subscription_tier.capitalize(),
        "monthly_cost": monthly_cost
    }

@app.get("/dashboard/activity")
def get_dashboard_activity(user_id: int, db: Session = Depends(get_db)):
    logs = db.query(UsageLog).filter(
        UsageLog.user_id == user_id
    ).order_by(UsageLog.executed_at.desc()).limit(10).all()
    
    result = []
    for log in logs:
        purchased = db.query(PurchasedAgent).filter(PurchasedAgent.id == log.purchased_agent_id).first()
        if purchased:
            result.append({
                "agent_name": purchased.agent.name,
                "agent_icon": purchased.agent.icon,
                "task_description": log.task_description,
                "executed_at": log.executed_at.isoformat()
            })
    
    return result
