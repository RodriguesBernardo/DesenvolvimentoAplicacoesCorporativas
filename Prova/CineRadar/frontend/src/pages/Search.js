import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Adicionei o Link aqui
import { Container, Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap';
import { searchMovies } from '../services/api';
import MovieCard from '../components/MovieCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await searchMovies(query, page);
        setResults(data.results); // Corrigi um typo aqui (de 'results' para 'results')
        setTotalPages(data.total_pages);
      } catch (err) {
        setError('Erro ao buscar filmes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [query, page]);

  return (
    <Container className="py-5 mt-4">
      <h2 className="mb-4">Resultados para: "{query}"</h2>
      
      {loading ? (
        <Spinner animation="border" className="d-block mx-auto" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : results.length === 0 ? (
        <Alert variant="info">Nenhum resultado encontrado</Alert>
      ) : (
        <>
          <Row className="g-4">
            {results.map(movie => (
              <Col key={movie.id} xs={6} md={4} lg={3} xl={2}>
                <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                  <MovieCard movie={movie} />
                </Link>
              </Col>
            ))}
          </Row>
          
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.Prev 
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === page}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next 
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default SearchPage;