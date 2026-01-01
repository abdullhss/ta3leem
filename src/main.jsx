import React , { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import {ToastContainer} from "react-toastify"
import { checkAuth } from './store/slices/authSlice'

// Check auth on app initialization
store.dispatch(checkAuth());

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ToastContainer/>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
