import React, { useState } from 'react';
import { Form, Button, Alert, Card, Container, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../services/api';
import logo from './logo.png'; 

const Register = () => {   // Uso de UseState para gerenciar o formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação se as senhas coincidem
    if (formData.password !== formData.confirmPassword) {
      return setError('As senhas não coincidem');
    }

    setLoading(true);
    setError('');
    // Faz a chamada para a API de registro de usuario 
    try {
      await API.auth.register({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password 
      });
      navigate('/login', { state: { success: 'Cadastro realizado! Faça login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Watermark Logo Background */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.05,
        zIndex: 0,
        width: '80%',
        maxWidth: '600px'
      }}>
        <img 
          src={logo} 
          alt="Logo" 
          style={{ 
            width: '100%', 
            height: 'auto',
            filter: 'grayscale(100%)'
          }} 
        />
      </div>

      <Container className="d-flex justify-content-center align-items-center min-vh-100" style={{ position: 'relative', zIndex: 1 }}>
        <Card className="shadow-lg" style={{ 
          width: '100%', 
          maxWidth: '450px',
          border: 'none',
          borderRadius: '15px',
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(255, 255, 255, 0.85)'
        }}>
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              {/* Logo at the top */}
              <div className="mb-4" style={{ maxWidth: '120px', margin: '0 auto' }}>
                <img 
                  src={logo} 
                  alt="Logo" 
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    borderRadius: '8px'
                  }} 
                />
              </div>
              <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Cadastre-se</h2>
              <p className="text-muted">Crie sua conta para começar</p>
            </div>

            {error && (
              <Alert 
                variant="danger" 
                onClose={() => setError('')} 
                dismissible
                className="mb-4"
                style={{ borderRadius: '8px' }}
              >
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Nome</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Seu nome completo"
                  style={{
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="seu@email.com"
                  style={{
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength="6"
                  style={{
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Confirmar Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirme sua senha"
                  minLength="6"
                  style={{
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Form.Group>

              <div className="d-grid mb-3">
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    fontWeight: '600',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease'
                  }}
                  className="hover-effect"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Cadastrando...
                    </>
                  ) : 'Cadastrar'}
                </Button>
              </div>
            </Form>

            <div className="d-flex align-items-center mb-4">
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
              <div className="px-3" style={{ color: '#6c757d', fontSize: '14px' }}>OU</div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
            </div>

            <div className="text-center">
              <span className="text-muted">Já tem uma conta? </span>
              <Link 
                to="/login" 
                className="text-decoration-none fw-medium"
                style={{ color: '#2575fc' }}
              >
                Faça login
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Register;