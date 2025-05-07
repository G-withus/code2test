//Redux state & reducers ကို define လုပ်မယ်။

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedItem: "Flight Map",// Default selected item
};

const selectedItemSlice = createSlice({
  name: "selectedItem",
  initialState,
  reducers: {
    setSelectedItem: (state, action) => {
      state.selectedItem = action.payload;
    },
  },
});

export const { setSelectedItem } = selectedItemSlice.actions;
export default selectedItemSlice.reducer;
