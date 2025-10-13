// import React, { useEffect, useState } from 'react';


// function AnimalList () {
//   const [animal, setAnimal] = useState([]) ;

//   useEffect(() => {
//       fetch('http://127.0.0.1:5000/animals')
//       .then(res => res.json())
//       .then(animal => setAnimal(animal))
//       .catch(error => console.error(error));
//     }, []);

//   return (
//     <div>
//       <ul className="list-group">
//         {animal.map(animal => (
//           <div className="animals-container" key={animal.id}>
//           <p>Name: {animal.name}</p>
//           <p>Gender: {animal.gender}</p>
//           <img src={animal.image} alt={animal.image}></img>
//           <p>Description: {animal.description}</p>
//         </div> 
//         ))}
//       </ul>
//     </div>
// );
// }
// export default AnimalList;

import React, { useEffect, useState } from 'react';

function AnimalList() {
  const [animals, setAnimals] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8001/animals')
      .then(res => res.json())
      .then(data => setAnimals(data))
      .catch(error => console.error(error));
  }, []);

  return (
    <div className="animal-list">
      {animals.map(animal => (
        <div className="animal-card" key={animal.id}>
          <p className="animal-name">Name: {animal.name}</p>
          <p className="animal-species">Species: {animal.species}</p>
          <p className="animal-breed">Breed: {animal.breed}</p>
          <p className="animal-age">Age: {animal.age}</p>
          <p className="animal-description">Description: {animal.description}</p>
        </div>
      ))}
    </div>
  );
}

export default AnimalList;
