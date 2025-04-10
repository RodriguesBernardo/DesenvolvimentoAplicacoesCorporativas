import React from 'react';
import { Card, Button, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { StarFill, PlayCircle } from 'react-bootstrap-icons';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const SeriesCard = ({ series, onTrailerClick }) => {
  if (!series || !series.id) return null;

  const handleTrailerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onTrailerClick) onTrailerClick(series.id);
  };

  const {
    id,
    poster_path,
    vote_average,
    first_air_date,
    name,
    original_name,
    title
  } = series;

  const displayName = name || original_name || title || 'Série sem título';

  return (
    <Card className="h-100 shadow-sm border-0 hover-effect position-relative">
      <Link 
        to={`/series/${id}`} 
        className="text-decoration-none text-reset"
        style={{ display: 'block', height: '100%' }}
      >
        <div className="position-relative" style={{ paddingTop: '150%' }}>
          <Card.Img
            variant="top"
            src={
              poster_path
                ? `https://image.tmdb.org/t/p/w500${poster_path}`
                : 'https://via.placeholder.com/500x750?text=Sem+imagem'
            }
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            alt={displayName}
            loading="lazy"
          />
          
          {vote_average !== undefined && (
            <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
              <StarFill className="text-warning me-1" />
              {vote_average.toFixed(1)}
            </Badge>
          )}
        </div>
        
        <Card.Body className="d-flex flex-column">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>{displayName}</Tooltip>}
          >
            <Card.Title className="fs-6 text-truncate">{displayName}</Card.Title>
          </OverlayTrigger>
          
          <div className="d-flex justify-content-between align-items-center mt-auto">
            <small className="text-muted">
              {first_air_date?.substring(0, 4) || 'N/A'}
            </small>
            
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={handleTrailerClick}
              className="ms-2"
            >
              <PlayCircle size={16} className="me-1" />
              Trailer
            </Button>
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
};

SeriesCard.propTypes = {
  series: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
    original_name: PropTypes.string,
    title: PropTypes.string,
    poster_path: PropTypes.string,
    vote_average: PropTypes.number,
    first_air_date: PropTypes.string,
  }).isRequired,
  onTrailerClick: PropTypes.func,
};

export default SeriesCard;