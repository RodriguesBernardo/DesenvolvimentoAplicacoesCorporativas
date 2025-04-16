import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, Row, Col, Card, Button, 
  Spinner, Alert, OverlayTrigger, Tooltip, Badge
} from 'react-bootstrap';
import { 
  StarFill, Trash, InfoCircle, 
  ChevronLeft, ChevronRight, PlayFill
} from 'react-bootstrap-icons';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const WatchlistPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  useEffect(() => {
    // Verifica se o usuário está logado
    if (!currentUser || !currentUser.id) {
      setError('Você precisa estar logado para acessar esta página');
      setLoading(false);
      return;
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/users/${currentUser.id}/watchlist`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        const data = response.data?.data || response.data || [];
        setWatchlist(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erro ao carregar watchlist:', err);
        setError(err.response?.data?.error || err.message || 'Erro ao carregar watchlist');
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, [currentUser]);

  const removeFromWatchlist = async (watchlistId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/users/${currentUser.id}/watchlist/${watchlistId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setWatchlist(prev => prev.filter(item => item.watchlist_id !== watchlistId));
    } catch (err) {
      console.error('Erro ao remover item:', err);
      setError('Erro ao remover item da lista');
    }
  };

  const navigateToDetails = (mediaId, mediaType) => {
    navigate(mediaType === 'movie' ? `/movies/${mediaId}` : `/series/${mediaId}`);
  };

  const nextPage = () => {
    if ((currentPage + 1) * itemsPerPage < watchlist.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const visibleItems = watchlist.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center py-4">
          <h4>{error}</h4>
          {(!currentUser || !currentUser.id) ? (
            <Button 
              as={Link}
              to="/login"
              variant="outline-danger" 
              className="mt-3"
            >
              Ir para página de login
            </Button>
          ) : (
            <Button 
              variant="outline-danger" 
              onClick={() => window.location.reload()} 
              className="mt-3"
            >
              Tentar novamente
            </Button>
          )}
        </Alert>
      </Container>
    );
  }

  return (
    <div style={{ 
      background: 'linear-gradient(135deg,rgb(0, 0, 0),rgb(165, 163, 163),rgb(117, 116, 116))',
      minHeight: '100vh',
      color: '#fff'
    }}>
      <Container className="py-5">
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="display-4 fw-bold mb-3">
              <StarFill className="me-3 text-warning" /> Minha Watchlist
            </h1>
            <p className="text-muted ">
              Sua coleção pessoal de filmes e séries ({watchlist.length} itens)
            </p>
          </div>
          
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-light" 
              onClick={prevPage} 
              disabled={currentPage === 0}
              className="me-2 rounded-circle"
              style={{ width: '40px', height: '40px' }}
            >
              <ChevronLeft />
            </Button>
            <span className="mx-3 fw-bold">
              {currentPage + 1} / {Math.ceil(watchlist.length / itemsPerPage)}
            </span>
            <Button 
              variant="outline-light" 
              onClick={nextPage} 
              disabled={(currentPage + 1) * itemsPerPage >= watchlist.length}
              className="rounded-circle"
              style={{ width: '40px', height: '40px' }}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-5" style={{ minHeight: '50vh' }}>
            <div className="bg-dark rounded-3 p-5" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <h3 className="mb-4">Sua watchlist está vazia</h3>
              <p className="text-muted mb-4">
                Comece a adicionar filmes e séries para criar sua coleção pessoal
              </p>
              <Button 
                as={Link} 
                to="/explore" 
                variant="primary" 
                size="lg"
                className="px-4"
              >
                Explorar Catálogo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Row className="g-4">
              {visibleItems.map((item) => (
                <Col key={item.watchlist_id} xl={3} lg={4} md={6}>
                  <Card className="h-100 border-0 shadow-lg overflow-hidden" style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease',
                    borderRadius: '15px'
                  }}>
                    <div className="position-relative" style={{ paddingTop: '150%', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={
                          item.poster_path 
                            ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
                            : '/default-poster.jpg'
                        }
                        alt={item.title}
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        style={{ transition: 'transform 0.5s ease' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/default-poster.jpg';
                        }}
                      />
                      <div className="position-absolute top-0 end-0 p-3">
                        <Badge bg="dark" className="me-2">
                          {item.media_type === 'movie' ? 'Filme' : 'Série'}
                        </Badge>
                      </div>
                      
                      <div className="position-absolute bottom-0 start-0 w-100 p-3 d-flex justify-content-between align-items-end">
                        <div>
                        </div>
                        
                        <div className="btn-group">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Remover</Tooltip>}
                          >
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => removeFromWatchlist(item.watchlist_id)}
                              className="rounded-circle me-2"
                              style={{ width: '36px', height: '36px' }}
                            >
                              <Trash size={14} />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </div>
                  
                  </Card>
                </Col>
              ))}
            </Row>
            
            <div className="d-flex justify-content-center mt-5">
              <nav>
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={prevPage}>
                      <ChevronLeft />
                    </button>
                  </li>
                  {[...Array(Math.ceil(watchlist.length / itemsPerPage))].map((_, index) => (
                    <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(index)}
                      >
                        {index + 1}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${(currentPage + 1) * itemsPerPage >= watchlist.length ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={nextPage}>
                      <ChevronRight />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default WatchlistPage;