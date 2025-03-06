import { Link, Outlet, useLoaderData } from "react-router-dom";
import "./CustomerList.css";

function CustomerList() {
  const customers = useLoaderData();
  return (
    <div className="container">
      <h1>Lista de Clientes</h1>
      <ul className="customer-list">
        {customers.map((customer) => (
          <li key={customer.id}>
            <Link to={`/customers/${customer.id}`}>{customer.name}</Link>
          </li>
        ))}
      </ul>
      <Outlet />
    </div>
  );
}

export default CustomerList;