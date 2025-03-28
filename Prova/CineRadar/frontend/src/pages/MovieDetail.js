import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  Tab, 
  Tabs, 
  Spinner, 
  Alert,
  ListGroup
} from 'react-bootstrap';
import { 
  StarFill, 
  Clock, 
  Calendar,
  PlayFill,
  Plus,
  Share,
  People,
  Globe
} from 'react-bootstrap-icons';
import { 
  getMovieDetails, 
  getSimilarMovies,
  getMovieCredits,
  getMovieVideos
} from '../services/api';
import MovieCard from '../components/MovieCard';
import CastCarousel from '../components/CastCarousel';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [credits, setCredits] = useState({ cast: [] });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [details, similarMovies, movieCredits, movieVideos] = await Promise.all([
          getMovieDetails(id),
          getSimilarMovies(id),
          getMovieCredits(id),
          getMovieVideos(id)
        ]);

        if (!details || !details.id) {
          throw new Error('Filme não encontrado');
        }
        
        setMovie(details);
        setSimilar(similarMovies || []);
        setCredits(movieCredits || { cast: [] });
        setVideos(movieVideos?.results?.filter(v => v.site === 'YouTube') || []);
      } catch (err) {
        setError(err.message || 'Erro ao carregar detalhes do filme');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Função para formatar dinheiro
  const formatMoney = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : 'Não disponível';
  };

  // Encontrar trailer principal
  const trailer = videos.find(v => v.type === 'Trailer') || videos[0];

  if (loading) return (
    <div className="d-flex justify-content-center my-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!movie) return <Alert variant="warning" className="m-4">Filme não encontrado</Alert>;

  return (
    <Container fluid className="movie-detail-container px-0">
      {/* Banner Superior com Backdrop */}
      <div 
        className="movie-backdrop"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(20,20,20,1)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
        }}
      >
        <Container className="backdrop-content">
          <Row className="align-items-end">
            <Col lg={4} className="mb-4">
              <Card className="movie-poster-card shadow-lg">
                <Card.Img
                  variant="top"
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="img-fluid"
                />
              </Card>
            </Col>
            
            <Col lg={8} className="text-white">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h1 className="movie-title">{movie.title}</h1>
                <Badge bg="warning" className="rating-badge">
                  <StarFill className="me-1" /> {movie.vote_average.toFixed(1)}
                </Badge>
              </div>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge bg="dark" className="d-flex align-items-center">
                  <Calendar className="me-1" /> {movie.release_date.substring(0, 4)}
                </Badge>
                <Badge bg="dark" className="d-flex align-items-center">
                  <Clock className="me-1" /> {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </Badge>
                {movie.genres.map(genre => (
                  <Badge key={genre.id} bg="primary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              <p className="movie-tagline">{movie.tagline}</p>
              
              <div className="d-flex gap-3 mb-4">
                {trailer && (
                  <Button 
                    variant="danger" 
                    size="lg"
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                  >
                    <PlayFill className="me-2" /> Assistir Trailer
                  </Button>
                )}
                <Button variant="outline-light" size="lg">
                  <Plus className="me-2" /> Minha Lista
                </Button>
                <Button variant="outline-light" size="lg">
                  <Share className="me-2" /> Compartilhar
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Conteúdo Principal */}
      <Container className="py-5">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4 detail-tabs"
        >
          <Tab eventKey="about" title="Sobre">
            <Row>
              <Col lg={8}>
                <h4 className="mb-4">Sinopse</h4>
                <p className="movie-overview">{movie.overview}</p>
                
                {/* Elenco Principal */}
                {credits && credits.cast.length > 0 && (
                  <div className="mt-5">
                    <h4 className="mb-4">Elenco Principal</h4>
                    <CastCarousel cast={credits.cast.slice(0, 10)} />
                  </div>
                )}
              </Col>
              
              <Col lg={4}>
                <Card className="shadow-sm mb-4">
                  <Card.Body>
                    <h5 className="mb-4">
                      <People className="me-2" /> Informações
                    </h5>
                    
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Status:</strong> {movie.status}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Idioma Original:</strong> {movie.original_language.toUpperCase()}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Orçamento:</strong> {formatMoney(movie.budget)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Bilheteria:</strong> {formatMoney(movie.revenue)}
                      </ListGroup.Item>
                      {movie.production_companies.length > 0 && (
                        <ListGroup.Item>
                          <strong>Produção:</strong>
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {movie.production_companies.map(company => (
                              <Badge key={company.id} bg="secondary">
                                {company.name}
                              </Badge>
                            ))}
                          </div>
                        </ListGroup.Item>
                      )}
                    </ListGroup>
                  </Card.Body>
                </Card>

                {/* Links Externos */}
                {movie.homepage && (
                  <Card className="shadow-sm mb-4">
                    <Card.Body>
                      <Button 
                        variant="outline-primary" 
                        href={movie.homepage} 
                        target="_blank"
                        className="w-100"
                      >
                        <Globe className="me-2" /> Site Oficial
                      </Button>
                    </Card.Body>
                  </Card>
                )}
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="cast" title="Elenco Completo">
            {credits && (
              <div className="mt-3">
                <h4 className="mb-4">Elenco</h4>
                <Row className="g-4">
                  {credits.cast.map(person => (
                    <Col key={person.id} xs={6} md={4} lg={3} xl={2}>
                      <Card className="h-100 shadow-sm">
                        <Card.Img
                          variant="top"
                          src={person.profile_path 
                            ? `https://image.tmdb.org/t/p/w200${person.profile_path}`
                            : '/placeholder-actor.jpg'}
                          alt={person.name}
                          className="img-fluid"
                        />
                        <Card.Body>
                          <Card.Title className="h6">{person.name}</Card.Title>
                          <Card.Text className="text-muted small">
                            {person.character}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Tab>
          
          <Tab eventKey="videos" title="Vídeos">
            {videos.length > 0 ? (
              <Row className="g-4 mt-3">
                {videos.map(video => (
                  <Col key={video.id} md={6} lg={4}>
                    <Card className="h-100 shadow-sm">
                      <div className="ratio ratio-16x9">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.key}`}
                          title={video.name}
                          allowFullScreen
                        />
                      </div>
                      <Card.Body>
                        <Card.Title>{video.name}</Card.Title>
                        <Card.Text className="text-muted small">
                          {video.type} • {video.size}p
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info" className="mt-3">
                Nenhum vídeo disponível para este filme.
              </Alert>
            )}
          </Tab>
        </Tabs>

        {/* Filmes Similares */}
        {similar.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-4">Filmes Similares</h4>
            <Row className="g-4">
              {similar.map(movie => (
                <Col key={movie.id} xs={6} md={4} lg={3} xl={2}>
                  <MovieCard movie={movie} />
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    </Container>
  );
};

export default MovieDetail;