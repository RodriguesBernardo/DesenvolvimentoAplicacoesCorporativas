const initialState = [];
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const itemIndex = state.findIndex(
        (item) => item.name === action.payload.name
      );
      if (itemIndex > -1) {
        const updatedState = [...state];
        updatedState[itemIndex].quantity += 1;
        return updatedState;
      }
      return [...state, { name: action.payload.name, quantity: 1 }];
    }
    case "REMOVE_ITEM":
      return state.filter((item) => item.name !== action.payload.name);
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
}
export { cartReducer, initialState };
