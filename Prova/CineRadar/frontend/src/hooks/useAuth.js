import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

// Exporte APENAS como nomeado (não use export default)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Não adicione export default aqui!