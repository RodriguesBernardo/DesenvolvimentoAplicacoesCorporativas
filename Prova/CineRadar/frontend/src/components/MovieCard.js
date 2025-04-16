import React from 'react';
import { Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { StarFill, PlayCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const MovieCard = ({ movie, onTrailerClick }) => {
  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTrailerClick) onTrailerClick(movie.id);
  };

  return (
    <Card className="h-100 shadow-sm border-0 hover-effect position-relative">
      <Link 
        to={`/movie/${movie.id}`} 
        className="text-decoration-none text-reset"
        style={{ display: 'block', height: '100%' }}
      >
        <div className="position-relative" style={{ paddingTop: '150%' }}>
          <Card.Img
            variant="top"
            src={movie.poster_path 
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : 'https://via.placeholder.com/500x750?text=No+Poster'}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            alt={movie.title}
          />
          <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
            <StarFill className="text-warning me-1" />
            {movie.vote_average?.toFixed(1) || 'N/A'}
          </Badge>
        </div>
        
        <Card.Body className="d-flex flex-column">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>{movie.title}</Tooltip>}
          >
            <Card.Title className="fs-6 text-truncate">{movie.title}</Card.Title>
          </OverlayTrigger>
        </Card.Body>
      </Link>
    </Card>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    vote_average: PropTypes.number,
    release_date: PropTypes.string,
  }).isRequired,
  onTrailerClick: PropTypes.func,
};

export default MovieCard;