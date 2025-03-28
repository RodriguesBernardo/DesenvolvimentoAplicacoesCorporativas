import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <Alert variant="danger" className="text-center mt-5">
      <h4>Página não encontrada</h4>
      <Button onClick={() => navigate('/')} className="mt-3">
        Voltar para a página inicial
      </Button>
    </Alert>
  );
};

export default NotFound;