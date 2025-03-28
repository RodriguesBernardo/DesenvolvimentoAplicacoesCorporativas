import React from 'react';
import { Carousel } from 'react-bootstrap';

const CastCarousel = ({ cast }) => {
  return (
    <Carousel interval={null} indicators={false} variant="dark">
      {/* Dividir o elenco em grupos de 5 */}
      {[...Array(Math.ceil(cast.length / 5))].map((_, i) => (
        <Carousel.Item key={i}>
          <div className="d-flex justify-content-around">
            {cast.slice(i * 5, i * 5 + 5).map(person => (
              <div key={person.id} className="text-center mx-2">
                <img
                  src={person.profile_path 
                    ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                    : '/placeholder-actor.jpg'}
                  alt={person.name}
                  className="rounded-circle mb-2"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <h6 className="mb-1">{person.name}</h6>
                <small className="text-muted">{person.character}</small>
              </div>
            ))}
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CastCarousel;