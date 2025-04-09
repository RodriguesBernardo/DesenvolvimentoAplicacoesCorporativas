import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Pagination, Tabs, Tab } from 'react-bootstrap';
import { API } from '../services/api';
import MovieCard from '../components/MovieCard';
import SeriesCard from '../components/SeriesCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [activeTab, setActiveTab] = useState('movies');
  const [movieResults, setMovieResults] = useState([]);
  const [seriesResults, setSeriesResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [moviePage, setMoviePage] = useState(1);
  const [seriesPage, setSeriesPage] = useState(1);
  const [movieTotalPages, setMovieTotalPages] = useState(1);
  const [seriesTotalPages, setSeriesTotalPages] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const [movieData, seriesData] = await Promise.all([
          API.searchMovies(query, moviePage),
          API.searchSeries(query, seriesPage)
        ]);

        setMovieResults(movieData.results || []);
        setSeriesResults(seriesData.results || []);
        setMovieTotalPages(movieData.total_pages || 1);
        setSeriesTotalPages(seriesData.total_pages || 1);

      } catch (err) {
        console.error('Erro ao buscar:', err);
        setError('Erro ao buscar resultados. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (query && query.trim().length > 0) {
      fetchResults();
    } else {
      setMovieResults([]);
      setSeriesResults([]);
      setLoading(false);
    }
  }, [query, moviePage, seriesPage]);

  const handleMoviePageChange = (newPage) => {
    setMoviePage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeriesPageChange = (newPage) => {
    setSeriesPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = (currentPage, totalPages, handler) => {
    if (totalPages <= 1) return null;

    const items = [];
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handler(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            disabled={currentPage === 1}
            onClick={() => handler(currentPage - 1)}
          />
          {items}
          <Pagination.Next
            disabled={currentPage === totalPages}
            onClick={() => handler(currentPage + 1)}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container className="py-5 mt-4">
      <h2 className="mb-4">Resultados para: "{query}"</h2>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </Spinner>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="movies" title={`Filmes (${movieResults.length})`}>
              {movieResults.length === 0 ? (
                <Alert variant="info" className="mt-3">
                  Nenhum filme encontrado para "{query}"
                </Alert>
              ) : (
                <>
                  <Row className="g-4 mt-3">
                    {movieResults.map(movie => (
                      <Col key={`movie-${movie.id}`} xs={6} md={4} lg={3} xl={2}>
                        <Link to={`/movie/${movie.id}`} style={{ textDecoration: 'none' }}>
                          <MovieCard movie={movie} />
                        </Link>
                      </Col>
                    ))}
                  </Row>
                  {renderPagination(moviePage, movieTotalPages, handleMoviePageChange)}
                </>
              )}
            </Tab>
            <Tab eventKey="series" title={`Séries (${seriesResults.length})`}>
              {seriesResults.length === 0 ? (
                <Alert variant="info" className="mt-3">
                  Nenhuma série encontrada para "{query}"
                </Alert>
              ) : (
                <>
                  <Row className="g-4 mt-3">
                    {seriesResults.map(serie => (
                      <Col key={`serie-${serie.id}`} xs={6} md={4} lg={3} xl={2}>
                        <Link to={`/series/${serie.id}`} style={{ textDecoration: 'none' }}>
                          <SeriesCard series={serie} />
                        </Link>
                      </Col>
                    ))}
                  </Row>
                  {renderPagination(seriesPage, seriesTotalPages, handleSeriesPageChange)}
                </>
              )}
            </Tab>
          </Tabs>
        </>
      )}
    </Container>
  );
};

export default SearchPage;