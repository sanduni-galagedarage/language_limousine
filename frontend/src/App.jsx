import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./home/home";
import ProtectedRoute from "./components/ProtectedRoute";
import DriverProtectedRoute from "./components/DriverProtectedRoute";
import GreeterProtectedRoute from "./components/GreeterProtectedRoute";
import AdminDashboard from "./pages/admin/pages/Dashboard";
import Greeters from "./pages/admin/pages/Users/Greeters";
import Drivers from "./pages/admin/pages/Users/Drivers";
import Schools from "./pages/admin/pages/Users/Schools";
import SubDrivers from "./pages/admin/pages/Users/Subdrivers";
import Add from "./pages/admin/pages/Students/Add";
import Download from "./pages/admin/pages/Students/Download";
import Upload from "./pages/admin/pages/Students/Upload";
import View from "./pages/admin/pages/Students/View";
import Update from "./pages/admin/pages/Students/Update";
import UpdatingWaitingTime from "./pages/admin/pages/UpdatingWaitingTime";
import AssignDrivers from "./pages/admin/pages/AssignDrivers";
import Map from "./pages/admin/pages/Map";
import Profile from "./pages/admin/pages/Profile";
import PrintMap from "./pages/admin/pages/PrintMap";
import AssigenDrivers from "./pages/greeter/pages/AssigenDrivers";
import AbsentFeedback from "./pages/greeter/pages/AbsentFeedback";
import UpdatingWaitingTimeGreeters from "./pages/greeter/pages/UpdatingWaitingTime";
import Dashboard from "./pages/driver/pages/Dashboard";
import DriverProfile from "./pages/driver/pages/Profile";
import SchoolDashboard from "./pages/schools/pages/Dashboard";
import AddStudentsPage from "./pages/schools/pages/AddStudents";
import StudentDetails from "./pages/schools/pages/StudentsDetails";
import StatusPage from "./pages/schools/pages/Status";
import SubDriverDashboard from "./pages/subdriver/pages/Dashboard";
import SubDriverProfile from "./pages/subdriver/pages/Profile";
import AboutUs from "./aboutus/aboutus";
import Privacy from "./privacy/privacy";

import { ThemeProvider } from "./components/theme-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Admins from "./pages/admin/pages/Users/Admins";
import AdminRegister from "./pages/admin/AdminRegister";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Router>
        <Routes>
          {/* Home Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Public Admin Registration */}
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Protected Admin Pages */}
          <Route
            path="/admin/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          {/* Admin Users */}
          <Route
            path="/admin/admin-users/greeters"
            element={
              <ProtectedRoute>
                <Greeters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-users/drivers"
            element={
              <ProtectedRoute>
                <Drivers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-users/admins"
            element={
              <ProtectedRoute>
                <Admins />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-users/school"
            element={
              <ProtectedRoute>
                <Schools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-users/subdrivers"
            element={
              <ProtectedRoute>
                <SubDrivers />
              </ProtectedRoute>
            }
          />
          {/* Admin Students */}
          <Route
            path="/admin/admin-students/add"
            element={
              <ProtectedRoute>
                <Add />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-students/download"
            element={
              <ProtectedRoute>
                <Download />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-students/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-students/update"
            element={
              <ProtectedRoute>
                <Update />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-students/view"
            element={
              <ProtectedRoute>
                <View />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/admin-waitingtime"
            element={
              <ProtectedRoute>
                <UpdatingWaitingTime />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assigndrivers"
            element={
              <ProtectedRoute>
                <AssignDrivers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/map"
            element={
              <ProtectedRoute>
                <Map />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/printmap"
            element={
              <ProtectedRoute>
                <PrintMap />
              </ProtectedRoute>
            }
          />
          {/* Greeter Pages */}
          <Route
            path="/greeter/greeter-dashboard"
            element={
              <GreeterProtectedRoute>
                <AssigenDrivers />
              </GreeterProtectedRoute>
            }
          />
          <Route
            path="/greeter/absentfeedback"
            element={
              <GreeterProtectedRoute>
                <AbsentFeedback />
              </GreeterProtectedRoute>
            }
          />
          <Route
            path="/greeter/updatingwaitingtime"
            element={
              <GreeterProtectedRoute>
                <UpdatingWaitingTimeGreeters />
              </GreeterProtectedRoute>
            }
          />
          {/* Driver Pages */}
          <Route
            path="/driver/driver-dashboard"
            element={
              <DriverProtectedRoute>
                <Dashboard />
              </DriverProtectedRoute>
            }
          />
          <Route
            path="/driver/driver-profile"
            element={
              <DriverProtectedRoute>
                <DriverProfile />
              </DriverProtectedRoute>
            }
          />
          {/* School Pages */}
          <Route
            path="/school/school-dashboard"
            element={<SchoolDashboard />}
          />
          <Route
            path="/school/school-addstudents"
            element={<AddStudentsPage />}
          />
          <Route
            path="/school/school-studentsdetails"
            element={<StudentDetails />}
          />
          <Route path="/school/school-status" element={<StatusPage />} />
          {/* Sub Driver Pages */}
          <Route
            path="/subdriver/subdriver-dashboard"
            element={<SubDriverDashboard />}
          />
          <Route
            path="/subdriver/subdriver-profile"
            element={<SubDriverProfile />}
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
