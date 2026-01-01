import './App.css'
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Layout from "./components/Layout.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Schools from "./pages/Schools.jsx"
import Requests from "./pages/Requests.jsx"
import CreateSchoolRequest from "./pages/CreateSchoolRequest.jsx"
import TransferSchoolRequest from "./pages/TransferSchoolRequest.jsx"
import AssignPrincipalRequest from "./pages/AssignPrincipalRequest.jsx"
import OtherRequests from "./pages/OtherRequests.jsx"
import RenewalRequests from "./pages/RenewalRequests.jsx"
import VisitRequest from "./pages/VisitRequest.jsx"
import Uploads from "./pages/Uploads.jsx"
import Notifications from "./pages/Notifications.jsx"
import Managers from "./pages/Managers.jsx"
import AccountInfo from "./pages/AccountInfo.jsx"
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
        <Route path="/school" element={<Schools />} />
        <Route path="/schools" element={<Schools />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/create-school" element={<CreateSchoolRequest />} />
        <Route path="/requests/transfer-school" element={<TransferSchoolRequest />} />
        <Route path="/requests/assign-principal" element={<AssignPrincipalRequest />} />
        <Route path="/requests/other" element={<OtherRequests />} />
        <Route path="/requests/renewal" element={<RenewalRequests />} />
        <Route path="/requests/visit" element={<VisitRequest />} />
        <Route path="/uploads" element={<Uploads />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/managers" element={<Managers />} />
        <Route path="/account-info" element={<AccountInfo />} />
      </Route>
    </Routes>
  )
}

export default App