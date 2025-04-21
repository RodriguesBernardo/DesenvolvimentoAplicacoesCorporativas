import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Carousel, Card, Button, Badge, Spinner, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { StarFill, Clock, PlusCircle } from 'react-bootstrap-icons';
import { API } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {       // Uso de UseEffect para buscar dados dos filmes
    const fetchData = async () => {
      try {
        const [trendingData, actionData] = await Promise.all([   //promisse.all para buscar os dados de forma assíncrona
          API.getTrendingMovies(),      // Busca os filmes em alta pelo TMDB
          API.getMoviesByGenre(28)      // Busca os filmes do gerero de ação 
        ]);
        setTrending(trendingData);
        setActionMovies(actionData);
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToList = (e, movieId) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Filme ${movieId} adicionado à sua lista`);
  };

  if (loading) return (
    <div className="d-flex justify-content-center my-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <Container fluid className="px-4 py-3">
      <Carousel fade className="mb-5 shadow-lg rounded">
        {trending.slice(0, 5).map(movie => (
          <Carousel.Item key={movie.id} style={{ height: '60vh' }}>
            <Link 
              to={`/movie/${movie.id}`} 
              className="d-block h-100"
              style={{ textDecoration: 'none' }}
            >
              <div 
                className="w-100 h-100 bg-dark position-relative"
                style={{
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: 'pointer'
                }}
              >
                <div className="position-absolute bottom-0 start-0 p-5 text-white">
                  <h1 className="display-4 fw-bold">{movie.title}</h1>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <Badge bg="warning" className="d-flex align-items-center">
                      <StarFill className="me-2" /> {movie.vote_average?.toFixed(1) || 'N/A'}
                    </Badge>
                    <Badge bg="secondary" className="d-flex align-items-center">
                      <Clock className="me-2" /> {movie.release_date?.substring(0, 4) || 'N/A'}
                    </Badge>
                  </div>
                  <p className="lead d-none d-md-block">{movie.overview?.substring(0, 150) || 'Descrição não disponível'}...</p>
                  <div className="d-flex flex-wrap gap-3">
                    {user && (
                      <Button 
                        variant="outline-light" 
                        size="lg"
                        onClick={(e) => handleAddToList(e, movie.id)}
                      >
                        <PlusCircle className="me-2" /> Minha Lista
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </Carousel.Item>
        ))}
      </Carousel>

      <Section title="Em Destaque" movies={trending} />

      <Section title="Ação" movies={actionMovies} />
    </Container>
  );
};

const Section = ({ title, movies }) => (
  <div className="mb-5">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold">{title}</h2>
      <Button variant="outline-secondary">Ver Todos</Button>
    </div>
    <Row className="g-4">
      {movies.map(movie => (
        <Col key={movie.id} xs={6} md={4} lg={3} xl={2}>
          <MovieCard movie={movie} />
        </Col>
      ))}
    </Row>
  </div>
);

const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
      <Card className="h-100 shadow-sm hover-effect position-relative">
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
        <Card.Body>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip>{movie.title}</Tooltip>}
          >
            <Card.Title className="fs-6 text-truncate">{movie.title}</Card.Title>
          </OverlayTrigger>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {movie.release_date?.substring(0, 4) || 'N/A'}
            </small>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default Home;