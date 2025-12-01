import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import CreateWorkspace from './pages/CreateWorkspace';
import Layout from './components/layout/Layout';
import './App.css';

import WorkspaceDetail from './pages/WorkspaceDetail';
import NotebookDetail from './pages/NotebookDetail';

// Simple protected route component
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

        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/" element={<Home />} />
          <Route path="/create-workspace" element={<CreateWorkspace />} />
          <Route path="/workspace/:id" element={<WorkspaceDetail />} />
          <Route path="/notebook/:id" element={<NotebookDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
