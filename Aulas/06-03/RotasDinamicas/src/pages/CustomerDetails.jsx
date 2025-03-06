import { useLoaderData, Link } from "react-router-dom";
import './CustomerDetails.css';

function CustomerDetails() {
  const customer = useLoaderData();
  return (
    <div className="customer-details">
      <h2>Detalhes do Cliente</h2>
      <p><strong>Nome:</strong> {customer.name}</p>
      <p><strong>Email:</strong> {customer.email}</p>
      <p><strong>Telefone:</strong> {customer.phone}</p>
      <p><strong>Endereço:</strong> {customer.address}</p>
      <Link to="/customers" className="back-link">-- Voltar à lista de clientes</Link>
    </div>
  );
}

export default CustomerDetails;