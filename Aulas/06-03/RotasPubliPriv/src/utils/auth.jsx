import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Criação do contexto de autenticação
const AuthContext = createContext();
// Provedor de autenticação
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação (em memória)
  const login = () => {
    setIsAuthenticated(true); // Simula o login
  };
  const logout = () => {
    setIsAuthenticated(false); // Simula o logout
  };
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
// Hook personalizado para acessar o contexto de autenticação
export function useAuth() {
  return useContext(AuthContext);
}
// Componente para proteger as rotas privadas
export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login"); // Redireciona para login se não estiver autenticado
    }
  }, [isAuthenticated, navigate]); // UseEffect irá rodar quando isAuthenticated ou navigate mudar
  // Retorna null enquanto o redirecionamento não foi feito
  if (!isAuthenticated) {
    return null;
  }
  // Renderiza os filhos se estiver autenticado
  return children;
}
