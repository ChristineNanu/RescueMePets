import React, { useEffect, useState } from 'react';

function Centers() {
  const [centers, setCenter] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/centers')
      .then(res => res.json())
      .then(centers => setCenter(centers))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <ul className="list-group">
        {centers.map(center => (
          <div className="center-container" key={center.id}>
            <p>Name: {center.name}</p>
            <p>Location: {center.location}</p>
          </div> 
        ))}
      </ul>
    </div>
  );
}

export default Centers;
