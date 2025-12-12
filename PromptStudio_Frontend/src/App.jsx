import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import Login from "./pages/Login.jsx";
import Layout from "./Layout/Layout";
import HomePage from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Singup.jsx";
import Generator from "./pages/Generator.jsx";
import Profile from "./pages/Profile.jsx";
import History from "./pages/History.jsx";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without Layout wrapper */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/generator" element={<Generator />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Route>
          
          {/* Public Layout (accessible to all) */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          
          {/* Fallback - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;