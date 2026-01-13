import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDrawerOpen: true,
  modalContent: null,
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
    setModalContent: (state, action) => {
      state.modalContent = action.payload;
    },
  },
});

export const { toggleSideMenuDrawer, setSideMenuDrawer, setModalContent } = systemSlice.actions;
export default systemSlice.reducer;

