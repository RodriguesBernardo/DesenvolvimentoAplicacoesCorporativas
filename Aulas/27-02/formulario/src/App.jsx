import { useState } from "react";

function App() {
  // Estado inicial para armazenar os valores dos campos do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    experiencia: "",
    aceitaTermos: false,
    genero: "",
  });

  // Estado para armazenar os erros
  const [errors, setErrors] = useState({});

  // Função para lidar com as mudanças nos inputs
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    // Se o tipo for "checkbox", usamos 'checked' para o valor
    const valor = type === 'checkbox' ? checked : value;

    setFormData((prevData) => ({
      ...prevData,
      [name]: valor, // Atualiza o campo correto no estado
    }));
  };

  // Função para validar o formulário
  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome) {
      newErrors.nome = "O campo Nome é obrigatório";
    }
    if (!formData.email) {
      newErrors.email = "O campo Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Por favor, insira um email válido";
    }
    if (!formData.senha) {
      newErrors.senha = "O campo Senha é obrigatório";
    } else if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres";
    }
    if (!formData.experiencia) {
      newErrors.experiencia = "Por favor, selecione seu nível de experiência";
    }
    if (!formData.genero) {
      newErrors.genero = "Por favor, selecione seu gênero";
    }
    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você deve aceitar os termos e condições";
    }
    return newErrors;
  };

  // Função para lidar com a submissão do formulário
  const handleSubmit = (event) => {
    event.preventDefault(); // Impede o comportamento padrão do formulário

    const formErrors = validateForm();
    if (Object.keys(formErrors).length === 0) {
      // Se não houver erros, exibe os dados e limpa o formulário
      alert("Formulário enviado com sucesso!");
      console.log("Dados do formulário:", formData);
      setFormData({
        nome: "",
        email: "",
        senha: "",
        experiencia: "",
        aceitaTermos: false,
        genero: "",
      });
      setErrors({});
    } else {
      // Se houver erros, exibe as mensagens de erro
      setErrors(formErrors);
    }
  };

  return (
    <div> 
      <h2>Formulário Controlado</h2>
      <form onSubmit={handleSubmit}>
        {/* Campo Nome */}
        <div>
          <label>Nome:</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
          />
          {errors.nome && <p style={{ color: "red" }}>{errors.nome}</p>}
        </div>

        {/* Campo Email */}
        <div>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>

        {/* Campo Senha */}
        <div>
          <label>Senha:</label>
          <input
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
          />
          {errors.senha && <p style={{ color: "red" }}>{errors.senha}</p>}
        </div>

        {/* Campo de Seleção (Select) */}
        <div>
          <label>Experiência:</label>
          <select
            name="experiencia"
            value={formData.experiencia}
            onChange={handleChange}
          >
            <option value="">Selecione seu nível de experiência</option>
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
          {errors.experiencia && (
            <p style={{ color: "red" }}>{errors.experiencia}</p>
          )}
        </div>

        {/* Botões de Rádio (Radio Buttons) */}
        <div>
          <p>Gênero:</p>
          <label>
            <input
              type="radio"
              name="genero"
              value="Masculino"
              checked={formData.genero === "Masculino"}
              onChange={handleChange}
            />
            Masculino
          </label>
          <label>
            <input
              type="radio"
              name="genero"
              value="Feminino"
              checked={formData.genero === "Feminino"}
              onChange={handleChange}
            />
            Feminino
          </label>
          <label>
            <input
              type="radio"
              name="genero"
              value="Outro"
              checked={formData.genero === "Outro"}
              onChange={handleChange}
            />
            Outro
          </label>
          {errors.genero && <p style={{ color: "red" }}>{errors.genero}</p>}
        </div>

        {/* Caixa de Verificação (Checkbox) */}
        <div>
          <label>
            <input
              type="checkbox"
              name="aceitaTermos"
              checked={formData.aceitaTermos}
              onChange={handleChange}
            />
            Aceito os termos e condições
          </label>
          {errors.aceitaTermos && (
            <p style={{ color: "red" }}>{errors.aceitaTermos}</p>
          )}
        </div>

        {/* Botão para submeter o formulário */}
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default App;