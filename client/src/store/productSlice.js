import { createSlice } from "@reduxjs/toolkit";

const initialValue = {
  allCategory: [],
  loadingCategory: false,
  allSubCategory: [],
  product: [],
};

const productSlice = createSlice({
  name: "product",
  initialState: initialValue,
  reducers: {
    setAllcategory: (state, action) => {
      state.allCategory = [...action.payload];
    },
    setLoadingCategory : (state,action)=>{
       state.loadingCategory = action.payload
    },
    setAllSubcategory: (state, action) => {
      state.allSubCategory = [...action.payload];
    },
  },
});

export const { setAllcategory,setAllSubcategory,setLoadingCategory } = productSlice.actions;

export default productSlice.reducer;
