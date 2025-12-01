import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import './App.css';

// Simple protected route component (placeholder for now)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5]">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">Welcome to Your Workspace</h1>
                  <p className="text-gray-600 mb-8">You are logged in!</p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('access_token');
                      localStorage.removeItem('refresh_token');
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
