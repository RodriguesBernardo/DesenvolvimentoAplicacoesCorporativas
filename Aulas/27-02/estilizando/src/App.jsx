import { useState } from "react";
import styled, { ThemeProvider } from "styled-components";
import { temaClaro, temaEscuro } from "./theme";
// Componentes estilizados
const Container = styled.div`
  background-color: ${(props) => props.theme.cores.fundo};
  color: ${(props) => props.theme.cores.texto};
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
`;
const Titulo = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
`;
const Paragrafo = styled.p`
  font-size: 18px;
`;
const Botao = styled.button`
  background-color: ${(props) => props.theme.cores.botaoFundo};
  color: ${(props) => props.theme.cores.botaoTexto};
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
`;
function App() {
  const [temaAtual, setTemaAtual] = useState(temaClaro);
  // Alterna entre tema claro e escuro
  const alternarTema = () => {
    setTemaAtual(temaAtual === temaClaro ? temaEscuro : temaClaro);
  };
  return (
    <ThemeProvider theme={temaAtual}>
      <Container>
        <Titulo>Bem-vindo ao Meu App</Titulo>
        <Paragrafo>
          Este é um exemplo de alternância de temas com Styled Components.
        </Paragrafo>
        <Botao onClick={alternarTema}>
          Alternar para {temaAtual === temaClaro ? "Tema Escuro" : "Tema Claro"}
        </Botao>
      </Container>
    </ThemeProvider>
  );
}
export default App;
