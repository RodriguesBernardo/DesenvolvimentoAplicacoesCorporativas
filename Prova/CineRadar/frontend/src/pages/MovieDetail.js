import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, Tab, Tabs, 
  Spinner, Alert, ListGroup, Modal, OverlayTrigger, Tooltip, Collapse,
  Toast
} from 'react-bootstrap';
import { 
  StarFill, Clock, Calendar, PlayFill, 
  People, Film, Award, InfoCircle, ChevronDown, ChevronUp
} from 'react-bootstrap-icons';
import { API } from '../services/api';
import MovieCard from '../components/MovieCard';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [credits, setCredits] = useState({ cast: [], crew: [] });
  const [videos, setVideos] = useState([]);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [showTrailerModal, setShowTrailerModal] = useState(false);
  const [selectedTrailer, setSelectedTrailer] = useState(null);
  const [expandedOverview, setExpandedOverview] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const TrailerButton = () => (
    <Button 
      variant="danger" 
      size="lg"
      onClick={() => setShowTrailerModal(true)}
      className="d-flex align-items-center trailer-button"
      style={{
        background: 'linear-gradient(to right, #ff0000, #ff4500)',
        border: 'none',
        boxShadow: '0 4px 8px rgba(255, 0, 0, 0.3)',
        transition: 'all 0.3s',
        fontWeight: 'bold'
      }}
    >
      <PlayFill className="me-2" /> Assistir Trailer
    </Button>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [details, similarMovies, movieCredits, movieVideos, watchProviders] = await Promise.all([
          API.getMovieDetails(id),
          API.getSimilarMovies(id),
          API.getMovieCredits(id),
          API.getMovieVideos(id),
          API.getWatchProviders(id)
        ]);

        if (!details?.id) {
          throw new Error('Filme não encontrado');
        }
        
        setMovie(details);
        setSimilar(similarMovies || []);
        setCredits(movieCredits || { cast: [], crew: [] });
        setVideos(filterVideos(movieVideos));
        setProviders(watchProviders?.BR || null);
        findBestTrailer(movieVideos);
        
      } catch (err) {
        setError(err.message || 'Erro ao carregar detalhes do filme');
        console.error('Error fetching movie details:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!movie?.id) return;
      
      try {
        const response = await API.checkMovieInWatchlist(movie.id);
        setInWatchlist(response.isInWatchlist);
      } catch (error) {
        console.error('Error checking watchlist:', error);
        setInWatchlist(false);
        if (error.response?.status !== 401) {
          showToastMessage('Erro temporário ao verificar watchlist');
        }
      }
    };
  
    checkWatchlistStatus();
  }, [movie]);

  const filterVideos = (videos) => {
    return videos?.filter(v => ['YouTube', 'Vimeo'].includes(v.site)) || [];
  };

  const findBestTrailer = (videos) => {
    if (!videos?.length) {
      setSelectedTrailer(null);
      return;
    }
    
    const trailerPriority = [
      v => v.official && v.iso_639_1 === 'pt' && (v.type.includes('Trailer') || v.name.includes('Trailer')),
      v => v.official && v.iso_639_1 === 'en' && (v.type.includes('Trailer') || v.name.includes('Trailer')),
      v => v.type.includes('Trailer') || v.name.toLowerCase().includes('trailer'),
      v => v.type.includes('Teaser') || v.name.toLowerCase().includes('teaser')
    ];
    
    for (const condition of trailerPriority) {
      const trailer = videos.find(condition);
      if (trailer) {
        setSelectedTrailer(trailer);
        return;
      }
    }
    
    setSelectedTrailer(videos[0]);
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await API.removeFromWatchlist(movie.id);
        showToastMessage('Removido da watchlist');
      } else {
        await API.addToWatchlist({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average
        });
        showToastMessage('Adicionado à watchlist');
      }
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      showToastMessage(error.response?.data?.error || 'Erro ao atualizar watchlist');
    }
  };

  const formatMoney = (amount) => {
    return amount ? `$${amount.toLocaleString()}` : 'Não disponível';
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getDirector = () => {
    return credits.crew?.find(person => person.job === 'Director')?.name || 'Desconhecido';
  };

  const getTopCast = () => {
    return credits.cast?.slice(0, 8) || [];
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center py-4">
          <h4>{error}</h4>
          <div className="d-flex justify-content-center gap-2 mt-3">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
            <Button variant="outline-secondary" onClick={() => navigate(-1)}>
              Voltar
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container className="my-5">
        <Alert variant="warning" className="text-center py-4">
          <h4>Filme não encontrado</h4>
          <Button variant="outline-warning" className="mt-3" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className="movie-detail-page" style={{ backgroundColor: '#141414', color: '#fff' }}>
      {/* Hero Section */}
      <div 
        className="movie-hero position-relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(20,20,20,1)), 
                           url(${movie.backdrop_path 
                             ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
                             : '/default-backdrop.jpg'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '4rem'
        }}
      >
        <Container>
          <Row className="align-items-end">
            <Col lg={4} className="mb-4">
              <Card className="movie-poster-card shadow-lg border-0">
                <Card.Img
                  variant="top"
                  src={movie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : '/default-poster.jpg'}
                  alt={movie.title}
                  className="img-fluid rounded-3"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                />
                {movie.vote_average > 0 && (
                  <div className="rating-circle" style={{
                    position: 'absolute',
                    bottom: '-1rem',
                    right: '1rem',
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#081c22',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid #21d07a'
                  }}>
                    <div className="rating-content d-flex align-items-center">
                      <StarFill className="text-warning me-1" />
                      <span style={{ fontWeight: 'bold' }}>{movie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
            
            <Col lg={8} className="text-white hero-content">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h1 className="movie-title">{movie.title}</h1>
                {movie.adult && (
                  <Badge bg="danger" className="age-rating">
                    18+
                  </Badge>
                )}
              </div>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge bg="dark" className="d-flex align-items-center">
                  <Calendar className="me-1" /> {movie.release_date.substring(0, 4)}
                </Badge>
                <Badge bg="dark" className="d-flex align-items-center">
                  <Clock className="me-1" /> {formatRuntime(movie.runtime)}
                </Badge>
                {movie.genres.map(genre => (
                  <Badge key={genre.id} bg="primary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              {movie.tagline && (
                <p className="movie-tagline fs-5 fst-italic text-muted">
                  "{movie.tagline}"
                </p>
              )}
              
              <div className="action-buttons d-flex flex-wrap gap-3 mb-4">
                {selectedTrailer && <TrailerButton />}
                <Button 
                  variant={inWatchlist ? "outline-light" : "primary"} 
                  size="lg"
                  onClick={toggleWatchlist}
                  className="watchlist-button"
                  style={{
                    fontWeight: 'bold',
                    transition: 'all 0.3s',
                    boxShadow: inWatchlist ? 'none' : '0 4px 8px rgba(13, 110, 253, 0.3)'
                  }}
                >
                  <StarFill className="me-2" /> 
                  {inWatchlist ? 'Na Sua Watchlist' : 'Adicionar à Watchlist'}
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-5">
        {/* Sinopse Expandível */}
        <div className="mb-5">
          <h4 className="mb-3">Sinopse</h4>
          <Collapse in={expandedOverview}>
            <div>
              <p className="lead">{movie.overview || 'Sinopse não disponível.'}</p>
            </div>
          </Collapse>
          {movie.overview && movie.overview.length > 150 && (
            <Button 
              variant="link" 
              onClick={() => setExpandedOverview(!expandedOverview)}
              className="p-0"
            >
              {expandedOverview ? (
                <>
                  <ChevronUp className="me-1" /> Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="me-1" /> Ler mais
                </>
              )}
            </Button>
          )}
        </div>

        {/* Seção combinada de informações */}
        <Row className="mb-5 g-4">
          <Col lg={8}>
            {/* Onde assistir - Versão compacta */}
            {providers && (providers.flatrate || providers.buy || providers.rent) && (
              <Card className="shadow-sm">
                <Card.Body className="p-3">
                  <div className="d-flex flex-wrap align-items-center gap-4">
                    <h5 className="mb-0 d-flex align-items-center">
                      <Film className="me-2 text-primary" /> Onde Assistir
                    </h5>
                    
                    {providers.flatrate && (
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-muted small">Streaming:</span>
                        <div className="d-flex gap-2">
                          {providers.flatrate.slice(0, 3).map(provider => (
                            <OverlayTrigger
                              key={provider.provider_id}
                              placement="top"
                              overlay={<Tooltip>{provider.provider_name}</Tooltip>}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="provider-logo-small"
                              />
                            </OverlayTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {providers.buy && (
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-muted small">Comprar:</span>
                        <div className="d-flex gap-2">
                          {providers.buy.slice(0, 2).map(provider => (
                            <OverlayTrigger
                              key={provider.provider_id}
                              placement="top"
                              overlay={<Tooltip>{provider.provider_name}</Tooltip>}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="provider-logo-small"
                              />
                            </OverlayTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {providers.rent && (
                      <div className="d-flex align-items-center">
                        <span className="me-2 text-muted small">Alugar:</span>
                        <div className="d-flex gap-2">
                          {providers.rent.slice(0, 2).map(provider => (
                            <OverlayTrigger
                              key={provider.provider_id}
                              placement="top"
                              overlay={<Tooltip>{provider.provider_name}</Tooltip>}
                            >
                              <img
                                src={`https://image.tmdb.org/t/p/w45${provider.logo_path}`}
                                alt={provider.provider_name}
                                className="provider-logo-small"
                              />
                            </OverlayTrigger>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            )}
            
            {/* Informações básicas */}
            <Card className="shadow-sm mt-4">
              <Card.Body className="p-3">
                <Row>
                  <Col md={6}>
                    <div className="info-item mb-3">
                      <span className="info-label">Diretor</span>
                      <span className="info-value">{getDirector()}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Lançamento</span>
                      <span className="info-value">
                        {new Date(movie.release_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Status</span>
                      <span className="info-value">{movie.status}</span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item mb-3">
                      <span className="info-label">Orçamento</span>
                      <span className="info-value">{formatMoney(movie.budget)}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Bilheteria</span>
                      <span className="info-value">{formatMoney(movie.revenue)}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Duração</span>
                      <span className="info-value">{formatRuntime(movie.runtime)}</span>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            {/* Seção de produção */}
            <Card className="shadow-sm h-100">
              <Card.Body className="p-3">
                <h5 className="mb-3 d-flex align-items-center">
                  <Award className="me-2 text-warning" /> Produção
                </h5>
                {movie.production_companies?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    {movie.production_companies.slice(0, 3).map(company => (
                      company.logo_path ? (
                        <OverlayTrigger
                          key={company.id}
                          placement="top"
                          overlay={<Tooltip>{company.name}</Tooltip>}
                        >
                          <img
                            src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                            alt={company.name}
                            className="company-logo-small img-fluid"
                          />
                        </OverlayTrigger>
                      ) : (
                        <Badge key={company.id} bg="secondary">
                          {company.name}
                        </Badge>
                      )
                    ))}
                    {movie.production_companies.length > 3 && (
                      <Badge bg="light" text="dark" className="ms-2">
                        +{movie.production_companies.length - 3}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="small text-muted mb-0">Informações de produção não disponíveis.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Tabs Section */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-5 detail-tabs"
          variant="pills"
        >
          <Tab eventKey="about" title="Detalhes">
            <Row className="mt-4">
              <Col md={6}>
                <h5 className="mb-3 d-flex align-items-center">
                  <InfoCircle className="me-2 text-info" /> Informações Técnicas
                </h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Título Original</span>
                    <span>{movie.original_title}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Idioma Original</span>
                    <span>{movie.original_language.toUpperCase()}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Popularidade</span>
                    <span>{movie.popularity.toFixed(0)}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              
              <Col md={6} className="mt-4 mt-md-0">
                <h5 className="mb-3">Gêneros</h5>
                <div className="d-flex flex-wrap gap-2">
                  {movie.genres.map(genre => (
                    <Badge key={genre.id} bg="primary" pill>
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>
          </Tab>
          
          <Tab eventKey="cast" title="Elenco">
            <div className="mt-4">
              <h5 className="mb-3 d-flex align-items-center">
                <People className="me-2 text-primary" /> Elenco Principal
              </h5>
              
              <Row className="g-4">
                {getTopCast().map(actor => (
                  <Col key={actor.id} xs={6} md={4} lg={3}>
                    <div className="cast-member">
                      <img
                        src={actor.profile_path 
                          ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                          : '/default-avatar.jpg'}
                        alt={actor.name}
                        className="cast-photo rounded mb-2 img-fluid"
                      />
                      <div>
                        <h6 className="mb-0">{actor.name}</h6>
                        <small className="text-muted">{actor.character}</small>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          </Tab>
          
          <Tab eventKey="media" title="Mídia">
            <div className="mt-4">
              {selectedTrailer && (
                <div className="text-center mb-5">
                  <Button 
                    variant="danger" 
                    size="lg"
                    onClick={() => setShowTrailerModal(true)}
                    className="d-flex align-items-center mx-auto px-4"
                  >
                    <PlayFill className="me-2" /> Assistir Trailer Principal
                  </Button>
                </div>
              )}
              
              {videos.length > 0 ? (
                <>
                  <h5 className="mb-4">Vídeos</h5>
                  <Row className="g-4 mb-5">
                    {videos.slice(0, 4).map(video => (
                      <Col key={video.id} md={6}>
                        <div 
                          className="video-card" 
                          onClick={() => {
                            setSelectedTrailer(video);
                            setShowTrailerModal(true);
                          }}
                        >
                          <div className="video-thumbnail">
                            <img
                              src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
                              alt={video.name}
                              className="img-fluid rounded"
                            />
                            <div className="play-overlay">
                              <PlayFill size={48} />
                            </div>
                          </div>
                          <div className="video-info mt-2">
                            <h6>{video.name}</h6>
                            <small className="text-muted">
                              {video.type} • {video.size}p
                            </small>
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </>
              ) : (
                <Alert variant="info" className="text-center py-4">
                  Nenhum vídeo disponível para este filme.
                </Alert>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Filmes Similares */}
        {similar.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-4">Você também pode gostar</h4>
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

      {/* Trailer Modal */}
      <Modal 
        show={showTrailerModal} 
        onHide={() => setShowTrailerModal(false)}
        size="xl"
        centered
        className="trailer-modal"
        contentClassName="bg-dark text-white"
      >
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title>
            {selectedTrailer?.name || `Trailer: ${movie.title}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedTrailer ? (
            <div className="ratio ratio-16x9">
              {selectedTrailer.site === 'YouTube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&rel=0`}
                  title={selectedTrailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              ) : (
                <iframe
                  src={`https://player.vimeo.com/video/${selectedTrailer.key}?autoplay=1`}
                  title={selectedTrailer.name}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
              )}
            </div>
          ) : (
            <Alert variant="warning" className="text-center py-4 m-4">
              <h4>Trailer não disponível</h4>
              <p>Não encontramos trailers para este filme no momento.</p>
            </Alert>
          )}
        </Modal.Body>
      </Modal>

      {/* Toast Notification */}
      <Toast 
        show={showToast} 
        onClose={() => setShowToast(false)}
        delay={3000} 
        autohide
        className="position-fixed bottom-0 end-0 m-3"
      >
        <Toast.Header className="bg-dark text-white">
          <strong className="me-auto">Watchlist</strong>
        </Toast.Header>
        <Toast.Body className="bg-light">{toastMessage}</Toast.Body>
      </Toast>
    </div>
  );
};

export default MovieDetail;