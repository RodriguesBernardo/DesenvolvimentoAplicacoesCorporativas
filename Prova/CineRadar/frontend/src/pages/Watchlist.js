import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Spinner, 
  Alert, 
  Button, 
  Tab, 
  Tabs, 
  Badge,
  ButtonGroup
} from 'react-bootstrap';
import { 
  StarFill, 
  Film, 
  Tv, 
  BookmarkHeart, 
  BookmarkHeartFill,
  ArrowLeft,
  ExclamationTriangleFill,
  HouseFill
} from 'react-bootstrap-icons';
import { API } from '../services/api';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentUser?.id) {
          setLoading(false);
          return;
        }

        const response = await API.watchlist.getWatchlist(currentUser.id);
        
        if (!response) {
          throw new Error('Nenhum dado retornado da API');
        }
        
        // Normaliza os dados da API
        const itemsArray = Array.isArray(response) ? response : [response];
        
        // Filtra itens inválidos e adiciona mediaType
        const formattedWatchlist = itemsArray
          .filter(item => item && (item.id || item.tmdb_id))
          .map(item => ({
            ...item,
            id: item.id || item.tmdb_id, // Garante que temos um ID
            mediaType: item.mediaType || (item.title ? 'movie' : 'tv')
          }));
        
        setWatchlist(formattedWatchlist);
        setFilteredItems(formattedWatchlist);
      } catch (err) {
        console.error('Erro ao carregar watchlist:', err);
        setError(err.message || 'Erro ao carregar sua lista');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredItems(watchlist);
    } else {
      setFilteredItems(watchlist.filter(item => item.mediaType === activeTab));
    }
  }, [activeTab, watchlist]);

  const handleRemoveFromWatchlist = async (itemId, mediaType) => {
    try {
      if (!currentUser?.id) return;
      
      await API.watchlist.removeFromWatchlist(currentUser.id, itemId, mediaType);
      setWatchlist(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Erro ao remover da watchlist:', err);
      setError('Erro ao remover item da lista');
    }
  };

  if (!currentUser) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Alert variant="warning" className="text-center py-4 border-warning">
          <BookmarkHeartFill size={40} className="mb-3 text-warning" />
          <h3 className="fw-bold mb-3">Acesso não autorizado</h3>
          <p className="fs-5 mb-4">Você precisa estar logado para acessar sua watchlist</p>
          <ButtonGroup>
            <Button 
              variant="warning" 
              className="fw-bold px-4"
              onClick={() => navigate('/login', { state: { from: '/watchlist' } })}
            >
              Entrar
            </Button>
            <Button 
              variant="outline-warning" 
              className="fw-bold px-4"
              onClick={() => navigate('/register')}
            >
              Cadastrar
            </Button>
          </ButtonGroup>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <span className="mt-3 fs-5">Carregando sua lista...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center py-4 border-danger">
          <div className="d-flex justify-content-center mb-3">
            <ExclamationTriangleFill size={40} className="text-danger" />
          </div>
          <h3 className="fw-bold mb-3">Oops! Algo deu errado</h3>
          <p className="fs-5 mb-4">{error}</p>
          <div className="d-flex justify-content-center gap-3">
            <Button 
              variant="outline-danger" 
              className="fw-bold"
              onClick={() => window.location.reload()}
            >
              Tentar novamente
            </Button>
            <Button 
              variant="danger" 
              className="fw-bold"
              onClick={() => navigate('/')}
            >
              <HouseFill className="me-2" /> Página Inicial
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4 py-md-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3 d-md-none"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft />
          </Button>
          <h2 className="fw-bold text-white mb-0">
            <BookmarkHeartFill className="me-2 text-warning" />
            Minha Watchlist
          </h2>
        </div>
        
        <Badge pill bg="dark" className="fs-5 px-3 py-2 border border-secondary">
          {watchlist.length} {watchlist.length === 1 ? 'item' : 'itens'}
        </Badge>
      </div>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant="pills"
      >
        <Tab 
          eventKey="all" 
          title={
            <span className="d-flex align-items-center">
              <StarFill className="me-2" /> Todos
            </span>
          } 
        />
        <Tab 
          eventKey="movie" 
          title={
            <span className="d-flex align-items-center">
              <Film className="me-2" /> Filmes
            </span>
          } 
        />
        <Tab 
          eventKey="tv" 
          title={
            <span className="d-flex align-items-center">
              <Tv className="me-2" /> Séries
            </span>
          } 
        />
      </Tabs>

      {filteredItems.length === 0 ? (
        <Alert variant="info" className="text-center py-5 border-info">
          <div className="d-flex justify-content-center mb-3">
            <BookmarkHeart size={48} className="text-info" />
          </div>
          <h3 className="fw-bold mb-2">Sua watchlist está vazia</h3>
          <p className="fs-5 mb-4">Adicione filmes ou séries para vê-los aqui!</p>
          <Button 
            variant="info" 
            className="fw-bold px-4"
            onClick={() => navigate('/')}
          >
            Explorar Catálogo
          </Button>
        </Alert>
      ) : (
        <Row className="g-4">
          {filteredItems.map((item) => {
            if (!item.id) return null;
            
            return (
              <Col key={`${item.id}-${item.mediaType}`} xs={6} sm={4} md={3} lg={3} xl={2}>
                {item.mediaType === 'tv' ? (
                  <SeriesCard 
                    series={item} 
                    onRemove={() => handleRemoveFromWatchlist(item.id, 'tv')}
                  />
                ) : (
                  <MovieCard 
                    movie={item} 
                    onRemove={() => handleRemoveFromWatchlist(item.id, 'movie')}
                  />
                )}
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Watchlist;