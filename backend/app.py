from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify

from models import Animal, db

# Initialize Flask app
app = Flask(__name__)

# Route to get animal by ID
@app.route('/animal/<int:animal_id>', methods=['GET'])
def get_animal(animal_id):
    animal = Animal.query.get(animal_id)
    if animal:
        return jsonify(animal.serialize()), 200
    else:
        return jsonify({'message': 'Animal not found'}), 404

# Route to delete animal by ID
@app.route('/animal/<int:animal_id>', methods=['DELETE'])
def delete_animal(animal_id):
    animal = Animal.query.get(animal_id)
    if animal:
        db.session.delete(animal)
        db.session.commit()
        return jsonify({'message': 'Animal deleted successfully'}), 200
    else:
        return jsonify({'message': 'Animal not found'}), 404

# Route to update animal by ID
@app.route('/animal/<int:animal_id>', methods=['PUT'])
def update_animal(animal_id):
    animal = Animal.query.get(animal_id)
    if animal:
        data = request.json
        animal.name = data.get('name', animal.name)
        animal.species = data.get('species', animal.species)
        animal.age = data.get('age', animal.age)
        animal.description = data.get('description', animal.description)
        animal.photo = data.get('photo', animal.photo)
        animal.adoption_status = data.get('adoption_status', animal.adoption_status)
        
        db.session.commit()
        return jsonify({'message': 'Animal updated successfully'}), 200
    else:
        return jsonify({'message': 'Animal not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
    