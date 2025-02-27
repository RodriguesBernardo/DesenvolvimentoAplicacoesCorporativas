function CartItem({ item, removeItem }) {
  return (
    <li>
      {item.name} (Quantidade: {item.quantity}){" "}
      <button onClick={() => removeItem(item.name)}>Remover</button>
    </li>
  );
}
export default CartItem;
