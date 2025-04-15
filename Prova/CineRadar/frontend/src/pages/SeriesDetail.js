import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Button, Badge, Tab, Tabs, 
  Spinner, Alert, ListGroup, Modal, OverlayTrigger, Tooltip, Collapse,
  Toast
} from 'react-bootstrap';
import { 
  StarFill, Clock, Calendar, PlayFill, Tv,
  People, Film, Award, InfoCircle, ChevronDown, ChevronUp
} from 'react-bootstrap-icons';
import { API } from '../services/api';
import SeriesCard from '../components/SeriesCard';

const SerieDetail = () => {
  const { id } = useParams();
  const [serie, setSerie] = useState(null);
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
  const [seasons, setSeasons] = useState([]);
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
        
        const [details, similarSeries, serieCredits, serieVideos, watchProviders] = await Promise.all([
          API.getTVSeriesDetails(id),
          API.getSimilarTVSeries(id),
          API.getTVSeriesCredits(id),
          API.getTVSeriesVideos(id),
          API.getTVSeriesWatchProviders(id)
        ]);

        if (!details || !details.id) {
          throw new Error('Série não encontrada');
        }
        
        setSerie(details);
        setSimilar(similarSeries || []);
        setCredits(serieCredits || { cast: [], crew: [] });
        setSeasons(details.seasons || []);
        
        const filteredVideos = serieVideos?.filter(v => 
          v.site === 'YouTube' || v.site === 'Vimeo'
        ) || [];
        
        setVideos(filteredVideos);
        setProviders(watchProviders?.BR || null);
        findBestTrailer(filteredVideos);
        
      } catch (err) {
        setError(err.message || 'Erro ao carregar detalhes da série');
        console.error('Erro:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (!serie?.id) return;
      
      try {
        const response = await API.checkSerieInWatchlist(serie.id);
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
  }, [serie]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleWatchlist = async () => {
    try {
      if (inWatchlist) {
        await API.removeFromWatchlist(serie.id);
        showToastMessage('Removido da watchlist');
      } else {
        await API.addToWatchlist({
          id: serie.id,
          title: serie.name,
          poster_path: serie.poster_path,
          release_date: serie.first_air_date,
          vote_average: serie.vote_average,
          isSerie: true
        });
        showToastMessage('Adicionado à watchlist');
      }
      setInWatchlist(!inWatchlist);
    } catch (error) {
      console.error('Error updating watchlist:', error);
      showToastMessage(error.response?.data?.error || 'Erro ao atualizar watchlist');
    }
  };

  const findBestTrailer = (videos) => {
    if (!videos || videos.length === 0) {
      setSelectedTrailer(null);
      return;
    }
    
    const officialPt = videos.find(v => 
      v.official && 
      (v.type.includes('Trailer') || v.name.includes('Trailer')) && 
      v.iso_639_1 === 'pt'
    );
    
    const officialEn = videos.find(v => 
      v.official && 
      (v.type.includes('Trailer') || v.name.includes('Trailer')) && 
      v.iso_639_1 === 'en'
    );
    
    const anyTrailer = videos.find(v => 
      v.type.includes('Trailer') || 
      v.name.toLowerCase().includes('trailer')
    );
    
    const teaser = videos.find(v => 
      v.type.includes('Teaser') || 
      v.name.toLowerCase().includes('teaser')
    );
    
    setSelectedTrailer(officialPt || officialEn || anyTrailer || teaser || videos[0]);
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCreator = () => {
    return credits.crew?.find(person => person.job === 'Creator')?.name || 'Desconhecido';
  };

  const getTopCast = () => {
    return credits.cast?.slice(0, 8) || [];
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
    </div>
  );

  if (error) return (
    <Container className="my-5">
      <Alert variant="danger" className="text-center py-4">
        <h4>{error}</h4>
        <Button variant="outline-danger" className="mt-3" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </Alert>
    </Container>
  );

  if (!serie) return (
    <Container className="my-5">
      <Alert variant="warning" className="text-center py-4">
        <h4>Série não encontrada</h4>
        <Button variant="outline-warning" className="mt-3" onClick={() => window.history.back()}>
          Voltar
        </Button>
      </Alert>
    </Container>
  );

  return (
    <div className="serie-detail-page" style={{ backgroundColor: '#141414', color: '#fff' }}>
      {/* Hero Section */}
      <div 
        className="serie-hero position-relative"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(20,20,20,1)), 
                           url(${serie.backdrop_path 
                             ? `https://image.tmdb.org/t/p/original${serie.backdrop_path}`
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
              <Card className="serie-poster-card shadow-lg border-0">
                <Card.Img
                  variant="top"
                  src={serie.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${serie.poster_path}`
                    : '/default-poster.jpg'}
                  alt={serie.name}
                  className="img-fluid rounded-3"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                />
                {serie.vote_average > 0 && (
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
                      <span style={{ fontWeight: 'bold' }}>{serie.vote_average.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </Card>
            </Col>
            
            <Col lg={8} className="text-white hero-content">
              <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h1 className="serie-title">{serie.name}</h1>
                {serie.adult && (
                  <Badge bg="danger" className="age-rating">
                    18+
                  </Badge>
                )}
              </div>
              
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge bg="dark" className="d-flex align-items-center">
                  <Calendar className="me-1" /> {serie.first_air_date.substring(0, 4)}
                </Badge>
                <Badge bg="dark" className="d-flex align-items-center">
                  <Tv className="me-1" /> {serie.number_of_seasons} temporada{serie.number_of_seasons !== 1 ? 's' : ''}
                </Badge>
                {serie.genres.map(genre => (
                  <Badge key={genre.id} bg="primary">
                    {genre.name}
                  </Badge>
                ))}
              </div>
              
              {serie.tagline && (
                <p className="serie-tagline fs-5 fst-italic text-muted">
                  "{serie.tagline}"
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
              <p className="lead">{serie.overview || 'Sinopse não disponível.'}</p>
            </div>
          </Collapse>
          {serie.overview && serie.overview.length > 150 && (
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
                      <span className="info-label">Criador</span>
                      <span className="info-value">{getCreator()}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Estreia</span>
                      <span className="info-value">
                        {new Date(serie.first_air_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Último episódio</span>
                      <span className="info-value">
                        {serie.last_air_date ? new Date(serie.last_air_date).toLocaleDateString('pt-BR') : 'Em produção'}
                      </span>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="info-item mb-3">
                      <span className="info-label">Temporadas</span>
                      <span className="info-value">{serie.number_of_seasons}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Episódios</span>
                      <span className="info-value">{serie.number_of_episodes}</span>
                    </div>
                    <div className="info-item mb-3">
                      <span className="info-label">Duração dos episódios</span>
                      <span className="info-value">{formatRuntime(serie.episode_run_time?.[0])}</span>
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
                {serie.production_companies?.length > 0 ? (
                  <div className="d-flex flex-wrap gap-3 align-items-center">
                    {serie.production_companies.slice(0, 3).map(company => (
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
                    {serie.production_companies.length > 3 && (
                      <Badge bg="light" text="dark" className="ms-2">
                        +{serie.production_companies.length - 3}
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
                    <span>{serie.original_name}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Idioma Original</span>
                    <span>{serie.original_language.toUpperCase()}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span className="fw-bold">Status</span>
                    <span>{serie.status}</span>
                  </ListGroup.Item>
                </ListGroup>
              </Col>
              
              <Col md={6} className="mt-4 mt-md-0">
                <h5 className="mb-3">Gêneros</h5>
                <div className="d-flex flex-wrap gap-2">
                  {serie.genres.map(genre => (
                    <Badge key={genre.id} bg="primary" pill>
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </Col>
            </Row>

            {/* Temporadas */}
            {seasons.length > 0 && (
              <div className="mt-5">
                <h5 className="mb-3">Temporadas</h5>
                <Row className="g-4">
                  {seasons.map(season => (
                    <Col key={season.id} xs={6} md={4} lg={3}>
                      <Card className="h-100">
                        <Card.Img
                          variant="top"
                          src={season.poster_path 
                            ? `https://image.tmdb.org/t/p/w300${season.poster_path}`
                            : '/default-poster.jpg'}
                          alt={`Temporada ${season.season_number}`}
                          className="img-fluid"
                        />
                        <Card.Body>
                          <Card.Title>Temporada {season.season_number}</Card.Title>
                          <Card.Text className="small text-muted">
                            {season.air_date && new Date(season.air_date).getFullYear()} • 
                            {season.episode_count} episódios
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
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
                  Nenhum vídeo disponível para esta série.
                </Alert>
              )}
            </div>
          </Tab>
        </Tabs>

        {/* Séries Similares */}
        {similar.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-4">Você também pode gostar</h4>
            <Row className="g-4">
              {similar.map(serie => (
                <Col key={serie.id} xs={6} md={4} lg={3} xl={2}>
                  <SeriesCard series={serie} />
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
            {selectedTrailer?.name || `Trailer: ${serie.name}`}
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
              <p>Não encontramos trailers para esta série no momento.</p>
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

export default SerieDetail;