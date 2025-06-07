import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/my-events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setEvents(data.data);
      } else {
        console.error('Error fetching events:', data.message);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = () => {
    // Navigate to add event page
    navigate('/add_events');
  };

  const handleEdit = (event) => {
    // Navigate to add event page with edit state
    navigate('/add_events', { state: { editEvent: event } });
  };

  const handleDelete = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEvents(events.filter(event => event._id !== eventId));
        alert('Event deleted successfully!');
      } else {
        alert(data.message || 'Error deleting event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error deleting event. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading events...
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #eee',
        paddingBottom: '15px'
      }}>
        <h1 style={{
          margin: 0,
          color: '#333',
          fontSize: '28px'
        }}>
          My Events
        </h1>
        <button
          onClick={handleAddEvent}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Add New Event
        </button>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px',
          border: '2px dashed #dee2e6'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '10px' }}>
            No Events Found
          </h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            You haven't created any events yet. Click the button above to create your first event.
          </p>
          <button
            onClick={handleAddEvent}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Create First Event
          </button>
        </div>
      ) : (
        <div>
          <p style={{
            color: '#666',
            marginBottom: '20px',
            fontSize: '16px'
          }}>
            Total Events: {events.length}
          </p>
          
          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
          }}>
            {events.map(event => (
              <EventCard
                key={event._id}
                event={event}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEvents;