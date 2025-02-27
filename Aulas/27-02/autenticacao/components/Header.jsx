import { useContext } from "react";
import AuthContext from "../context/AuthContext"; // Importa o AuthContext
function Header() {
  const { authState } = useContext(AuthContext);
  return (
    <header style={{padding: "10px" }}>
      <h1>Minha Aplicação</h1>
      {authState.isLoggedIn ? (
        <p>Usuário logado: {authState.name}</p>
      ) : (
        <p>Nenhum usuário logado</p>
      )}
    </header>
  );
}
export default Header;
