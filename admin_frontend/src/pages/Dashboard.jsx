import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalVolunteers: 0,
    wasteCollected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data || stats);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      setError('Network error while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>Total Events</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalEvents}</div>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Upcoming Events</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.upcomingEvents}</div>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>Total Volunteers</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalVolunteers}</div>
        </div>

        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>Waste Collected</h3>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.wasteCollected} kg</div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h3>Recent Activity</h3>
        <p>Dashboard functionality will be expanded to show recent events, volunteer activities, and impact metrics.</p>
        
        <div style={{ marginTop: '20px' }}>
          <h4>Quick Actions</h4>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              Create New Event
            </button>
            
            <button style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              View Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;