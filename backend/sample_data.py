from sqlalchemy.orm import Session
import models

def create_sample_data(db: Session):
    # Sample centers
    center1 = models.Center(name="Happy Tails Shelter", location="New York", contact="contact@happytails.com")
    center2 = models.Center(name="Paws Rescue", location="California", contact="info@pawsrescue.com")
    db.add(center1)
    db.add(center2)
    db.commit()

    # Sample animals
    animal1 = models.Animal(name="Buddy", species="Dog", breed="Golden Retriever", age=3, description="Friendly and playful", center_id=center1.id)
    animal2 = models.Animal(name="Whiskers", species="Cat", breed="Siamese", age=2, description="Curious and affectionate", center_id=center2.id)
    animal3 = models.Animal(name="Max", species="Dog", breed="Labrador", age=5, description="Loyal companion", center_id=center1.id)
    db.add(animal1)
    db.add(animal2)
    db.add(animal3)
    db.commit()
