import React, { useEffect, useState } from 'react';

function Centers() {
  const [centers, setCenter] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8002/centers')
      .then(res => res.json())
      .then(centers => setCenter(centers))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Rescue Centers</h1>
      <div className="centers-list">
        {centers.map(center => (
          <div className="center-card" key={center.id}>
            <h3 className="center-name">{center.name}</h3>
            <p><strong>Location:</strong> {center.location}</p>
            <p><strong>Contact:</strong> {center.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Centers;
