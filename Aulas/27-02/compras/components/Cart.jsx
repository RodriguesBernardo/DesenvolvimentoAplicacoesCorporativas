import { useReducer } from "react";
import { cartReducer, initialState } from "../reducers/cartReducer";
import {
  addItemAction,
  removeItemAction,
  clearCartAction,
} from "../actions/cartActions";
import CartItem from "./CartItem";
function Cart() {
  const [cart, dispatch] = useReducer(cartReducer, initialState);
  const addItem = (name) => {
    dispatch(addItemAction(name));
  };
  const removeItem = (name) => {
    dispatch(removeItemAction(name));
  };
  const clearCart = () => {
    dispatch(clearCartAction());
  };
  return (
    <div>
      <h2>Carrinho de Compras</h2>
      <button onClick={() => addItem("Maçã")}>Adicionar Maçã</button>
      <button onClick={() => addItem("Banana")}>Adicionar Banana</button>
      <button onClick={() => addItem("Laranja")}>Adicionar Laranja</button>
      <ul>
        {cart.length > 0 ? (
          cart.map((item, index) => (
            <CartItem key={index} item={item} removeItem={removeItem} />
          ))
        ) : (
          <p>O carrinho está vazio.</p>
        )}
      </ul>
      {cart.length > 0 && <button onClick={clearCart}>Limpar Carrinho</button>}
    </div>
  );
}
export default Cart;
