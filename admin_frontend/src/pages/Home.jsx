import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const isAuthenticated = token && user;
  console.log(user);

  return (
    <div>
      <h1>Beach Cleanup Platform - Admin Panel</h1>
      
      {!isAuthenticated ? (
        <div>
          <p>Welcome to the Beach Cleanup Platform Admin Portal. Please login or signup to access admin features.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Get Started</h3>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
              <Link to="/login">
                <button style={{
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Login to Admin Panel
                </button>
              </Link>
              
              <Link to="/signup">
                <button style={{
                  padding: '12px 24px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Create Admin Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p>Welcome back! Use the navigation to access admin features.</p>
          
          <div style={{ marginTop: '30px' }}>
            <h3>Quick Access</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px', maxWidth: '300px' }}>
              <Link to="/dashboard">
                <button style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Go to Dashboard
                </button>
              </Link>
              
              <Link to="/events">
                <button style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Manage Events
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '40px' }}>
        <h3>Platform Features</h3>
        <ul>
          <li>Event Management - Create, update, and delete cleanup events</li>
          <li>Dashboard - Overview of all events and activities</li>
          <li>Volunteer Management - Track and manage volunteer participation</li>
          <li>Impact Tracking - Monitor environmental impact of cleanup activities</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;