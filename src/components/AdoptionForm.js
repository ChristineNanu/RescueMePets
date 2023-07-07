import React, { useState } from 'react';

function AdoptionForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Form submission logic goes here
    setIsSubmitted(true);
  };

  return (
    <div>
      {isSubmitted ? (
        <p>Form submitted!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" />

          <label htmlFor="email">Email:</label>
          <input type="email" id="email" />

          <label htmlFor="phone">Phone:</label>
          <input type="tel" id="phone" />

          <label htmlFor="animal">Animal:</label>
          <select id="animal">
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="bird">Bird</option>
          </select>

          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
}

export default AdoptionForm;
