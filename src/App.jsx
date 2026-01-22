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
import Mangers from "./pages/Mangers.jsx"
import AccountInfo from "./pages/AccountInfo.jsx"
import { Navigate, Route, Routes } from 'react-router-dom'
import AddManger from './components/CreateSchool/Add Manger/AddManger.jsx'
import School from './pages/School.jsx'
import AddMofwadMasogat from './pages/AddMofwadMasogat.jsx'
import Groups from './pages/Manger/Groups.jsx'
import Parents from './pages/Manger/Parents.jsx'
import AddParents from './pages/Manger/AddParents.jsx'
import AddStudents from './pages/Manger/AddStudents.jsx'
import Students from './pages/Manger/Students.jsx'
import Departments from './pages/Manger/Departments.jsx'
import AddDepartment from './pages/Manger/AddDepartment.jsx'
import AddSchoolDevision from './pages/Manger/AddSchoolDevision.jsx'
import SchoolDevisions from './pages/Manger/SchoolDevisions.jsx'
import Employees from './pages/Manger/Employees.jsx'
import AddEmployees from './pages/Manger/AddEmployees.jsx'
import AddEmployeesContracts from './pages/Manger/AddEmployeesContracts.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* All other routes use the Layout with Navbar and Sidebar */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/school" element={<Navigate to="/schools/new" replace />} />
        <Route path="/schools" element={<Navigate to="/schools/new" replace />} />
        <Route path="/schools/:type" element={<Schools />} />
        <Route path="/schools/:type/:id/:Office_id" element={<School/>} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/requests/create-school" element={<CreateSchoolRequest />} />
        <Route path="/requests/add-manger" element={<AddManger />} />
        <Route path="/requests/transfer-school" element={<TransferSchoolRequest />} />
        <Route path="/requests/assign-principal" element={<AssignPrincipalRequest />} />
        <Route path="/requests/other" element={<OtherRequests />} />
        <Route path="/requests/renewal" element={<RenewalRequests />} />
        <Route path="/requests/visit" element={<VisitRequest />} />
        <Route path="/uploads/:id/:Office_id/:type" element={<Uploads />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/mangers" element={<Mangers />} />
        <Route path="/account-info" element={<AccountInfo />} />
        <Route path="/add-mofwad-masogat" element={<AddMofwadMasogat />} />
        <Route path="/school-info" element={<Dashboard />} />
        <Route path="/education-levels/groups" element={<Groups />} />
        <Route path="/education-levels/parents" element={<Parents />} />
        <Route path="/education-levels/parents/add" element={<AddParents />} />
        <Route path="/education-levels/students" element={<Students />} />
        <Route path="/education-levels/students/add" element={<AddStudents />} />
        <Route path='/Departments' element={<Departments/>}/>
        <Route path='/Departments/Add' element={<AddDepartment/>}/>
        <Route path='/Departments/Edit/:id' element={<AddDepartment/>}/>
        <Route path='/SchoolDevisions/Add' element={<AddSchoolDevision/>}/>
        <Route path='/SchoolDevisions/Edit/:id' element={<AddSchoolDevision/>}/>
        <Route path='/SchoolDevisions' element={<SchoolDevisions/>}/>
        <Route path='/Employees' element={<Employees/>}/>
        <Route path='/Employees/Add' element={<AddEmployees/>}/>
        <Route path='/Employees/Edit/:id' element={<AddEmployees/>}/>
        <Route path='/Employees/Delete/:id' element={<AddEmployees/>}/>
        <Route path='/Employees/Contracts/Add' element={<AddEmployeesContracts/>}/>
      </Route>
    </Routes>
  )
}

export default App