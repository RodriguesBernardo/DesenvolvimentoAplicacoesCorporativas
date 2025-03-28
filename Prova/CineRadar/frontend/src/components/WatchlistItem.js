import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

const WatchlistItem = ({ movie, onRemove }) => {
  return (
    <Card className="mb-3">
      <div className="d-flex">
        <Card.Img 
          variant="top" 
          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} 
          style={{ width: '100px', objectFit: 'cover' }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title>{movie.title}</Card.Title>
          <Badge bg="secondary" className="mb-2 align-self-start">
            ⭐ {movie.vote_average}
          </Badge>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => onRemove(movie.id)}
            className="mt-auto align-self-start"
          >
            Remover
          </Button>
        </Card.Body>
      </div>
    </Card>
  );
};

export default WatchlistItem;