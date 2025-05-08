import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Facebook, Twitter, Instagram, Github } from 'react-bootstrap-icons';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-3">
            <h5>CineRadar</h5>
            <p className="text-muted">
              A sua plataforma para descobrir e organizar filmes e séries.
            </p>
          </Col>
          
          <Col md={2} className="mb-3">
            <h5>Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-muted">Início</a></li>
              <li><a href="/movies" className="text-decoration-none text-muted">Filmes</a></li>
              <li><a href="/series" className="text-decoration-none text-muted">Séries</a></li>
              <li><a href="/watchlist" className="text-decoration-none text-muted">Minha Lista</a></li>
            </ul>
          </Col>
          
          <Col md={2} className="mb-3">
            <h5>Legal</h5>
            <ul className="list-unstyled">
              <li><a href="/terms" className="text-decoration-none text-muted">Termos</a></li>
              <li><a href="/privacy" className="text-decoration-none text-muted">Privacidade</a></li>
              <li><a href="/cookies" className="text-decoration-none text-muted">Cookies</a></li>
            </ul>
          </Col>
          
          <Col md={4} className="mb-3">
            <h5>Redes Sociais</h5>
            <div className="d-flex gap-3">
              <a 
                href="https://facebook.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://twitter.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://instagram.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://github.com/RodriguesBernardo/DesenvolvimentoAplicacoesCorporativas.git" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col className="text-center text-muted">
            <small>© {new Date().getFullYear()} CineRadar. Todos os direitos reservados.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;