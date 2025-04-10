import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge, Spinner } from 'react-bootstrap';
import { Search, Film, Bookmark, Person, BoxArrowRight, StarFill } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import _ from 'lodash';
import logo from '../pages/logo.png'; // Ajuste o caminho para sua logo

const CineNavbar = () => {
  const { currentUser, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = _.throttle(() => {
      setScrolled(window.scrollY > 10);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = _.debounce((query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, 300);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  if (loading) {
    return (
      <Navbar 
        bg="dark" 
        variant="dark" 
        fixed="top"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          backdropFilter: 'blur(10px)',
          height: '80px'
        }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="CineRadar" 
              height="40" 
              className="me-2"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-gradient fs-4 fw-bold">CineRadar</span>
          </Navbar.Brand>
          <Spinner animation="border" size="sm" variant="light" />
        </Container>
      </Navbar>
    );
  }

  return (
    <>
      <Navbar 
        expand="lg" 
        fixed="top" 
        style={{
          height: '80px',
          zIndex: 1030,
          transition: 'all 0.3s ease',
          background: scrolled ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
        }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <img 
              src={logo} 
              alt="CineRadar" 
              height="40" 
              className="me-2"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-gradient fs-4 fw-bold">CineRadar</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto ms-4">
              <Nav.Link 
                as={Link} 
                to="/" 
                className="text-white d-flex align-items-center me-3"
                style={{ fontWeight: 500 }}
              >
                <Film className="me-2" /> Início
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/movies" 
                className="text-white me-3"
                style={{ fontWeight: 500 }}
              >
                Filmes
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/series" 
                className="text-white me-3"
                style={{ fontWeight: 500 }}
              >
                Séries
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/watchlist" 
                className="text-white d-flex align-items-center me-3"
                style={{ fontWeight: 500 }}
              >
              </Nav.Link>
            </Nav>

            <Form 
              className="d-flex mx-3" 
              onSubmit={handleSearchSubmit}
              style={{ maxWidth: '400px', flex: 1 }}
            >
              <Form.Control
                type="search"
                placeholder="Buscar filmes, séries..."
                className="me-2 bg-dark text-white border-secondary"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                style={{
                  borderRadius: '20px',
                  padding: '8px 15px',
                  boxShadow: 'none'
                }}
              />
              <Button 
                variant="outline-light" 
                type="submit"
                style={{
                  borderRadius: '20px',
                  padding: '0 15px',
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              >
                <Search />
              </Button>
            </Form>

            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle 
                  variant="dark" 
                  id="dropdown-user" 
                  className="d-flex align-items-center"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '20px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div 
                    className="d-flex align-items-center justify-content-center me-2"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                      color: 'white'
                    }}
                  >
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 500 }}>{currentUser.name}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu 
                  className="dropdown-menu-dark"
                  style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '5px 0',
                    marginTop: '10px'
                  }}
                >
                  <Dropdown.Item 
                    as={Link} 
                    to="/profile" 
                    className="d-flex align-items-center py-2 px-3"
                    style={{ fontWeight: 500 }}
                  >
                    <Person className="me-2" /> Meu Perfil
                  </Dropdown.Item>
                  {currentUser.isAdmin && (
                    <Dropdown.Item 
                      as={Link} 
                      to="/admin"
                      className="py-2 px-3"
                      style={{ fontWeight: 500 }}
                    >
                      <StarFill className="me-2" /> Painel Admin
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Dropdown.Item 
                    onClick={logout} 
                    className="text-danger py-2 px-3"
                    style={{ fontWeight: 500 }}
                  >
                    <BoxArrowRight className="me-2" /> Sair
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex ms-3">
                <Button 
                  variant="outline-light" 
                  as={Link} 
                  to="/login" 
                  className="me-2"
                  style={{
                    borderRadius: '20px',
                    padding: '6px 15px',
                    fontWeight: 500,
                    borderColor: 'rgba(255,255,255,0.2)'
                  }}
                >
                  Entrar
                </Button>
                <Button 
                  variant="danger" 
                  as={Link} 
                  to="/register"
                  style={{
                    borderRadius: '20px',
                    padding: '6px 15px',
                    fontWeight: 500,
                    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                    border: 'none'
                  }}
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Espaço reservado para evitar que o conteúdo fique escondido */}
      <div style={{ height: '80px' }}></div>
    </>
  );
};

export default CineNavbar;