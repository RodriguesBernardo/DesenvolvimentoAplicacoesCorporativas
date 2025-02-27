export const addItemAction = (name) => ({
    type: "ADD_ITEM",
    payload: { name },
});

export const removeItemAction = (name) => ({
    type: "REMOVE_ITEM",
    payload: { name },
});

export const clearCartAction = () => ({
    type: "CLEAR_CART",
});