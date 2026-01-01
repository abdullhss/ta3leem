import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const AUTH_STORAGE_KEY = 'auth_data';
const AUTH_EXPIRY_KEY = 'auth_expiry';

const saveAuthToLocalStorage = (userData) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 1 week from now
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryDate.getTime().toString());
};

const loadAuthFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    
    if (!userData || !expiry) {
      return { userData: null, isAuthenticated: false };
    }
    
    const expiryDate = parseInt(expiry, 10);
    const now = new Date().getTime();
    
    // Check if expired
    if (now > expiryDate) {
      // Clear expired data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
      return { userData: null, isAuthenticated: false };
    }
    
    return {
      userData: JSON.parse(userData),
      isAuthenticated: true,
    };
  } catch (error) {
    console.error('Error loading auth from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    return { userData: null, isAuthenticated: false };
  }
};

const clearAuthFromLocalStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
};

// Initialize state from localStorage
const initialState = loadAuthFromLocalStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.userData = action.payload;
      state.isAuthenticated = true;
      saveAuthToLocalStorage(action.payload);
    },
    logout: (state) => {
      state.userData = null;
      state.isAuthenticated = false;
      clearAuthFromLocalStorage();
    },
    checkAuth: (state) => {
      const authData = loadAuthFromLocalStorage();
      state.userData = authData.userData;
      state.isAuthenticated = authData.isAuthenticated;
    },
  },
});

export const { login, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;

