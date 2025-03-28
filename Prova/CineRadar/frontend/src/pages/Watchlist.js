import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../hooks/useAuth';
import { getWatchlist, removeFromWatchlist } from '../services/api';
import MovieCard from '../components/MovieCard';

const Watchlist = () => {
  const { user } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const data = await getWatchlist(user.id);
        setMovies(data);
      } catch (err) {
        setError('Erro ao carregar watchlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user.id]);

  const handleRemove = async (movieId) => {
    try {
      await removeFromWatchlist(user.id, movieId);
      setMovies(movies.filter(movie => movie.id !== movieId));
    } catch (err) {
      setError('Erro ao remover filme');
    }
  };

  if (loading) return <Spinner animation="border" className="d-block mx-auto my-5" />;
  if (error) return <Alert variant="danger" className="m-4">{error}</Alert>;

  return (
    <Container className="py-4">
      <h2 className="mb-4">Minha Watchlist</h2>
      
      {movies.length === 0 ? (
        <Alert variant="info">Sua watchlist está vazia</Alert>
      ) : (
        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {movies.map(movie => (
            <Col key={movie.id}>
              <Card className="h-100">
                <MovieCard movie={movie} />
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="m-2"
                  onClick={() => handleRemove(movie.id)}
                >
                  Remover
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Watchlist;