import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDrawerOpen: false,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    toggleSideMenuDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
    setSideMenuDrawer: (state, action) => {
      state.isDrawerOpen = action.payload;
    },
  },
});

export const { toggleSideMenuDrawer, setSideMenuDrawer } = systemSlice.actions;
export default systemSlice.reducer;

