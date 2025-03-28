import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge, Spinner } from 'react-bootstrap';
import { Search, Film, Bookmark, Person, BoxArrowRight } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import _ from 'lodash'; // Importando lodash para throttle/debounce

const CineNavbar = () => {
  const { currentUser, logout, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Efeito de scroll com throttle para melhor performance
  useEffect(() => {
    const handleScroll = _.throttle(() => {
      setScrolled(window.scrollY > 10);
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Busca com debounce para evitar múltiplas requisições
  const handleSearch = _.debounce((query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }, 300);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Mostrar spinner durante o carregamento
  if (loading) {
    return (
      <Navbar bg="dark" variant="dark" fixed="top">
        <Container>
          <Navbar.Brand as={Link} to="/">
            <span className="text-gradient">CineRadar</span>
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
        className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
        style={{ height: '70px', zIndex: 1030 }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            {/* <img src={logo} alt="CineRadar" height="40" className="me-2" /> */}
            <span className="text-gradient">CineRadar</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/" className="text-white">
                <Film className="me-1" /> Início
              </Nav.Link>
              <Nav.Link as={Link} to="/movies" className="text-white">
                Filmes
              </Nav.Link>
              <Nav.Link as={Link} to="/series" className="text-white">
                Séries
              </Nav.Link>
              <Nav.Link as={Link} to="/watchlist" className="text-white">
                <Bookmark className="me-1" /> Minha Lista
                {currentUser?.watchlistCount > 0 && (
                  <Badge pill bg="danger" className="ms-1">
                    {currentUser.watchlistCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav>

            <Form className="d-flex mx-3" onSubmit={handleSearchSubmit}>
              <Form.Control
                type="search"
                placeholder="Buscar filmes..."
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <Button variant="outline-light" type="submit">
                <Search />
              </Button>
            </Form>

            {currentUser ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="dropdown-user" className="d-flex align-items-center">
                  <Person className="me-1" /> {currentUser.name}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Item as={Link} to="/profile" className="d-flex align-items-center">
                    <Person className="me-2" /> Meu Perfil
                  </Dropdown.Item>
                  {currentUser.isAdmin && (
                    <Dropdown.Item as={Link} to="/admin">
                      Painel Admin
                    </Dropdown.Item>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout} className="text-danger">
                    <BoxArrowRight className="me-2" /> Sair
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <div className="d-flex">
                <Button variant="outline-light" as={Link} to="/login" className="me-2">
                  Entrar
                </Button>
                <Button variant="danger" as={Link} to="/register">
                  Cadastrar
                </Button>
              </div>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Espaço reservado para evitar que o conteúdo fique escondido */}
      <div style={{ height: '70px' }}></div>
    </>
  );
};

export default CineNavbar;