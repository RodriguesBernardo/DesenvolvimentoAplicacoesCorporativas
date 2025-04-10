import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Tabs, Tab, Spinner, Modal } from 'react-bootstrap';
import { API } from '../services/api';
import SeriesCard from '../components/SeriesCard';

const SeriesPage = () => {
  const [genres, setGenres] = useState([]);
  const [series, setSeries] = useState([]);
  const [activeGenre, setActiveGenre] = useState(10759);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState('');

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

  const handleTrailerClick = async (seriesId) => {
    try {
      const videos = await API.getTVSeriesVideos(seriesId);
      const trailer = videos.find(video => video.type === 'Trailer');
      if (trailer) {
        setTrailerKey(trailer.key);
        setShowTrailer(true);
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
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
              <SeriesCard 
                series={serie} 
                onTrailerClick={handleTrailerClick}
              />
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showTrailer} onHide={() => setShowTrailer(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Trailer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="ratio ratio-16x9">
            <iframe 
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default SeriesPage;