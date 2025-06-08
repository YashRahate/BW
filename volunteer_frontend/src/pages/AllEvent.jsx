import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';

const AllEvent = () => {
  const [events, setEvents] = useState([]);
  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'distance'
  const [filterStatus, setFilterStatus] = useState('all');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Function to calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance;
  };

  // Function to get coordinates from address using a geocoding service
  const getCoordinatesFromAddress = async (address) => {
    try {
      // Using OpenStreetMap Nominatim API (free alternative to Google Maps)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Fetch volunteer profile
  const fetchVolunteerProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/volunteer-auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch volunteer profile');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching volunteer profile:', error);
      throw error;
    }
  };

  // Fetch all events
  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch volunteer profile and events in parallel
        const [volunteerData, eventsData] = await Promise.all([
          fetchVolunteerProfile(),
          fetchEvents()
        ]);

        setVolunteer(volunteerData);
        
        // If volunteer has address, calculate distances for events
        if (volunteerData?.address && eventsData.length > 0) {
          const volunteerCoords = await getCoordinatesFromAddress(volunteerData.address);
          
          if (volunteerCoords) {
            const eventsWithDistance = eventsData.map(event => {
              const distance = calculateDistance(
                volunteerCoords.latitude,
                volunteerCoords.longitude,
                event.beachLocation.latitude,
                event.beachLocation.longitude
              );
              
              return {
                ...event,
                distanceFromVolunteer: Math.round(distance * 10) / 10 // Round to 1 decimal
              };
            });
            
            setEvents(eventsWithDistance);
          } else {
            setEvents(eventsData);
          }
        } else {
          setEvents(eventsData);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sort and filter events
  const getSortedAndFilteredEvents = () => {
    let filteredEvents = [...events];

    // Apply status filter
    if (filterStatus !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.status === filterStatus);
    }

    // Apply sorting
    if (sortBy === 'distance' && events.some(event => event.distanceFromVolunteer !== undefined)) {
      filteredEvents.sort((a, b) => {
        const distA = a.distanceFromVolunteer || 999999;
        const distB = b.distanceFromVolunteer || 999999;
        return distA - distB;
      });
    } else {
      // Sort by date
      filteredEvents.sort((a, b) => new Date(a.dateOfEvent) - new Date(b.dateOfEvent));
    }

    return filteredEvents;
  };

  const sortedEvents = getSortedAndFilteredEvents();
  const nearestEvents = events
    .filter(event => event.distanceFromVolunteer !== undefined)
    .sort((a, b) => a.distanceFromVolunteer - b.distanceFromVolunteer)
    .slice(0, 3);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        fontSize: '18px'
      }}>
        Loading events...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        border: '1px solid #f44336',
        borderRadius: '8px',
        color: '#c62828',
        textAlign: 'center'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{
          fontSize: '28px',
          color: '#333',
          marginBottom: '10px'
        }}>
          Beach Cleanup Events
        </h1>
        <p style={{
          color: '#666',
          fontSize: '16px'
        }}>
          Join beach cleanup events in your area and make a difference!
        </p>
      </div>

      {/* Recommended Events Section */}
      {nearestEvents.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{
            fontSize: '22px',
            color: '#4caf50',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            📍 Recommended Events Near You
          </h2>
          <div style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))'
          }}>
            {nearestEvents.map(event => (
              <div key={event._id} style={{
                border: '2px solid #4caf50',
                borderRadius: '12px',
                padding: '10px',
                backgroundColor: '#f8fff8'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <span style={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    RECOMMENDED
                  </span>
                  <span style={{
                    color: '#4caf50',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {event.distanceFromVolunteer} km away
                  </span>
                </div>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Sorting */}
      <div style={{
        display: 'flex',
        gap: '20px',
        marginBottom: '30px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#333' }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="date">Date</option>
            {events.some(event => event.distanceFromVolunteer !== undefined) && (
              <option value="distance">Distance (Nearest First)</option>
            )}
          </select>
        </div>

        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold', color: '#333' }}>
            Filter:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: '#666' }}>
          Showing {sortedEvents.length} of {events.length} events
        </div>
      </div>

      {/* Events Grid */}
      {sortedEvents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#666'
        }}>
          <h3>No events found</h3>
          <p>There are currently no events matching your criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '30px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
        }}>
          {sortedEvents.map(event => (
            <div key={event._id} style={{ position: 'relative' }}>
              {event.distanceFromVolunteer !== undefined && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  zIndex: 1
                }}>
                  {event.distanceFromVolunteer} km away
                </div>
              )}
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}

      {/* No address warning */}
      {volunteer && !volunteer.address && (
        <div style={{
          marginTop: '30px',
          padding: '15px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <strong>💡 Tip:</strong> Add your address to your profile to see distance-based recommendations and sorting options.
        </div>
      )}
    </div>
  );
};

export default AllEvent;