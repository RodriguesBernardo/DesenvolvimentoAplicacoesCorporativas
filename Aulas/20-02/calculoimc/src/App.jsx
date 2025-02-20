import { useState } from "react";

function IMCCalculator() {
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [resultado, setResultado] = useState(null);
  const [classe, setClasse] = useState("");

  const calcularIMC = () => {
    if (!peso || !altura) return;
    const alturaM = parseFloat(altura);
    const pesoKg = parseFloat(peso);
    const imc = pesoKg / (alturaM * alturaM);
    setResultado(imc.toFixed(1));

    if (imc < 18.5) setClasse("Abaixo do peso");
    else if (imc < 25) setClasse("Peso normal");
    else if (imc < 30) setClasse("Sobrepeso");
    else if (imc < 35) setClasse("Obesidade grau 1");
    else if (imc < 40) setClasse("Obesidade grau 2");
    else setClasse("Obesidade grau 3");
  };

  return (
    <div style={{ alignItems: "center",textAlign: "center" }}>
      <h1>Calculadora de IMC</h1>
      <div>
        <input
          type="number"
          placeholder="Digite o peso (kg)"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
        />
        <input
          type="number"
          placeholder="Digite a altura (m)"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
        />
        <button onClick={calcularIMC}>Calcular</button>
      </div>
      {resultado && (
        <div>
          <p>Seu IMC é: {resultado}</p>
          <p>Você está: {classe}</p>
        </div>
      )}
      <table border={1}>
        <thead>
          <tr>
            <th>IMC</th>
            <th>Classificação</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Menos de 18,5</td>
            <td>Abaixo do peso</td>
          </tr>
          <tr>
            <td>18,5 a 24,9</td>
            <td>Peso normal</td>
          </tr>
          <tr>
            <td>25 a 29,9</td>
            <td>Sobrepeso</td>
          </tr>
          <tr>
            <td>30 a 34,9</td>
            <td>Obesidade grau 1</td>
          </tr>
          <tr>
            <td>35 a 39,9</td>
            <td>Obesidade grau 2</td>
          </tr>
          <tr>
            <td>40 ou mais</td>
            <td>Obesidade grau 3</td>
          </tr>
        </tbody>
      </table>
    </div>
    

  );
}

export default IMCCalculator;
