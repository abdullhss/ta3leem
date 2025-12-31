import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './slices/systemSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    system: systemReducer,
    auth: authReducer,
  },
});

