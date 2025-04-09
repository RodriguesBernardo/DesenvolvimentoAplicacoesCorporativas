import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API } from '../services/api';
import SeriesCard from '../components/SeriesCard'; // Importe o componente correto

const SeriesPage = () => {
  const [genres, setGenres] = useState([]);
  const [series, setSeries] = useState([]);
  const [activeGenre, setActiveGenre] = useState(10759); // Action & Adventure
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [genresData, seriesData] = await Promise.all([
          API.getTVGenres(),
          API.getTVSeriesByGenre(activeGenre)
        ]);
        setGenres(genresData);
        setSeries(seriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeGenre]);

  const handleSerieClick = (serieId) => {
    navigate(`/series/${serieId}`);
  };

  return (
    <Container className="py-5 mt-4">
      <h2 className="mb-4">Explorar Séries</h2>
      
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
          {series.map(serie => (
            <Col key={serie.id} xs={6} md={4} lg={3} xl={2}>
              <div onClick={() => handleSerieClick(serie.id)} style={{ cursor: 'pointer' }}>
                <SeriesCard series={serie} /> {/* Use o componente correto aqui */}
              </div>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default SeriesPage;