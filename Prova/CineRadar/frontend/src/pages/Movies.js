import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import { getMoviesByGenre, getGenres } from '../services/api';
import MovieCard from '../components/MovieCard';

const MoviesPage = () => {
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [activeGenre, setActiveGenre] = useState(28); // Ação como padrão
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [genresData, moviesData] = await Promise.all([
          getGenres(),
          getMoviesByGenre(activeGenre)
        ]);
        setGenres(genresData);
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeGenre]);

  return (
    <Container className="py-5 mt-4">
      <h2 className="mb-4">Explorar Filmes</h2>
      
      <Tabs
        activeKey={activeGenre}
        onSelect={(k) => setActiveGenre(Number(k))}
        className="mb-4"
      >
        {genres.map(genre => (
          <Tab 
            key={genre.id} 
            eventKey={genre.id} 
            title={genre.name}
          />
        ))}
      </Tabs>

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto" />
      ) : (
        <Row className="g-4">
          {movies.map(movie => (
            <Col key={movie.id} xs={6} md={4} lg={3} xl={2}>
              <MovieCard movie={movie} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MoviesPage;