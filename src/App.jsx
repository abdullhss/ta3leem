import './App.css'
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Layout from "./components/Layout.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { Navigate, Route, Routes } from 'react-router-dom'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* All other routes use the Layout with Navbar and Sidebar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Add your other protected routes here */}
      </Route>
    </Routes>
  )
}

export default App