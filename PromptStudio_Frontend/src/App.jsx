import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import ProtectedRoute from "./components/ProtectedRoutes.jsx";
import Login from "./pages/Login.jsx";
import Layout from "./Layout/Layout";
import HomePage from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Signup from "./pages/Singup.jsx";
import Generator from "./pages/Generator.jsx";
import Profile from "./pages/Profile.jsx"; // Create this page
import History from "./pages/History.jsx"; // Create this page

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes without Layout wrapper */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Public routes with Layout wrapper (accessible without login) */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
          </Route>
          
          {/* Protected routes with Layout wrapper (require login) */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="generator" element={<Generator />} />
            <Route path="profile" element={<Profile />} />
            <Route path="history" element={<History />} />
            {/* Add other protected routes here */}
          </Route>
          
          {/* Fallback route */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;