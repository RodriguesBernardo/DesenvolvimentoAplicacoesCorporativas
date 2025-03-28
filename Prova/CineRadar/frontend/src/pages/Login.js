import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Form, Alert, Container, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth(); // Agora usando a função login do contexto

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

    if (!formData.email || !formData.password) {
      return setError('Por favor, preencha todos os campos');
    }

    setIsLoading(true);

    try {
      const { success, error: authError } = await login(formData.email, formData.password);
      
      if (success) {
        navigate('/');
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
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <h2>Login</h2>
            <p className="text-muted">Acesse sua conta para continuar</p>
          </div>

          {error && (
            <Alert 
              variant="danger" 
              onClose={() => setError('')} 
              dismissible
              className="mb-4"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Digite seu email"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Senha</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Digite sua senha"
              />
            </Form.Group>

            <div className="d-grid mb-3">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading}
                size="lg"
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

            <div className="text-center">
              <Link to="/forgot-password" className="text-decoration-none">
                Esqueceu sua senha?
              </Link>
            </div>
          </Form>

          <hr className="my-4" />

          <div className="text-center">
            <span className="text-muted">Não tem uma conta? </span>
            <Link to="/register" className="text-decoration-none">
              Cadastre-se
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;