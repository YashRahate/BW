import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/volunteer_dashboard', label: 'Dashboard' },
    { path: '/volunteer_events', label: 'Events' },
    { path: '/past_events', label: 'Past Event' },
    { path: '/classify_waste', label: 'Classify Waste' },
    { path: '/games', label: 'Games & Rewards' },
    { path: '/gamification', label: 'Leaderboard' },
    { path: '/blockchain', label: 'Blockchain' },
  
  ];

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      borderRight: '1px solid #dee2e6',
      padding: '20px 0'
    }}>
      <div style={{ padding: '0 20px' }}>
        <h4>Admin Panel</h4>
      </div>
      
      <nav style={{ marginTop: '20px' }}>
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path}
            style={{ 
              display: 'block',
              padding: '12px 20px',
              color: '#333',
              textDecoration: 'none',
              backgroundColor: location.pathname === item.path ? '#e9ecef' : 'transparent',
              borderLeft: location.pathname === item.path ? '4px solid #007bff' : '4px solid transparent'
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;