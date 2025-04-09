import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import { API } from '../services/api';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard'; // Importe o SeriesCard se tiver séries na lista
import { useAuth } from '../hooks/useAuth';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Certifique-se que esta função está implementada em services/api.js
        const response = await API.getUserWatchlist(user.id);
        
        // Verifica se a resposta existe e é um array
        if (!Array.isArray(response)) {
          throw new Error('Formato de dados inválido');
        }
        
        setWatchlist(response);
      } catch (err) {
        console.error('Erro ao carregar watchlist:', err);
        setError(err.message || 'Erro ao carregar sua lista');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchWatchlist();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" />
        <span className="ms-2">Carregando sua lista...</span>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger" className="text-center py-4">
          <h4>{error}</h4>
          <Button 
            variant="outline-danger" 
            className="mt-3"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5 mt-4">
      <h2 className="mb-4">Minha Watchlist</h2>
      
      {watchlist.length === 0 ? (
        <Alert variant="info" className="text-center py-4">
          <h4>Sua watchlist está vazia</h4>
          <p>Adicione filmes ou séries para vê-los aqui!</p>
        </Alert>
      ) : (
        <>
          <div className="mb-4">
            <h5>Total: {watchlist.length} {watchlist.length === 1 ? 'item' : 'itens'}</h5>
          </div>
          
          <Row className="g-4">
            {watchlist.map((item) => (
              <Col key={item.id} xs={6} md={4} lg={3} xl={2}>
                {/* Renderiza MovieCard ou SeriesCard dependendo do tipo */}
                {item.mediaType === 'tv' ? (
                  <SeriesCard series={item} />
                ) : (
                  <MovieCard movie={item} />
                )}
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default Watchlist;