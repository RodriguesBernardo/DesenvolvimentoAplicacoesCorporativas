import React, { useState, useEffect } from 'react';
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
  ProgressBar,
  ListGroup,
  Modal,
  Spinner
} from 'react-bootstrap';
import { 
  StarFill, 
  GearFill, 
  LockFill, 
  Film, 
  HeartFill, 
  Trophy,
  PersonBadge,
  ClockHistory,
  PencilFill,
  CheckCircleFill,
  ExclamationTriangleFill,
  CameraFill
} from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


// Definindo a constante API_BASE_URL localmente
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
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [stats, setStats] = useState({
    moviesWatched: 0,
    hoursWatched: 0,
    favoriteGenre: 'Nenhum ainda',
    reviewsWritten: 0,
    listsCreated: 0
  });
  const [achievements, setAchievements] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  // Carrega os dados iniciais
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      setAvatarPreview(user.avatar || 'https://via.placeholder.com/150');
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [watchlistRes, statsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/users/${user.id}/watchlist`),
        axios.get(`${API_BASE_URL}/users/${user.id}/stats`),
        axios.get(`${API_BASE_URL}/users/${user.id}/activity`)
      ]);

      setWatchlist(watchlistRes.data.slice(0, 5));
      setStats(statsRes.data);
      setRecentActivity(activityRes.data.slice(0, 5));
      setAchievements(calculateAchievements(statsRes.data));
    } catch (err) {
      setError('Erro ao carregar dados do usuário');
      console.error('Error loading user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAchievements = (userStats) => {
    const achievements = [];
    
    if (userStats.moviesWatched >= 10) {
      achievements.push({
        title: 'Iniciante',
        description: 'Assistiu 10 filmes',
        progress: Math.min(100, (userStats.moviesWatched / 10) * 100),
        completed: userStats.moviesWatched >= 10,
        icon: '🎬'
      });
    }
    
    if (userStats.moviesWatched >= 50) {
      achievements.push({
        title: 'Cinéfilo',
        description: 'Assistiu 50 filmes',
        progress: Math.min(100, (userStats.moviesWatched / 50) * 100),
        completed: userStats.moviesWatched >= 50,
        icon: '🍿'
      });
    }
    
    if (userStats.hoursWatched >= 24) {
      achievements.push({
        title: 'Maratonista',
        description: 'Assistiu 24 horas de conteúdo',
        progress: Math.min(100, (userStats.hoursWatched / 24) * 100),
        completed: userStats.hoursWatched >= 24,
        icon: '⏱️'
      });
    }
    
    if (userStats.reviewsWritten >= 5) {
      achievements.push({
        title: 'Crítico',
        description: 'Escreveu 5 reviews',
        progress: Math.min(100, (userStats.reviewsWritten / 5) * 100),
        completed: userStats.reviewsWritten >= 5,
        icon: '✍️'
      });
    }
    
    if (userStats.listsCreated > 0) {
      achievements.push({
        title: 'Organizador',
        description: 'Criou uma lista',
        progress: 100,
        completed: true,
        icon: '📋'
      });
    }
    
    return achievements;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/users/${user.id}/profile`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      updateUser(response.data.user);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
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
    setLoading(true);

    try {
      await axios.put(
        `${API_BASE_URL}/users/${user.id}/password`,
        passwordData,
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
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadAvatar = async () => {
    if (!selectedFile) {
      return setError('Selecione uma imagem');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await axios.post(
        `${API_BASE_URL}/users/${user.id}/avatar`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      updateUser(response.data.user);
      setShowAvatarModal(false);
      setSuccess('Avatar atualizado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao atualizar avatar');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const renderActivityIcon = (activityType) => {
    switch(activityType) {
      case 'WATCHED': return <Film className="text-primary" />;
      case 'REVIEW': return <PencilFill className="text-warning" />;
      case 'RATING': return <StarFill className="text-info" />;
      case 'WATCHLIST': return <CheckCircleFill className="text-success" />;
      default: return <ExclamationTriangleFill className="text-secondary" />;
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
    <Container fluid className="px-0">
      {/* Banner Superior */}
      <div className="bg-dark position-relative" style={{ height: '300px', overflow: 'hidden' }}>
        <div className="position-absolute w-100 h-100 bg-black opacity-50"></div>
        <Container className="position-relative h-100">
          <Row className="align-items-center h-100">
            <Col xs={12} md={3} className="text-center mb-4 mb-md-0">
              <div className="position-relative d-inline-block">
                <Image 
                  src={avatarPreview} 
                  roundedCircle 
                  className="shadow"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  className="position-absolute bottom-0 end-0 rounded-circle"
                  onClick={() => setShowAvatarModal(true)}
                  style={{ width: '36px', height: '36px' }}
                >
                  <CameraFill />
                </Button>
              </div>
            </Col>
            <Col xs={12} md={9}>
              <div className="d-flex align-items-center mb-2">
                <h1 className="text-white mb-0">{user.name}</h1>
                {user.isPremium && (
                  <Badge pill bg="warning" className="ms-3">
                    <StarFill className="me-1" /> PREMIUM
                  </Badge>
                )}
              </div>
              <p className="text-light">
                <PersonBadge className="me-2" /> {user.email}
              </p>
              <div className="d-flex flex-wrap gap-3">
                <div className="d-flex align-items-center text-white">
                  <Film size={20} className="me-2" />
                  <span>{stats.moviesWatched} filmes</span>
                </div>
                <div className="d-flex align-items-center text-white">
                  <ClockHistory size={20} className="me-2" />
                  <span>{stats.hoursWatched} horas</span>
                </div>
                <div className="d-flex align-items-center text-white">
                  <HeartFill size={20} className="me-2" />
                  <span>Favorito: {stats.favoriteGenre}</span>
                </div>
                <div className="d-flex align-items-center text-white">
                  <PencilFill size={20} className="me-2" />
                  <span>{stats.reviewsWritten} reviews</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Conteúdo Principal */}
      <Container className="py-4">
        {loading && (
          <div className="text-center my-4">
            <Spinner animation="border" variant="primary" />
          </div>
        )}
        
        {(error || success) && (
          <Alert variant={error ? 'danger' : 'success'} dismissible onClose={() => error ? setError('') : setSuccess('')}>
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
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
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
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? (
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

                <Card className="shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
                      <ClockHistory className="me-2" /> Atividade Recente
                    </h4>
                    {recentActivity.length > 0 ? (
                      <ListGroup variant="flush">
                        {recentActivity.map((activity, index) => (
                          <ListGroup.Item key={index} className="d-flex align-items-center">
                            <div className="me-3">
                              {renderActivityIcon(activity.type)}
                            </div>
                            <div>
                              <div className="fw-bold">{activity.title}</div>
                              <small className="text-muted">
                                {new Date(activity.date).toLocaleDateString()} • {activity.description}
                              </small>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <Alert variant="info">
                        Nenhuma atividade recente encontrada.
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={4}>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
                      <Trophy className="me-2" /> Conquistas
                    </h4>
                    {achievements.length > 0 ? (
                      achievements.map((achievement, index) => (
                        <div key={index} className="mb-3">
                          <div className="d-flex align-items-center mb-1">
                            <span className="me-2 fs-5">{achievement.icon}</span>
                            <div>
                              <h6 className="mb-0">{achievement.title}</h6>
                              <small className="text-muted">{achievement.description}</small>
                            </div>
                            {achievement.completed && (
                              <Badge bg="success" className="ms-auto">
                                Concluído
                              </Badge>
                            )}
                          </div>
                          {!achievement.completed && (
                            <ProgressBar now={achievement.progress} variant="warning" className="mt-2" />
                          )}
                        </div>
                      ))
                    ) : (
                      <Alert variant="info">
                        Complete atividades para desbloquear conquistas!
                      </Alert>
                    )}
                  </Card.Body>
                </Card>

                <Card className="shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
                      <Film className="me-2" /> Estatísticas
                    </h4>
                    <div className="mb-3">
                      <h6>Gêneros Assistidos</h6>
                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <Badge bg="primary">Ação</Badge>
                        <Badge bg="primary">Drama</Badge>
                        <Badge bg="primary">Comédia</Badge>
                        <Badge bg="primary">Ficção Científica</Badge>
                      </div>
                    </div>
                    <div className="mb-3">
                      <h6>Progresso Mensal</h6>
                      <ProgressBar className="mt-2">
                        <ProgressBar variant="success" now={35} key={1} label="Assistidos" />
                        <ProgressBar variant="info" now={15} key={2} label="Na lista" />
                        <ProgressBar variant="warning" now={10} key={3} label="Pendentes" />
                      </ProgressBar>
                    </div>
                    <div>
                      <h6>Metas</h6>
                      <div className="d-flex justify-content-between">
                        <small>Assistir 50 filmes</small>
                        <small>{stats.moviesWatched}/50</small>
                      </div>
                      <ProgressBar now={(stats.moviesWatched / 50) * 100} className="mt-1" />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Aba de Segurança */}
          <Tab eventKey="security" title={<><LockFill className="me-2" /> Segurança</>}>
            <Row>
              <Col lg={8}>
                <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
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
                        />
                      </Form.Group>
                      <Form.Group className="mb-4">
                        <Form.Label>Confirmar Nova Senha</Form.Label>
                        <Form.Control
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          required
                          minLength="6"
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button variant="primary" type="submit" disabled={loading}>
                          {loading ? (
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
                <Card className="shadow-sm">
                  <Card.Body>
                    <h4 className="mb-4">
                      <LockFill className="me-2" /> Segurança da Conta
                    </h4>
                    <ListGroup variant="flush">
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Autenticação de dois fatores</span>
                        <Button variant="outline-secondary" size="sm">Ativar</Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Dispositivos conectados</span>
                        <Badge bg="secondary">3</Badge>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Sessões ativas</span>
                        <Button variant="link" size="sm">Gerenciar</Button>
                      </ListGroup.Item>
                      <ListGroup.Item className="d-flex justify-content-between align-items-center">
                        <span>Notificações de segurança</span>
                        <Form.Check type="switch" defaultChecked />
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Aba de Watchlist */}
          <Tab eventKey="watchlist" title={<><Film className="me-2" /> Minha Lista</>}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0">
                    <Film className="me-2" /> Minha Watchlist
                  </h4>
                  <Badge bg="primary">{watchlist.length} itens</Badge>
                </div>
                {watchlist.length > 0 ? (
                  <Row xs={2} md={3} lg={5} className="g-3">
                    {watchlist.map((item) => (
                      <Col key={item.movie_id}>
                        <Card className="h-100">
                          <Card.Img 
                            variant="top" 
                            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} 
                            alt={item.title}
                            style={{ objectFit: 'cover', height: '200px' }}
                          />
                          <Card.Body className="d-flex flex-column">
                            <Card.Title className="fs-6">{item.title}</Card.Title>
                            <div className="mt-auto">
                              <Badge bg="secondary">{item.genre}</Badge>
                              <Button variant="outline-danger" size="sm" className="mt-2 w-100">
                                Remover
                              </Button>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">
                    Sua watchlist está vazia. Adicione filmes para assistir mais tarde!
                  </Alert>
                )}
                <div className="text-center mt-4">
                  <Button variant="primary">Ver Lista Completa</Button>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      </Container>

      {/* Modal para upload de avatar */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Alterar Avatar</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <Image 
              src={avatarPreview} 
              roundedCircle 
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          </div>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Selecione uma imagem</Form.Label>
            <Form.Control 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarChange}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleUploadAvatar} 
            disabled={!selectedFile || loading}
          >
            {loading ? (
              <>
                <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                Enviando...
              </>
            ) : 'Salvar Alterações'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Profile;