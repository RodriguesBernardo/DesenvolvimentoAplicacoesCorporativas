import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, Button, Dropdown, Badge } from 'react-bootstrap';
import { Search, Film, Bookmark, Person, BoxArrowRight } from 'react-bootstrap-icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
// import logo from '../assets/logo.png'; // Adicione um logo na pasta assets

const CineNavbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${searchQuery}`);
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        fixed="top" 
        className={`navbar-custom ${scrolled ? 'scrolled' : ''}`}
        style={{ height: '70px' }}
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
                {user?.watchlistCount > 0 && (
                  <Badge pill bg="danger" className="ms-1">
                    {user.watchlistCount}
                  </Badge>
                )}
              </Nav.Link>
            </Nav>

            <Form className="d-flex mx-3" onSubmit={handleSearch}>
              <Form.Control
                type="search"
                placeholder="Buscar filmes..."
                className="me-2"
                aria-label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="outline-light" type="submit">
                <Search />
              </Button>
            </Form>

            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="dark" id="dropdown-user">
                  <Person className="me-1" /> {user.name}
                </Dropdown.Toggle>
                <Dropdown.Menu className="dropdown-menu-dark">
                  <Dropdown.Item as={Link} to="/profile">
                    Meu Perfil
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">
                    Configurações
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={logout}>
                    <BoxArrowRight className="me-1" /> Sair
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