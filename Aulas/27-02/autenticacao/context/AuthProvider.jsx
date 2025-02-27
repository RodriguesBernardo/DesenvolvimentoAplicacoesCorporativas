import { useState } from "react";
import AuthContext from "./AuthContext"; // Importa o AuthContext
// Provider para gerenciar o estado de autenticação
function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    name: "",
    password: "",
    isLoggedIn: false,
  });
  // Função de login
  const login = (name, password) => {
    setAuthState({
      name,
      password,
      isLoggedIn: true,
    });
  };

  // Função de logout
  const logout = () => {
    setAuthState({
      name: "",
      password: "",
      isLoggedIn: false,
    });
  };
  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export default AuthProvider;
