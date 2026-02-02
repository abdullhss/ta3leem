import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const AUTH_STORAGE_KEY = 'auth_data';
const AUTH_EXPIRY_KEY = 'auth_expiry';
const EDUCATION_YEAR_DATA_KEY = 'education_year_data';
const saveAuthToLocalStorage = (userData, educationYearData) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 1 week from now
  
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
  localStorage.setItem(AUTH_EXPIRY_KEY, expiryDate.getTime().toString());
  localStorage.setItem(EDUCATION_YEAR_DATA_KEY, JSON.stringify(educationYearData));
};

const loadAuthFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    const educationYearData = localStorage.getItem(EDUCATION_YEAR_DATA_KEY);
    const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
    
    if (!userData || !expiry) {
      return { userData: null, isAuthenticated: false, educationYearData: null };
    }
    
    const expiryDate = parseInt(expiry, 10);
    const now = new Date().getTime();
    
    // Check if expired
    if (now > expiryDate) {
      // Clear expired data
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_EXPIRY_KEY);
      return { userData: null, isAuthenticated: false, educationYearData: null };
    }
    
    return {
      userData: JSON.parse(userData),
      isAuthenticated: true,
      educationYearData: JSON.parse(educationYearData),
    };
  } catch (error) {
    console.error('Error loading auth from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_EXPIRY_KEY);
    return { userData: null, isAuthenticated: false, educationYearData: null };
  }
};

const clearAuthFromLocalStorage = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
  localStorage.removeItem(EDUCATION_YEAR_DATA_KEY);
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
      saveAuthToLocalStorage(action.payload, state.educationYearData);
    },
    setEducationYearData: (state, action) => {
      state.educationYearData = action.payload;
      saveAuthToLocalStorage(state.userData, action.payload);
    },
    logout: (state) => {
      state.userData = null;
      state.educationYearData = null;
      state.isAuthenticated = false;
      clearAuthFromLocalStorage();
    },
    checkAuth: (state) => {
      const authData = loadAuthFromLocalStorage();
      state.userData = authData.userData;
      state.educationYearData = authData.educationYearData;
      state.isAuthenticated = authData.isAuthenticated;
    },
  },
});

export const { login , setEducationYearData, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;

