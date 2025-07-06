// volunteer_frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerDashboard from './pages/VolunteerDashboard';
import GlobalDashboard from './pages/GlobalDashboard';
import AllEvent from './pages/AllEvent';
import PastEvent from './pages/PastEvent';
import ClassifyWaste from './pages/ClassifyWaste';
import Reward from './pages/Reward';
import Gamification from './pages/Gamification';
import ViewEvent from './pages/ViewEvent';
import WasteSubmission from './pages/WasteSubmission';
import WasteClassifier from './pages/Waste_Classifier/WasteClassifier';



// Protected Route Component
const ProtectedRoute = ({ children, user, requiredRole }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Unauthorized Access Component
const Unauthorized = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Access Denied</h2>
      <p style={{ marginBottom: '20px', color: '#6c757d' }}>
        You don't have permission to access this page. 
        Please make sure you're logged in with the correct account type.
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      
      // Check if user is volunteer - prevent admin access
      if (parsedUser.role === 'volunteer') {
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        // Clear storage if not volunteer
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogin = (userData, token) => {
    // Only allow volunteer login
    if (userData.role !== 'volunteer') {
      alert('Access denied. This is a volunteer portal.');
      return;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <div>
        <Navbar user={user} onLogout={handleLogout} />
        <div style={{ display: 'flex' }}>
          {isAuthenticated && user?.role === 'volunteer' && <Sidebar />}
          <div style={{ flex: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/volunteer_dashboard" replace /> : 
                  <Login onLogin={handleLogin} />
                } 
              />
              <Route 
                path="/signup" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/volunteer_dashboard" replace /> : 
                  <Signup />
                } 
              />
              <Route 
                path="/volunteer_dashboard" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <VolunteerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/volunteer_events" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    < AllEvent/>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/past_events" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <PastEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/classify_waste" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <ClassifyWaste />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/rewards" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <Reward />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/gamification" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <Gamification />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wasteclassifier" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <WasteClassifier />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/volunteer_view_event/:id" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <ViewEvent />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/submit_waste/:eventId" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    <WasteSubmission />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/global_dashboard" 
                element={
                  <ProtectedRoute user={user} requiredRole="volunteer">
                    < GlobalDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Catch all other routes and redirect */}
              <Route 
                path="*" 
                element={
                  isAuthenticated ? 
                  <Navigate to="/volunteer_dashboard" replace /> : 
                  <Navigate to="/" replace />
                } 
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;