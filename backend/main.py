from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, sample_data
from database import SessionLocal, engine, get_db
import hashlib, traceback
from daraja import stk_push, query_stk_status, b2c_payout

models.Base.metadata.create_all(bind=engine)
db = SessionLocal()
sample_data.create_sample_data(db)
db.close()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain: str, hashed: str) -> bool:
    return get_password_hash(plain) == hashed

def animal_to_dict(animal, favorites=None):
    return {
        "id": animal.id,
        "name": animal.name,
        "species": animal.species,
        "breed": animal.breed,
        "age": animal.age,
        "description": animal.description,
        "image": animal.image,
        "status": animal.status,
        "tags": animal.tags.split(",") if animal.tags else [],
        "center_id": animal.center_id,
        "center": {
            "id": animal.center.id,
            "name": animal.center.name,
            "location": animal.center.location,
            "contact": animal.center.contact
        } if animal.center else None,
        "is_favorited": animal.id in (favorites or []),
        "vaccinated": animal.vaccinated or False,
        "neutered": animal.neutered or False,
        "microchipped": animal.microchipped or False,
        "good_with_kids": animal.good_with_kids or False,
        "good_with_pets": animal.good_with_pets or False,
        "energy_level": animal.energy_level or "medium",
        "personality_badges": animal.personality_badges.split(",") if animal.personality_badges else [],
        "photos": [p.strip() for p in animal.photos.split(",") if p.strip()] if animal.photos else [],
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = models.User(username=user.username, email=user.email, password=get_password_hash(user.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Username not found. Please check your username or register.")
    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password. Please try again.")
    return {"message": "Login successful", "user_id": db_user.id, "username": db_user.username}

@app.get("/animals")
def get_animals(species: str = None, search: str = None, status: str = None, user_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Animal)
    if species and species != "all":
        query = query.filter(models.Animal.species == species)
    if status and status != "all":
        query = query.filter(models.Animal.status == status)
    if search:
        query = query.filter(
            models.Animal.name.ilike(f"%{search}%") |
            models.Animal.breed.ilike(f"%{search}%")
        )
    animals = query.all()
    favorites = []
    if user_id:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
        favorites = [f.animal_id for f in favs]
    return [animal_to_dict(a, favorites) for a in animals]

@app.get("/animals/{animal_id}")
def get_animal(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter(models.Animal.id == animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    favorites = []
    if user_id:
        favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
        favorites = [f.animal_id for f in favs]
    return animal_to_dict(animal, favorites)

@app.get("/centers/{center_id}/stories")
def get_center_stories(center_id: int, db: Session = Depends(get_db)):
    stories = db.query(models.RescueStory).filter(models.RescueStory.center_id == center_id).all()
    return [{
        "id": s.id,
        "adopter_name": s.adopter_name,
        "animal_name": s.animal_name,
        "animal_image": s.animal_image,
        "story": s.story,
        "adopted_on": s.adopted_on,
    } for s in stories]

@app.get("/centers")
def get_centers(db: Session = Depends(get_db)):
    centers = db.query(models.Center).all()
    result = []
    for c in centers:
        animal_count = db.query(models.Animal).filter(
            models.Animal.center_id == c.id,
            models.Animal.status == "available"
        ).count()
        result.append({
            "id": c.id, "name": c.name,
            "location": c.location, "contact": c.contact,
            "phone": c.phone or "",
            "website": c.website or "",
            "description": c.description or "",
            "opening_hours": c.opening_hours or "",
            "map_query": c.map_query or "",
            "animal_count": animal_count
        })
    return result

@app.post("/adopt")
def adopt(adoption: schemas.AdoptionCreate, db: Session = Depends(get_db)):
    animal = db.query(models.Animal).filter(models.Animal.id == adoption.animal_id).first()
    if not animal:
        raise HTTPException(status_code=404, detail="Animal not found")
    if animal.status == "adopted":
        raise HTTPException(status_code=400, detail="Animal already adopted")
    existing = db.query(models.Adoption).filter(
        models.Adoption.user_id == adoption.user_id,
        models.Adoption.animal_id == adoption.animal_id,
        models.Adoption.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending application for this animal")
    db_adoption = models.Adoption(
        user_id=adoption.user_id,
        animal_id=adoption.animal_id,
        message=adoption.message,
        read=False  
    )
    db.add(db_adoption)
    animal.status = "pending"
    db.commit()
    return {"message": "Adoption request submitted successfully", "adoption_id": db_adoption.id}

@app.get("/my-applications")
def get_my_applications(user_id: int, db: Session = Depends(get_db)):
    adoptions = db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id
    ).order_by(models.Adoption.created_at.desc()).all()
    return [{
        "id": a.id,
        "animal_id": a.animal_id,
        "animal_name": a.animal.name,
        "animal_image": a.animal.image,
        "animal_species": a.animal.species,
        "message": a.message,
        "status": a.status,
        "read": a.read if a.read is not None else True,
        "created_at": a.created_at.isoformat()
    } for a in adoptions]

@app.get("/notifications/unread-count")
def get_unread_count(user_id: int, db: Session = Depends(get_db)):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    count = db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id,
        models.Adoption.read == False
    ).count()
    return {"count": count}

@app.post("/notifications/mark-read")
def mark_notifications_read(user_id: int, db: Session = Depends(get_db)):
    if user_id <= 0:
        raise HTTPException(status_code=400, detail="Invalid user_id")
    db.query(models.Adoption).filter(
        models.Adoption.user_id == user_id,
        models.Adoption.read == False
    ).update({"read": True})
    db.commit()
    return {"message": "Marked as read"}

@app.patch("/applications/{adoption_id}")
def edit_application(adoption_id: int, user_id: int, body: schemas.ApplicationEdit, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(
        models.Adoption.id == adoption_id,
        models.Adoption.user_id == user_id,
        models.Adoption.status == "pending"
    ).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found or cannot be edited")
    adoption.message = body.message
    db.commit()
    return {"message": "Application updated"}

@app.delete("/applications/{adoption_id}")
def delete_application(adoption_id: int, user_id: int, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(
        models.Adoption.id == adoption_id,
        models.Adoption.user_id == user_id,
        models.Adoption.status == "pending"
    ).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found or cannot be withdrawn")
    adoption.animal.status = "available"
    db.delete(adoption)
    db.commit()
    return {"message": "Application withdrawn"}


def update_application_status(adoption_id: int, body: schemas.StatusUpdate, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Application not found")
    old_status = adoption.status
    adoption.status = body.status
    # Mark as unread so user gets notified
    if body.status in ("approved", "rejected") and old_status == "pending":
        adoption.read = False
        if body.status == "approved":
            adoption.animal.status = "adopted"
        elif body.status == "rejected":
            adoption.animal.status = "available"
    db.commit()
    return {"message": f"Status updated to {body.status}"}

@app.post("/favorites")
def toggle_favorite(req: schemas.FavoriteRequest, db: Session = Depends(get_db)):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == req.user_id,
        models.Favorite.animal_id == req.animal_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"favorited": False}
    fav = models.Favorite(user_id=req.user_id, animal_id=req.animal_id)
    db.add(fav)
    db.commit()
    return {"favorited": True}

@app.get("/favorites")
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    favs = db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()
    favorites = [f.animal_id for f in favs]
    animals = db.query(models.Animal).filter(models.Animal.id.in_(favorites)).all()
    return [animal_to_dict(a, favorites) for a in animals]

@app.post("/waitlist")
def join_waitlist(req: schemas.WaitlistRequest, db: Session = Depends(get_db)):
    existing = db.query(models.Waitlist).filter(
        models.Waitlist.user_id == req.user_id,
        models.Waitlist.animal_id == req.animal_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already on waitlist")
    db.add(models.Waitlist(user_id=req.user_id, animal_id=req.animal_id))
    db.commit()
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == req.animal_id).count()
    return {"message": "Added to waitlist", "count": count}

@app.get("/waitlist/{animal_id}")
def get_waitlist(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    count = db.query(models.Waitlist).filter(models.Waitlist.animal_id == animal_id).count()
    on_list = False
    if user_id:
        on_list = db.query(models.Waitlist).filter(
            models.Waitlist.animal_id == animal_id,
            models.Waitlist.user_id == user_id
        ).first() is not None
    return {"count": count, "on_waitlist": on_list}

@app.get("/profile")
def get_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "username": user.username, "email": user.email, "avatar": user.avatar or "", "wallet_balance": user.wallet_balance or 0}

@app.patch("/profile")
def update_profile(user_id: int, body: schemas.ProfileUpdate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.username and body.username != user.username:
        if db.query(models.User).filter(models.User.username == body.username).first():
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = body.username
    if body.email and body.email != user.email:
        if db.query(models.User).filter(models.User.email == body.email).first():
            raise HTTPException(status_code=400, detail="Email already taken")
        user.email = body.email
    if body.avatar is not None:
        user.avatar = body.avatar
    db.commit()
    return {"message": "Profile updated", "username": user.username, "email": user.email, "avatar": user.avatar}

@app.post("/wallet/topup")
def topup_wallet(user_id: int, body: schemas.WalletTopUp, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.wallet_balance = (user.wallet_balance or 0) + body.amount
    db.commit()
    return {"wallet_balance": user.wallet_balance}

@app.post("/sponsor")
def sponsor_animal(req: schemas.SponsorRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if (user.wallet_balance or 0) < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    existing = db.query(models.Sponsor).filter(
        models.Sponsor.user_id == req.user_id, models.Sponsor.animal_id == req.animal_id
    ).first()
    if existing:
        existing.amount = req.amount
    else:
        db.add(models.Sponsor(user_id=req.user_id, animal_id=req.animal_id, amount=req.amount))
    user.wallet_balance -= req.amount
    db.commit()
    total = sum(s.amount for s in db.query(models.Sponsor).filter(models.Sponsor.animal_id == req.animal_id).all())
    return {"message": "Sponsorship confirmed", "wallet_balance": user.wallet_balance, "total_sponsored": total}

@app.get("/sponsor/{animal_id}")
def get_sponsors(animal_id: int, user_id: int = None, db: Session = Depends(get_db)):
    sponsors = db.query(models.Sponsor).filter(models.Sponsor.animal_id == animal_id).all()
    total = sum(s.amount for s in sponsors)
    user_amount = next((s.amount for s in sponsors if s.user_id == user_id), 0) if user_id else 0
    return {"total": total, "count": len(sponsors), "user_amount": user_amount, "goal": 5000}

@app.get("/my-sponsorships")
def get_my_sponsorships(user_id: int, db: Session = Depends(get_db)):
    sponsors = db.query(models.Sponsor).filter(models.Sponsor.user_id == user_id).all()
    return [{"id": s.id, "animal_id": s.animal_id, "animal_name": s.animal.name, "animal_image": s.animal.image, "animal_species": s.animal.species, "amount": s.amount, "created_at": s.created_at.isoformat()} for s in sponsors]

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_animals": db.query(models.Animal).count(),
        "available": db.query(models.Animal).filter(models.Animal.status == "available").count(),
        # Use completed/approved adoptions from the Adoption table as the adopted metric
        "adopted": db.query(models.Adoption).filter(models.Adoption.status == "approved").count(),
        "centers": db.query(models.Center).count(),
    }

# ─── M-PESA PAYMENT ENDPOINTS ───────────────────────────────────────────────

@app.post("/pay/stk-push")
def initiate_stk_push(req: schemas.PaymentRequest, db: Session = Depends(get_db)):
    adoption = db.query(models.Adoption).filter(models.Adoption.id == req.adoption_id).first()
    if not adoption:
        raise HTTPException(status_code=404, detail="Adoption not found")
    if req.amount < 1 or req.amount > 100000:
        raise HTTPException(status_code=400, detail="Invalid payment amount")

    animal = adoption.animal
    description = f"Adoption fee for {animal.name}"
    account_ref = f"ADOPT-{animal.name[:8].upper()}-{req.adoption_id}"

    try:
        result = stk_push(
            phone=req.phone,
            amount=req.amount,
            account_ref=account_ref,
            description=description
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"M-PESA error: {str(e)}")

    if result.get("ResponseCode") != "0":
        raise HTTPException(status_code=400, detail=result.get("errorMessage", "STK Push failed"))

    payment = models.Payment(
        user_id=req.user_id,
        adoption_id=req.adoption_id,
        phone=req.phone,
        amount=req.amount,
        checkout_request_id=result.get("CheckoutRequestID"),
        merchant_request_id=result.get("MerchantRequestID"),
        status="pending"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "message": "STK Push sent! Check your phone and enter your M-PESA PIN.",
        "checkout_request_id": result.get("CheckoutRequestID"),
        "payment_id": payment.id
    }

@app.get("/pay/status/{payment_id}")
def check_payment_status(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    # If adoption is already approved, sync payment to completed
    if payment.status == "pending" and payment.adoption and payment.adoption.status == "approved":
        payment.status = "completed"
        db.commit()

    if payment.status == "pending" and payment.checkout_request_id:
        try:
            result = query_stk_status(payment.checkout_request_id)
            result_code = str(result.get("ResultCode", ""))
            print(f"STK Query result for payment {payment_id}: {result}")
            if result_code == "0":
                payment.status = "completed"
                payment.mpesa_receipt = payment.mpesa_receipt or result.get("MpesaReceiptNumber")
                if payment.adoption:
                    payment.adoption.status = "approved"
                db.commit()
        except Exception as e:
            print(f"STK query error for payment {payment_id}: {e}")

    return {
        "payment_id": payment.id,
        "status": payment.status,
        "amount": payment.amount,
        "phone": payment.phone,
        "mpesa_receipt": payment.mpesa_receipt,
        "created_at": payment.created_at.isoformat()
    }

# TEST ENDPOINT - For local testing without M-PESA callback
@app.post("/pay/test-complete/{payment_id}")
def test_complete_payment(payment_id: int, db: Session = Depends(get_db)):
    """Complete a payment manually for testing. Remove in production."""
    payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment.status = "completed"
    payment.mpesa_receipt = "TEST123456"
    if payment.adoption:
        payment.adoption.status = "approved"
    db.commit()
    
    return {"message": "Payment completed for testing", "payment_id": payment.id}

@app.post("/pay/callback")
async def mpesa_callback(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    print(f"M-PESA CALLBACK RECEIVED: {body}")
    try:
        stk_callback = body["Body"]["stkCallback"]
        checkout_request_id = stk_callback["CheckoutRequestID"]
        result_code = stk_callback["ResultCode"]
        print(f"Callback: checkout_id={checkout_request_id}, result_code={result_code}")

        payment = db.query(models.Payment).filter(
            models.Payment.checkout_request_id == checkout_request_id
        ).first()

        if not payment:
            print(f"Callback: no payment found for checkout_id={checkout_request_id}")
            return {"ResultCode": 0, "ResultDesc": "Accepted"}

        if result_code == 0:
            metadata = stk_callback.get("CallbackMetadata", {}).get("Item", [])
            receipt = next((i["Value"] for i in metadata if i["Name"] == "MpesaReceiptNumber"), None)
            payment.status = "completed"
            payment.mpesa_receipt = receipt
            if payment.adoption:
                payment.adoption.status = "approved"
                payment.adoption.read = False
            print(f"Callback: payment {payment.id} completed, receipt={receipt}")
        else:
            payment.status = "failed"
            print(f"Callback: payment {payment.id} failed with code {result_code}")

        db.commit()
    except Exception:
        traceback.print_exc()

    return {"ResultCode": 0, "ResultDesc": "Accepted"}

@app.get("/my-payments")
def get_my_payments(user_id: int, db: Session = Depends(get_db)):
    payments = db.query(models.Payment).filter(
        models.Payment.user_id == user_id
    ).order_by(models.Payment.created_at.desc()).all()
    return [{
        "id": p.id,
        "amount": p.amount,
        "phone": p.phone,
        "status": p.status,
        "mpesa_receipt": p.mpesa_receipt,
        "animal_name": p.adoption.animal.name if p.adoption else None,
        "created_at": p.created_at.isoformat()
    } for p in payments]

# ─── B2C PAYOUT ENDPOINT ─────────────────────────────────────────────────────

@app.post("/pay/b2c")
def initiate_b2c(req: schemas.B2CRequest, db: Session = Depends(get_db)):
    """B2C - Send money FROM business TO user phone (refunds/payouts)."""
    user = db.query(models.User).filter(models.User.id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        result = b2c_payout(
            phone=req.phone,
            amount=req.amount,
            occasion=req.occasion,
            remarks=req.remarks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"B2C error: {str(e)}")

    if result.get("ResponseCode") != "0":
        raise HTTPException(status_code=400, detail=result.get("errorMessage", "B2C payout failed"))

    return {
        "message": f"Payout of KES {req.amount} initiated to {req.phone}",
        "conversation_id": result.get("ConversationID"),
        "originator_conversation_id": result.get("OriginatorConversationID")
    }

@app.post("/pay/b2c-callback")
async def b2c_callback(request: Request, db: Session = Depends(get_db)):
    """Webhook - Safaricom calls this after B2C payout completes."""
    body = await request.json()
    try:
        result = body.get("Result", {})
        result_code = result.get("ResultCode")
        transaction_id = result.get("TransactionID")
        amount = None
        phone = None
        items = result.get("ResultParameters", {}).get("ResultParameter", [])
        for item in items:
            if item.get("Key") == "TransactionAmount":
                amount = item.get("Value")
            if item.get("Key") == "ReceiverPartyPublicName":
                phone = item.get("Value")
        print(f"B2C Callback: code={result_code}, txn={transaction_id}, amount={amount}, phone={phone}")
    except Exception:
        traceback.print_exc()
    return {"ResultCode": 0, "ResultDesc": "Accepted"}

# ─── SUPPORT TICKETS ────────────────────────────────────────────────────────

@app.post("/support")
def create_ticket(req: schemas.SupportTicketCreate, db: Session = Depends(get_db)):
    existing = db.query(models.SupportTicket).filter(
        models.SupportTicket.adoption_id == req.adoption_id,
        models.SupportTicket.status != "resolved"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="An open ticket already exists for this adoption")
    ticket = models.SupportTicket(user_id=req.user_id, adoption_id=req.adoption_id, issue=req.issue)
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"message": "Support ticket created", "ticket_id": ticket.id}

@app.get("/support")
def get_tickets(user_id: int, db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).filter(
        models.SupportTicket.user_id == user_id
    ).order_by(models.SupportTicket.created_at.desc()).all()
    return [{
        "id": t.id,
        "adoption_id": t.adoption_id,
        "animal_name": t.adoption.animal.name,
        "issue": t.issue,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "vet": {"name": t.vet.name, "clinic": t.vet.clinic, "phone": t.vet.phone, "specialization": t.vet.specialization} if t.vet else None
    } for t in tickets]

@app.get("/support/all")
def get_all_tickets(db: Session = Depends(get_db)):
    tickets = db.query(models.SupportTicket).order_by(models.SupportTicket.created_at.desc()).all()
    return [{
        "id": t.id,
        "adoption_id": t.adoption_id,
        "animal_name": t.adoption.animal.name,
        "center_id": t.adoption.animal.center_id,
        "issue": t.issue,
        "status": t.status,
        "created_at": t.created_at.isoformat(),
        "vet": {"name": t.vet.name, "clinic": t.vet.clinic, "phone": t.vet.phone, "specialization": t.vet.specialization} if t.vet else None
    } for t in tickets]

@app.patch("/support/{ticket_id}")
def update_ticket(ticket_id: int, body: schemas.TicketStatusUpdate, db: Session = Depends(get_db)):
    ticket = db.query(models.SupportTicket).filter(models.SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    ticket.status = body.status
    if body.vet_id:
        ticket.vet_id = body.vet_id
    db.commit()
    return {"message": "Ticket updated"}

@app.get("/vets")
def get_vets(center_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.Vet)
    if center_id:
        query = query.filter(models.Vet.center_id == center_id)
    return [{"id": v.id, "name": v.name, "clinic": v.clinic, "phone": v.phone, "specialization": v.specialization, "center_id": v.center_id} for v in query.all()]

@app.post("/quiz/match")
def quiz_match(answers: schemas.QuizAnswers, db: Session = Depends(get_db)):
    """Score all available animals against quiz answers and return top matches."""
    animals = db.query(models.Animal).filter(models.Animal.status == "available").all()
    scored = []
    for a in animals:
        score = 0
        # Activity level
        if answers.activity == "active" and a.energy_level == "high": score += 3
        elif answers.activity == "moderate" and a.energy_level == "medium": score += 3
        elif answers.activity == "relaxed" and a.energy_level == "low": score += 3
        elif answers.activity == "active" and a.energy_level == "medium": score += 1
        elif answers.activity == "relaxed" and a.energy_level == "medium": score += 1
        # Home type
        if answers.home == "house" and a.energy_level in ["high", "medium"]: score += 2
        if answers.home == "apartment" and a.energy_level == "low": score += 2
        if answers.home == "apartment" and a.species in ["Cat", "Rabbit", "Bird"]: score += 2
        if answers.home == "farm": score += 1
        # Kids
        if answers.has_kids and a.good_with_kids: score += 3
        if not answers.has_kids: score += 1  # neutral
        # Other pets
        if answers.has_pets and a.good_with_pets: score += 3
        if not answers.has_pets: score += 1
        # Experience
        if answers.experience == "first" and a.energy_level == "low": score += 2
        if answers.experience == "first" and a.species in ["Cat", "Rabbit", "Bird"]: score += 1
        if answers.experience == "experienced" and a.energy_level == "high": score += 2
        # Time at home
        if answers.time_home == "always" and a.energy_level == "high": score += 2
        if answers.time_home == "sometimes" and a.energy_level == "medium": score += 2
        if answers.time_home == "rarely" and a.energy_level == "low": score += 2
        if answers.time_home == "rarely" and a.species == "Cat": score += 2
        # Species preference
        if answers.species_pref != "any" and a.species == answers.species_pref: score += 4

        scored.append((score, a))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:6]
    return [animal_to_dict(a) for _, a in top]
