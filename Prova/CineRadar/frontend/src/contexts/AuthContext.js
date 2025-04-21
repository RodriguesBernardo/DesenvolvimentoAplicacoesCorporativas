import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carrega usuário do localStorage de forma segura
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('cineRadarUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        localStorage.removeItem('cineRadarUser');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login - usando useCallback para memoização
  const login = useCallback(async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) throw new Error('Login falhou');
  
      const userData = await response.json();
      
      setCurrentUser(userData);
      localStorage.setItem('cineRadarUser', JSON.stringify(userData));
      localStorage.setItem('userId', userData.id); // Armazena o ID separadamente
      localStorage.setItem('token', userData.token); // Armazena o token
      
      return { success: true };
    } catch (error) {
      console.error("Erro no login:", error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateUser = useCallback((newUserData) => {
    setCurrentUser(prev => {
      const updatedUser = { ...prev, ...newUserData };
      localStorage.setItem('cineRadarUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  // Logout 
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('cineRadarUser');
  }, []);

  // Verifica autenticação
  const isAuthenticated = useCallback(() => {
    return !!currentUser;
  }, [currentUser]);

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook useAuth com verificação de contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}