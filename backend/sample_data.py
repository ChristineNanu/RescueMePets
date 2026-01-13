from sqlalchemy.orm import Session
import models

def create_sample_data(db: Session):
    # Check if sample data already exists
    if db.query(models.Center).count() > 0:
        return  # Data already exists

    # Sample centers with unique names
    center1 = models.Center(name="Sunshine Animal Haven", location="Austin, Texas", contact="info@sunshineanimals.org")
    center2 = models.Center(name="Mountain View Pet Sanctuary", location="Denver, Colorado", contact="help@mountainviewpets.com")
    center3 = models.Center(name="Ocean Breeze Rescue Center", location="San Diego, California", contact="adopt@oceanbreezerescue.org")
    center4 = models.Center(name="Forest Friends Animal Shelter", location="Portland, Oregon", contact="contact@forestfriends.net")
    db.add(center1)
    db.add(center2)
    db.add(center3)
    db.add(center4)
    db.commit()

    # Sample animals with diverse names and backgrounds
    animals = [
        models.Animal(name="Luna", species="Dog", breed="Border Collie", age=2, description="Energetic and intelligent, loves to play fetch and learn new tricks", image="https://picsum.photos/400/300?random=10", center_id=center1.id),
        models.Animal(name="Oliver", species="Cat", breed="Maine Coon", age=4, description="Gentle giant with a fluffy coat, perfect lap cat", image="https://picsum.photos/400/300?random=11", center_id=center2.id),
        models.Animal(name="Zoe", species="Dog", breed="Australian Shepherd", age=1, description="Young and playful, great with kids and other dogs", image="https://picsum.photos/400/300?random=12", center_id=center3.id),
        models.Animal(name="Milo", species="Cat", breed="British Shorthair", age=3, description="Calm and affectionate, enjoys quiet companionship", image="https://picsum.photos/400/300?random=13", center_id=center1.id),
        models.Animal(name="Bella", species="Dog", breed="German Shepherd", age=5, description="Loyal and protective, well-trained and obedient", image="https://picsum.photos/400/300?random=14", center_id=center4.id),
        models.Animal(name="Smokey", species="Cat", breed="Russian Blue", age=6, description="Independent but loving, has beautiful silver-blue coat", image="https://picsum.photos/400/300?random=15", center_id=center2.id),
        models.Animal(name="Charlie", species="Dog", breed="Beagle", age=3, description="Friendly and curious, loves exploring and meeting new people", image="https://picsum.photos/400/300?random=16", center_id=center3.id),
        models.Animal(name="Cleo", species="Cat", breed="Persian", age=2, description="Elegant and graceful, enjoys being pampered and groomed", image="https://picsum.photos/400/300?random=17", center_id=center4.id),
        models.Animal(name="Rocky", species="Dog", breed="Pit Bull Mix", age=4, description="Strong but gentle, loves belly rubs and playing tug-of-war", image="https://picsum.photos/400/300?random=18", center_id=center1.id),
        models.Animal(name="Nala", species="Cat", breed="Tabby", age=1, description="Playful kitten with striking markings, very social", image="https://picsum.photos/400/300?random=19", center_id=center2.id),
        models.Animal(name="Duke", species="Dog", breed="Rottweiler", age=6, description="Mature and calm, excellent guard dog with a soft heart", image="https://picsum.photos/400/300?random=20", center_id=center3.id),
        models.Animal(name="Willow", species="Cat", breed="Ragdoll", age=3, description="Docile and relaxed, goes limp when picked up - true to breed name", image="https://picsum.photos/400/300?random=21", center_id=center4.id)
    ]
    
    for animal in animals:
        db.add(animal)
    
    db.commit()
