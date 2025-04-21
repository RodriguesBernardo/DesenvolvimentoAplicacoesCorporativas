import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, Alert, Container, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import logo from './logo.png'; // Adjust the path to your logo

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // Uso de UseState para gerenciar o estado do formulário
 
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validação para que os campos estejam preenchidos
    if (!formData.email || !formData.password) {
      return setError('Por favor, preencha todos os campos');
    }

    setIsLoading(true);

    try {
      const { success, error: authError } = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/');    // Navigate do React-Router para redirecionar para o home
      } else {
        setError(authError || 'Erro ao fazer login');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message.includes('Failed to fetch')
        ? 'Não foi possível conectar ao servidor'
        : err.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
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
              <h2 className="fw-bold" style={{ color: '#2c3e50' }}>Login</h2>
              <p className="text-muted">Acesse sua conta para continuar</p>
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
                <Form.Label className="fw-medium">Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Digite seu email"
                  style={{
                    padding: '12px 15px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Senha</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Digite sua senha"
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
                  disabled={isLoading}
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
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Entrando...
                    </>
                  ) : 'Entrar'}
                </Button>
              </div>
            </Form>

            <div className="d-flex align-items-center mb-4">
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
              <div className="px-3" style={{ color: '#6c757d', fontSize: '14px' }}>OU</div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e0e0e0' }}></div>
            </div>

            <div className="text-center">
              <span className="text-muted">Não tem uma conta? </span>
              <Link 
                to="/register" 
                className="text-decoration-none fw-medium"
                style={{ color: '#2575fc' }}
              >
                Cadastre-se
              </Link>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Login;