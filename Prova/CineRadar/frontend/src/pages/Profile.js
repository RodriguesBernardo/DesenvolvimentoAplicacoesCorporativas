import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Image, 
  Tab, 
  Tabs,
  Badge,
  Modal,
  Spinner,
  OverlayTrigger,
  Tooltip,
  ListGroup
} from 'react-bootstrap';
import { 
  GearFill, 
  LockFill, 
  Film, 
  PersonBadge,
  CameraFill,
  Person,
  Clock,
  CheckCircleFill,
  StarFill,
  TrashFill,
  InfoCircleFill
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Profile = () => {
  const { currentUser: user, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState({
    profile: false,
    password: false,
    avatar: false,
    data: false
  });
  const [watchlist, setWatchlist] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, data: true }));
    setError('');
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${user.id}/watchlist`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      setWatchlist(response.data || []);
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Erro ao carregar sua lista de filmes e séries');
    } finally {
      setLoading(prev => ({ ...prev, data: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      const avatarUrl = user.avatar?.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`;
      setAvatarPreview(avatarUrl || null);
      loadUserData();
    }
  }, [user, loadUserData]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(prev => ({ ...prev, profile: true }));
  
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}/profile`,
        {
          name: formData.name,
          email: formData.email,
          bio: formData.bio || null
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
  
      updateUser(response.data.user);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error('Update error:', err.response?.data || err);
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(prev => ({ ...prev, profile: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('As senhas não coincidem');
    }

    setError('');
    setSuccess('');
    setLoading(prev => ({ ...prev, password: true }));

    try {
      await axios.put(
        `${API_BASE_URL}/users/${user.id}/password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      setSuccess('Senha alterada com sucesso!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('O arquivo é muito grande (máximo 2MB)');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      return setError('Selecione uma imagem válida');
    }
  
    setLoading(prev => ({ ...prev, avatar: true }));
    setError('');
    setSuccess('');
  
    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
  
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      const avatarUrl = response.data.avatar.startsWith('http') 
        ? response.data.avatar 
        : `${API_BASE_URL}${response.data.avatar}`;
      
      updateUser({ 
        ...user, 
        avatar: avatarUrl
      });
      
      setAvatarPreview(avatarUrl);
      setShowAvatarModal(false);
      setSuccess('Avatar atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar avatar');
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const renderAvatar = () => {
    if (avatarPreview) {
      return (
        <div className="position-relative">
          <Image 
            src={avatarPreview} 
            roundedCircle 
            className="shadow"
            style={{ 
              width: '150px', 
              height: '150px', 
              objectFit: 'cover',
              border: '3px solid #fff',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
            }}
            alt="Avatar do usuário"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-avatar.png';
            }}
          />
        </div>
      );
    }
    return (
      <div 
        className="d-flex align-items-center justify-content-center bg-secondary rounded-circle shadow"
        style={{ 
          width: '150px', 
          height: '150px',
          border: '3px solid #fff'
        }}
      >
        <Person style={{ fontSize: '4rem', color: 'white' }} />
      </div>
    );
  };

  const MediaCard = ({ item }) => {
    const isMovie = item.media_type === 'movie';
    const title = item.title || item.name || 'Título desconhecido';
    const releaseDate = item.release_date || item.first_air_date;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    const posterPath = item.poster_path 
      ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
      : '/no-poster.jpg';

    return (
      <Card className="h-100 border-0 shadow-sm hover-effect">
        <div className="position-relative">
          <Card.Img 
            variant="top" 
            src={posterPath}
            alt={title}
            style={{ 
              height: '200px',
              objectFit: 'cover',
              borderTopLeftRadius: '0.375rem',
              borderTopRightRadius: '0.375rem'
            }}
            className="border-bottom"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/no-poster.jpg';
            }}
          />
          <Badge bg="dark" className="position-absolute top-0 end-0 m-2">
            <StarFill className="text-warning me-1" />
            {rating}
          </Badge>
        </div>
        <Card.Body className="d-flex flex-column p-3">
          <Card.Title className="fs-6 mb-2 text-truncate" title={title}>
            {title}
          </Card.Title>
          
          {releaseDate && (
            <Card.Subtitle className="text-muted small mb-2">
              {new Date(releaseDate).getFullYear() || 'Ano desconhecido'}
            </Card.Subtitle>
          )}
          
          <div className="mt-auto d-flex justify-content-between align-items-center">
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => removeFromWatchlist(item.id)}
            >
              <TrashFill className="me-1" /> Remover
            </Button>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => navigate(isMovie ? `/movies/${item.id}` : `/series/${item.id}`)}
            >
              <InfoCircleFill className="me-1" /> Detalhes
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  const removeFromWatchlist = async (mediaId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/users/${user.id}/watchlist/${mediaId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setWatchlist(watchlist.filter(item => item.id !== mediaId));
      setSuccess('Item removido da sua lista!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao remover item');
    }
  };

  if (!user) {
    return (
      <Container className="text-center my-5">
        <Alert variant="warning">
          Você precisa estar logado para acessar esta página
        </Alert>
        <Button variant="primary" onClick={() => navigate('/login')}>
          Fazer Login
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0 profile-container">
      {/* Banner Superior */}
      <div 
        className="position-relative" 
        style={{ 
          height: '300px', 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)'
        }}
      >
        <div className="position-absolute w-100 h-100 bg-black opacity-20"></div>
        <Container className="position-relative h-100 d-flex align-items-center">
          <Row className="align-items-center w-100">
            <Col xs={12} md={3} className="text-center mb-4 mb-md-0">
              <div className="position-relative d-inline-block">
                {renderAvatar()}
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Alterar foto</Tooltip>}
                >
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle shadow"
                    onClick={() => setShowAvatarModal(true)}
                    style={{ 
                      width: '36px', 
                      height: '36px',
                      border: '2px solid #fff'
                    }}
                    disabled={loading.avatar}
                  >
                    <CameraFill />
                  </Button>
                </OverlayTrigger>
              </div>
            </Col>
            <Col xs={12} md={9}>
              <h1 className="text-white mb-3">{user.name}</h1>
              <p className="text-light mb-2">
                <PersonBadge className="me-2" /> {user.email}
              </p>
              {user.bio && (
                <p className="text-light mb-3" style={{ fontSize: '1.1rem' }}>
                  <i>"{user.bio}"</i>
                </p>
              )}
              <div className="d-flex gap-3">
                <Badge bg="secondary" className="d-flex align-items-center">
                  <Film className="me-1" /> {watchlist.length} {watchlist.length === 1 ? 'item' : 'itens'} na lista
                </Badge>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Conteúdo Principal */}
      <Container className="py-4">
        {loading.data && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Carregando seus dados...</p>
          </div>
        )}
        
        {(error || success) && (
          <Alert 
            variant={error ? 'danger' : 'success'} 
            dismissible 
            onClose={() => error ? setError('') : setSuccess('')}
            className="animate__animated animate__fadeIn"
          >
            {error || success}
          </Alert>
        )}

        <Tabs
          activeKey={activeTab}
          onSelect={setActiveTab}
          className="mb-4"
          variant="pills"
        >
          {/* Aba de Perfil */}
          <Tab eventKey="profile" title={<><GearFill className="me-2" /> Perfil</>}>
            <Row>
              <Col lg={8}>
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4 d-flex align-items-center">
                      <GearFill className="me-2" /> Configurações do Perfil
                    </h4>

                    <Form onSubmit={handleProfileSubmit}>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nome</Form.Label>
                            <Form.Control
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({...formData, name: e.target.value})}
                              required
                              className="border-2"
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({...formData, email: e.target.value})}
                              required
                              className="border-2"
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>Biografia</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          placeholder="Conte um pouco sobre você..."
                          maxLength={200}
                          className="border-2"
                        />
                        <Form.Text className="text-muted">
                          Máximo 200 caracteres
                        </Form.Text>
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading.profile}
                        >
                          {loading.profile ? (
                            <>
                              <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                              Salvando...
                            </>
                          ) : 'Salvar Alterações'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4 d-flex align-items-center">
                      <Clock className="me-2" /> Status da Conta
                    </h4>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Status</span>
                        <span className="text-success">
                          <CheckCircleFill className="me-1" /> Ativa
                        </span>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Aba de Segurança */}
          <Tab eventKey="security" title={<><LockFill className="me-2" /> Segurança</>}>
            <Row>
              <Col lg={8}>
                <Card className="mb-4 border-0 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4 d-flex align-items-center">
                      <LockFill className="me-2" /> Alterar Senha
                    </h4>

                    <Form onSubmit={handlePasswordSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>Senha Atual</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          required
                          className="border-2"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Nova Senha</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          required
                          minLength="6"
                          className="border-2"
                        />
                        <Form.Text className="text-muted">
                          Mínimo 6 caracteres
                        </Form.Text>
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Confirmar Nova Senha</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          minLength="6"
                          className="border-2"
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading.password}
                        >
                          {loading.password ? (
                            <>
                              <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                              Alterando...
                            </>
                          ) : 'Alterar Senha'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4 d-flex align-items-center">
                      <LockFill className="me-2" /> Segurança
                    </h4>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Autenticação de dois fatores</span>
                        <Badge bg="secondary">Inativo</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Dispositivos conectados</span>
                        <Badge bg="secondary">1</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Sessões ativas</span>
                        <Button variant="link" size="sm">Gerenciar</Button>
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>
      </Container>

      {/* Modal para upload de avatar */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Alterar Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            {avatarPreview ? (
              <Image 
                src={avatarPreview} 
                roundedCircle 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  border: '3px solid #fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
                alt="Pré-visualização do avatar"
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center bg-secondary rounded-circle mx-auto"
                style={{ width: '200px', height: '200px' }}
              >
                <Person style={{ fontSize: '5rem', color: 'white' }} />
              </div>
            )}
          </div>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Selecione uma imagem (JPEG, PNG, GIF - Máx. 2MB)</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/jpeg, image/png, image/gif" 
              onChange={handleAvatarChange}
              className="border-2"
            />
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowAvatarModal(false)}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadAvatar} 
            disabled={!selectedFile || loading.avatar}
          >
            {loading.avatar ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                Enviando...
              </>
            ) : 'Salvar Alterações'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Estilos inline */}
      <style jsx>{`
        .profile-container {
          background-color: #f8f9fa;
        }
        .hover-effect:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .border-2 {
          border-width: 2px !important;
        }
      `}</style>
    </Container>
  );
};

export default Profile;