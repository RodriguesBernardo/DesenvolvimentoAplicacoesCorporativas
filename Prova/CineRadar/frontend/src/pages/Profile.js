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
  ListGroup,
  FloatingLabel,
  InputGroup
} from 'react-bootstrap';
import { 
  GearFill, 
  LockFill, 
  PersonBadge,
  CameraFill,
  Person,
  Clock,
  CheckCircleFill,
  HeartFill,
  Search,
  BookmarkFill,
  Sliders
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Lista de gêneros de filmes
const movieGenres = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 10770, name: 'Cinema TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' }
];

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
    genres: false
  });
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Estados para gêneros
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [genreFilter, setGenreFilter] = useState('');

  // Função para obter headers de autenticação
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  // Carrega as preferências do usuário
  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, genres: true }));
    setError('');
    
    try {
      const response = await axios.get(
        `${API_BASE_URL}/users/${user.id}/preferences`,
        getAuthHeaders()
      );
      
      if (response.data?.preferences?.genres) {
        const genreIds = response.data.preferences.genres
          .split(',')
          .filter(id => id.trim() !== '')
          .map(id => parseInt(id.trim()));
        setSelectedGenres(genreIds);
      }
    } catch (err) {
      console.error('Erro ao carregar preferências:', err);
      if (err.response?.status !== 404) {
        setError('Erro ao carregar gêneros preferidos');
      }
    } finally {
      setLoading(prev => ({ ...prev, genres: false }));
    }
  }, [user?.id]);

  // Inicializa os dados do formulário
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      
      // Configura o avatar
      if (user.avatar) {
        const avatarUrl = user.avatar.startsWith('http') 
          ? user.avatar 
          : `${API_BASE_URL}${user.avatar}`;
        setAvatarPreview(avatarUrl);
      } else {
        setAvatarPreview(null);
      }
      
      loadUserPreferences();
    }
  }, [user, loadUserPreferences]);

  // Filtra gêneros baseado na busca
  const filteredGenres = movieGenres.filter(genre =>
    genre.name.toLowerCase().includes(genreFilter.toLowerCase())
  );

  // Atualiza perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(prev => ({ ...prev, profile: true }));
  
    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}`,
        {
          name: formData.name,
          email: formData.email,
          bio: formData.bio || null
        },
        getAuthHeaders()
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

  // Altera senha
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
        getAuthHeaders()
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

  // Manipula alteração de avatar
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

  // Envia novo avatar
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

      const config = {
        ...getAuthHeaders(),
        'Content-Type': 'multipart/form-data'
      };

      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}/avatar`,
        formData,
        config
      );
      
      updateUser({ 
        ...user, 
        avatar: response.data.avatar
      });
      
      setAvatarPreview(response.data.avatar);
      setShowAvatarModal(false);
      setSuccess('Avatar atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar avatar');
    } finally {
      setLoading(prev => ({ ...prev, avatar: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Alterna seleção de gênero
  const handleGenreToggle = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  // Salva gêneros preferidos
  const savePreferredGenres = async () => {
    if (!user?.id) return;
    
    setLoading(prev => ({ ...prev, genres: true }));
    setError('');
    setSuccess('');
    
    try {
      await axios.put(
        `${API_BASE_URL}/users/${user.id}/preferences`,
        {
          genres: selectedGenres.join(',')
        },
        getAuthHeaders()
      );
      
      setSuccess('Gêneros favoritos atualizados com sucesso!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err.response?.data?.error || 'Erro ao salvar gêneros favoritos');
    } finally {
      setLoading(prev => ({ ...prev, genres: false }));
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Renderiza avatar
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
    <Container fluid className="px-0 profile-container bg-light">
      {/* Header com background gradiente */}
      <div className="profile-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        height: '300px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 60%)'
        }}></div>
        
        <Container className="h-100 position-relative">
          <Row className="h-100 align-items-center">
            <Col md={3} className="text-center">
              <div className="avatar-container position-relative d-inline-block">
                {renderAvatar()}
                <OverlayTrigger
                  placement="bottom"
                  overlay={<Tooltip>Alterar foto</Tooltip>}
                >
                  <Button 
                    variant="light" 
                    size="sm" 
                    className="position-absolute bottom-0 end-0 rounded-circle shadow-sm"
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
            <Col md={9}>
              <h1 className="text-white mb-2 fw-bold">{user.name}</h1>
              <p className="text-white-80 mb-3">
                <PersonBadge className="me-2" /> {user.email}
              </p>
              {user.bio && (
                <p className="text-white-80 mb-3 fst-italic" style={{ fontSize: '1.1rem' }}>
                  "{user.bio}"
                </p>
              )}
              <Badge bg="light" text="dark" className="d-flex align-items-center py-2 px-3 rounded-pill">
                <HeartFill className="me-1 text-danger" /> {selectedGenres.length} gêneros favoritos
              </Badge>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Conteúdo principal */}
      <Container className="py-5 mt-n5" style={{ position: 'relative', zIndex: 1 }}>
        {/* Card de abas flutuante */}
        <Card className="border-0 shadow-sm mb-4 overflow-hidden">
          <Tabs
            activeKey={activeTab}
            onSelect={setActiveTab}
            className="px-3 pt-3"
            variant="pills"
          >
            <Tab eventKey="profile" title={<><GearFill className="me-2" /> Perfil</>}>
              <Row className="g-4 mt-2">
                <Col lg={8}>
                  {/* Card de configurações de perfil */}
                  <Card className="border-0 mb-4">
                    <Card.Body>
                      <h4 className="mb-4 d-flex align-items-center text-primary">
                        <GearFill className="me-2" /> Configurações do Perfil
                      </h4>

                      <Form onSubmit={handleProfileSubmit}>
                        <Row className="g-3">
                          <Col md={6}>
                            <FloatingLabel controlId="floatingName" label="Nome" className="mb-3">
                              <Form.Control
                                type="text"
                                placeholder="Nome"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                                className="border-2"
                              />
                            </FloatingLabel>
                          </Col>
                          <Col md={6}>
                            <FloatingLabel controlId="floatingEmail" label="Email" className="mb-3">
                              <Form.Control
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                required
                                className="border-2"
                              />
                            </FloatingLabel>
                          </Col>
                        </Row>
                        
                        <FloatingLabel controlId="floatingBio" label="Biografia" className="mb-3">
                          <Form.Control
                            as="textarea"
                            placeholder="Biografia"
                            style={{ height: '100px' }}
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                            maxLength={200}
                            className="border-2"
                          />
                        </FloatingLabel>
                        
                        <div className="d-flex justify-content-end mt-3">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading.profile}
                            className="px-4 py-2 rounded-pill"
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

                  {/* Card de seleção de gêneros */}
                  <Card className="border-0 mb-4">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0 d-flex align-items-center text-primary">
                          <Sliders className="me-2" /> Gêneros Preferidos
                        </h4>
                        <Badge pill bg="primary">
                          {selectedGenres.length} selecionados
                        </Badge>
                      </div>
                      
                      {loading.genres ? (
                        <div className="text-center py-4">
                          <Spinner animation="border" variant="primary" />
                          <p className="mt-2">Carregando gêneros...</p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4">
                            <InputGroup className="mb-3">
                              <InputGroup.Text>
                                <Search />
                              </InputGroup.Text>
                              <Form.Control
                                placeholder="Buscar gêneros..."
                                value={genreFilter}
                                onChange={(e) => setGenreFilter(e.target.value)}
                              />
                            </InputGroup>
                            
                            <div className="genre-grid">
                              {filteredGenres.map(genre => (
                                <div
                                  key={genre.id}
                                  className={`genre-card ${selectedGenres.includes(genre.id) ? 'selected' : ''}`}
                                  onClick={() => handleGenreToggle(genre.id)}
                                >
                                  <div className="genre-content">
                                    {genre.name}
                                    {selectedGenres.includes(genre.id) && (
                                      <div className="genre-check">
                                        <CheckCircleFill />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="d-flex justify-content-end">
                            <Button
                              variant="primary"
                              onClick={savePreferredGenres}
                              disabled={loading.genres || selectedGenres.length === 0}
                              className="px-4 py-2 rounded-pill"
                            >
                              {loading.genres ? (
                                <>
                                  <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <BookmarkFill className="me-2" />
                                  Salvar Preferências
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={4}>
                  {/* Card de status da conta */}
                  <Card className="border-0 h-100">
                    <Card.Body>
                      <h4 className="mb-4 d-flex align-items-center text-primary">
                        <Clock className="me-2" /> Status da Conta
                      </h4>
                      <ListGroup variant="flush" className="border-top">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Status</span>
                          <Badge pill bg="success">
                            <CheckCircleFill className="me-1" /> Ativa
                          </Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Gêneros favoritos</span>
                          <Badge pill bg="primary">
                            {selectedGenres.length}
                          </Badge>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>

            {/* Aba de segurança */}
            <Tab eventKey="security" title={<><LockFill className="me-2" /> Segurança</>}>
              <Row className="g-4 mt-2">
                <Col lg={8}>
                  <Card className="border-0">
                    <Card.Body>
                      <h4 className="mb-4 d-flex align-items-center text-primary">
                        <LockFill className="me-2" /> Alterar Senha
                      </h4>

                      <Form onSubmit={handlePasswordSubmit}>
                        <FloatingLabel controlId="floatingCurrentPassword" label="Senha Atual" className="mb-3">
                          <Form.Control
                            type="password"
                            placeholder="Senha Atual"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            required
                            className="border-2"
                          />
                        </FloatingLabel>
                        
                        <FloatingLabel controlId="floatingNewPassword" label="Nova Senha" className="mb-3">
                          <Form.Control
                            type="password"
                            placeholder="Nova Senha"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            required
                            minLength="6"
                            className="border-2"
                          />
                          <Form.Text className="text-muted">
                            Mínimo 6 caracteres
                          </Form.Text>
                        </FloatingLabel>
                        
                        <FloatingLabel controlId="floatingConfirmPassword" label="Confirmar Nova Senha" className="mb-4">
                          <Form.Control
                            type="password"
                            placeholder="Confirmar Nova Senha"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            required
                            minLength="6"
                            className="border-2"
                          />
                        </FloatingLabel>
                        
                        <div className="d-flex justify-content-end">
                          <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading.password}
                            className="px-4 py-2 rounded-pill"
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
                  <Card className="border-0 h-100">
                    <Card.Body>
                      <h4 className="mb-4 d-flex align-items-center text-primary">
                        <LockFill className="me-2" /> Segurança
                      </h4>
                      <ListGroup variant="flush" className="border-top">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Autenticação de dois fatores</span>
                          <Badge pill bg="secondary">Inativo</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Dispositivos conectados</span>
                          <Badge pill bg="primary">1</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Último login</span>
                          <span className="text-muted">Hoje</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-3">
                          <span className="fw-medium">Sessões ativas</span>
                          <Button variant="link" size="sm" className="p-0">Gerenciar</Button>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab>
          </Tabs>
        </Card>

        {/* Mensagens de erro/sucesso */}
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
      </Container>

      {/* Modal de upload de avatar */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="text-primary">Alterar Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <div className="text-center mb-4">
            {avatarPreview ? (
              <Image 
                src={avatarPreview} 
                roundedCircle 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  border: '3px solid #f8f9fa',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                alt="Pré-visualização do avatar"
              />
            ) : (
              <div 
                className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto"
                style={{ 
                  width: '200px', 
                  height: '200px',
                  border: '3px dashed #dee2e6'
                }}
              >
                <Person style={{ fontSize: '5rem', color: '#adb5bd' }} />
              </div>
            )}
          </div>
          
          <Form.Group controlId="formFile" className="mb-4">
            <Form.Label className="fw-medium mb-2">Selecione uma imagem</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/jpeg, image/png, image/gif" 
              onChange={handleAvatarChange}
              className="border-2 py-3"
            />
            <Form.Text className="text-muted">
              Formatos: JPEG, PNG, GIF (Máx. 2MB)
            </Form.Text>
            {error && <Form.Text className="text-danger">{error}</Form.Text>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="light" 
            onClick={() => setShowAvatarModal(false)}
            className="rounded-pill px-4"
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadAvatar} 
            disabled={!selectedFile || loading.avatar}
            className="rounded-pill px-4"
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

      {/* Estilos CSS */}
      <style>{`
        .profile-container {
          min-height: 100vh;
        }
        
        .profile-header {
          position: relative;
          overflow: hidden;
        }
        
        .avatar-container {
          position: relative;
          z-index: 2;
        }
        
        .genre-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }
        
        .genre-card {
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        
        .genre-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-color: #dee2e6;
        }
        
        .genre-card.selected {
          background-color: #f8f9fa;
          border-color: #0d6efd;
          box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
        }
        
        .genre-card.selected .genre-content {
          color: #0d6efd;
          font-weight: 500;
        }
        
        .genre-content {
          position: relative;
          padding-right: 24px;
        }
        
        .genre-check {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          color: #0d6efd;
          font-size: 1.2rem;
        }
        
        @media (max-width: 768px) {
          .genre-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
        
        @media (max-width: 576px) {
          .profile-header {
            height: auto;
            padding: 30px 0;
          }
          
          .genre-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
        }
      `}</style>
    </Container>
  );
};

export default Profile;