from sqlalchemy.orm import Session
import models

def create_sample_data(db: Session):
    if db.query(models.Center).count() > 0:
        return

    center1 = models.Center(name="Happy Tails Shelter", location="New York, NY", contact="contact@happytails.com")
    center2 = models.Center(name="Paws Rescue", location="Los Angeles, CA", contact="info@pawsrescue.com")
    center3 = models.Center(name="Second Chance Animal Shelter", location="Chicago, IL", contact="hello@secondchance.com")
    center4 = models.Center(name="Forever Home Rescue", location="Austin, TX", contact="adopt@foreverhome.com")
    db.add_all([center1, center2, center3, center4])
    db.commit()

    animals = [
        # Dogs
        models.Animal(
            name="Buddy", species="Dog", breed="Golden Retriever", age=3,
            description="Buddy is a cheerful, energetic Golden Retriever who loves fetch, swimming, and cuddles. Great with kids and other dogs. House-trained and knows basic commands.",
            image="https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&q=80",
            center_id=center1.id
        ),
        models.Animal(
            name="Max", species="Dog", breed="German Shepherd", age=4,
            description="Max is a loyal, intelligent German Shepherd. He's protective, well-trained, and great with families. Loves long walks and learning new tricks.",
            image="https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=600&q=80",
            center_id=center1.id
        ),
        models.Animal(
            name="Bella", species="Dog", breed="Beagle", age=2,
            description="Bella is a sweet, curious Beagle with a great nose and an even better personality. She loves sniffing around the yard and snuggling on the couch.",
            image="https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&q=80",
            center_id=center1.id
        ),
        models.Animal(
            name="Charlie", species="Dog", breed="Labrador Retriever", age=1,
            description="Charlie is a playful, affectionate Labrador puppy. He's full of energy and loves everyone he meets. Perfect for an active family.",
            image="https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Luna", species="Dog", breed="Siberian Husky", age=3,
            description="Luna is a stunning Siberian Husky with piercing blue eyes. She's energetic, loves the outdoors, and is great with children. Needs an active home.",
            image="https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Rocky", species="Dog", breed="Bulldog", age=5,
            description="Rocky is a calm, gentle Bulldog who loves lounging around and short walks. Great with kids and very low maintenance. A true couch companion.",
            image="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Daisy", species="Dog", breed="Poodle", age=2,
            description="Daisy is an elegant, intelligent Poodle who loves to learn and show off her tricks. Hypoallergenic and great for families with allergies.",
            image="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80",
            center_id=center3.id
        ),
        models.Animal(
            name="Cooper", species="Dog", breed="Border Collie", age=2,
            description="Cooper is an incredibly smart Border Collie who excels at agility and loves mental challenges. Needs an active owner who can keep up with his energy.",
            image="https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600&q=80",
            center_id=center3.id
        ),
        models.Animal(
            name="Zeus", species="Dog", breed="Rottweiler", age=4,
            description="Zeus is a gentle giant Rottweiler who is incredibly loyal and loving with his family. Well-trained, calm indoors, and great with older children.",
            image="https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=600&q=80",
            center_id=center4.id
        ),
        models.Animal(
            name="Coco", species="Dog", breed="Dachshund", age=3,
            description="Coco is a feisty little Dachshund with a huge personality. She loves burrowing under blankets, playing with toys, and going on adventures.",
            image="https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600&q=80",
            center_id=center4.id
        ),

        # Cats
        models.Animal(
            name="Whiskers", species="Cat", breed="Siamese", age=2,
            description="Whiskers is a talkative, affectionate Siamese who loves being the center of attention. She'll follow you around the house and chat all day long.",
            image="https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80",
            center_id=center1.id
        ),
        models.Animal(
            name="Oliver", species="Cat", breed="Maine Coon", age=3,
            description="Oliver is a majestic Maine Coon with a fluffy coat and gentle giant personality. He loves being brushed and will happily sit on your lap for hours.",
            image="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Mittens", species="Cat", breed="Persian", age=4,
            description="Mittens is a calm, regal Persian cat who loves quiet environments. She enjoys being pampered and is perfect for a relaxed household.",
            image="https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Shadow", species="Cat", breed="British Shorthair", age=2,
            description="Shadow is a cool, independent British Shorthair with a plush grey coat. He's easygoing, gets along with everyone, and loves window watching.",
            image="https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&q=80",
            center_id=center3.id
        ),
        models.Animal(
            name="Cleo", species="Cat", breed="Abyssinian", age=1,
            description="Cleo is a playful, athletic Abyssinian kitten who loves to climb and explore. She's curious about everything and will keep you entertained all day.",
            image="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80",
            center_id=center3.id
        ),
        models.Animal(
            name="Leo", species="Cat", breed="Ragdoll", age=3,
            description="Leo is a floppy, docile Ragdoll who goes limp when you pick him up. He's incredibly gentle, loves cuddles, and is great with children.",
            image="https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&q=80",
            center_id=center4.id
        ),
        models.Animal(
            name="Nala", species="Cat", breed="Bengal", age=2,
            description="Nala is a wild-looking Bengal cat with a heart of gold. She loves interactive play, water, and showing off her beautiful spotted coat.",
            image="https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&q=80",
            center_id=center4.id
        ),

        # Rabbits
        models.Animal(
            name="Thumper", species="Rabbit", breed="Holland Lop", age=1,
            description="Thumper is an adorable Holland Lop with floppy ears and a gentle nature. He loves fresh veggies, hopping around, and being gently petted.",
            image="https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&q=80",
            center_id=center1.id
        ),
        models.Animal(
            name="Snowball", species="Rabbit", breed="Angora", age=2,
            description="Snowball is a fluffy white Angora rabbit who looks like a cloud. She's calm, loves being groomed, and is perfect for a quiet home.",
            image="https://images.unsplash.com/photo-1452857297128-d9c29adba80b?w=600&q=80",
            center_id=center3.id
        ),

        # Birds
        models.Animal(
            name="Kiwi", species="Bird", breed="Budgerigar", age=1,
            description="Kiwi is a cheerful green budgie who loves to sing and mimic sounds. He's social, easy to care for, and will brighten up any room.",
            image="https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80",
            center_id=center2.id
        ),
        models.Animal(
            name="Mango", species="Bird", breed="Cockatiel", age=2,
            description="Mango is a friendly cockatiel who loves whistling tunes and sitting on shoulders. He's hand-tamed and great for first-time bird owners.",
            image="https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&q=80",
            center_id=center4.id
        ),
    ]

    db.add_all(animals)
    db.commit()
