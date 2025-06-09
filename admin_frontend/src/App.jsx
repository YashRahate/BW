import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AddEvent from './pages/AddEvent';
import MyEvent from './pages/MyEvent';
import ViewEvent from './pages/ViewEvent';
import FlyerGenerator from './pages/FlyerGenerator/FlyerGenerator';


function App() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData, token) => {
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
          {isAuthenticated && <Sidebar />}
          <div style={{ flex: 1, padding: '20px' }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/add_events" element={< AddEvent/>} />
              <Route path="/my_events" element={< MyEvent />} />
              <Route path="/view_event/:id" element={<ViewEvent />} />
              <Route path="/flyer" element={<FlyerGenerator />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;