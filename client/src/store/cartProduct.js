import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart : []
}

const cartSlice = createSlice({
    name : "cartItem",
    initialState : initialState,
    reducers : {
        handleAddItemCart : (state,action)=>{
           state.cart = [...action.payload]
        },
        addLocalCartItem: (state, action) => {
            const product = action.payload;
            state.cart.push({
                id: `local-${product.id}`,
                productId: product,
                quantity: 1
            });
        },
        updateLocalCartItemQty: (state, action) => {
            const { id, qty } = action.payload;
            const itemIndex = state.cart.findIndex(item => item.id === id);
            if (itemIndex > -1) {
                state.cart[itemIndex].quantity = qty;
            }
        },
        deleteLocalCartItem: (state, action) => {
            const id = action.payload;
            state.cart = state.cart.filter(item => item.id !== id);
        }
    }
})

export const { handleAddItemCart, addLocalCartItem, updateLocalCartItemQty, deleteLocalCartItem } = cartSlice.actions

export default cartSlice.reducer