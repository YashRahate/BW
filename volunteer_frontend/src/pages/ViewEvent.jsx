import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewEvent = () => {
  const { id } = useParams();
  console.log("Event ID", id);
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    canRegister: false,
    loading: true,
  });
  const [navigating, setNavigating] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // New state for user's current location
  const [isNearEvent, setIsNearEvent] = useState(false); // New state for proximity check
  const [checkingLocation, setCheckingLocation] = useState(false); // New state for location check loading

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const OPENROUTE_API_KEY = import.meta.env.VITE_OPENROUTE_API_KEY || 'your-openroute-api-key';

  // Proximity threshold in meters (e.g., 500 meters)
  const PROXIMITY_THRESHOLD = 5000000;

  useEffect(() => {
    fetchEvent();
    checkRegistrationStatus();
    getUserLocationAndCheckProximity(); // Call new function on component mount
  }, [id]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setEvent(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      setError('Failed to fetch event details');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/volunteers/check-registration/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRegistrationStatus({
          isRegistered: response.data.data.isRegistered,
          canRegister: response.data.data.canRegister,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      setRegistrationStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleRegisterForEvent = async () => {
    setRegistering(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/volunteers/register/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        alert('✅ Successfully registered for the event!');
        setRegistrationStatus({
          isRegistered: true,
          canRegister: false,
          loading: false,
        });
        fetchEvent();
      } else {
        alert(`❌ Registration failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage =
        error.response?.data?.message || 'Error during registration. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleUnregisterFromEvent = async () => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) {
      return;
    }

    setRegistering(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/volunteers/unregister/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        alert('✅ Successfully unregistered from the event!');
        setRegistrationStatus({
          isRegistered: false,
          canRegister: true,
          loading: false,
        });
        fetchEvent();
      } else {
        alert(`❌ Unregistration failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Unregistration error:', error);
      const errorMessage =
        error.response?.data?.message || 'Error during unregistration. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setRegistering(false);
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // in metres
    return distance;
  };

  const getUserLocationAndCheckProximity = async () => {
    setCheckingLocation(true);
    try {
      const location = await getUserLocation();
      setUserLocation(location);

      if (event && event.beachLocation) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          event.beachLocation.latitude,
          event.beachLocation.longitude
        );
        setIsNearEvent(distance <= PROXIMITY_THRESHOLD);
      }
    } catch (error) {
      console.error('Error getting user location or checking proximity:', error);
      setIsNearEvent(false); // Assume not near if location cannot be obtained
      // Optionally, show an alert to the user that location could not be determined
    } finally {
      setCheckingLocation(false);
    }
  };

  const getDirections = async () => {
    setNavigating(true);

    try {
      // Get user's current location
      const location = await getUserLocation();
      setUserLocation(location);

      // Get directions from OpenRouteService
      const response = await axios.post(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        {
          coordinates: [
            [location.longitude, location.latitude], // Start point
            [event.beachLocation.longitude, event.beachLocation.latitude], // End point
          ],
          format: 'json',
          instructions: true,
          language: 'en',
        },
        {
          headers: {
            Authorization: `Bearer ${OPENROUTE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const duration = Math.round(route.summary.duration / 60); // Convert to minutes
        const distance = (route.summary.distance / 1000).toFixed(1); // Convert to km

        // Show route summary
        const proceed = window.confirm(
          `🗺️ Route Found!\n\nDistance: ${distance} km\nEstimated Time: ${duration} minutes\n\nWould you like to open directions in Google Maps?`
        );

        if (proceed) {
          // Open Google Maps with directions
          const googleMapsUrl = `http://maps.google.com/maps?saddr=${location.latitude},${location.longitude}&daddr=${event.beachLocation.latitude},${event.beachLocation.longitude}`;
          window.open(googleMapsUrl, '_blank');
        }
      } else {
        throw new Error('No route found');
      }
    } catch (error) {
      console.error('Navigation error:', error);

      if (error.message === 'Geolocation is not supported by this browser') {
        alert('❌ Geolocation is not supported by your browser. Please enable location services.');
      } else if (error.code === 1) {
        alert('❌ Location access denied. Please allow location access to get directions.');
      } else if (error.code === 2) {
        alert('❌ Unable to determine your location. Please check your GPS settings.');
      } else if (error.code === 3) {
        alert('❌ Location request timed out. Please try again.');
      } else {
        // Fallback: Open Google Maps without directions
        const googleMapsUrl = `http://maps.google.com/maps?q=${event.beachLocation.latitude},${event.beachLocation.longitude}`;
        window.open(googleMapsUrl, '_blank');
        alert('⚠️ Could not get directions, but opened the location in Google Maps.');
      }
    } finally {
      setNavigating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const getRegistrationButtonText = () => {
    if (registering) return 'Processing...';
    if (registrationStatus.isRegistered) return '✅ Registered - Click to Unregister';
    if (!registrationStatus.canRegister) {
      if (event && new Date() > new Date(event.deadlineForRegistration)) {
        return '⏰ Registration Closed';
      }
      if (event && event.status !== 'upcoming') {
        return '🚫 Event Not Available';
      }
      return '❌ Cannot Register';
    }
    return '📝 Register Now';
  };

  const handleCollectWasteClick = () => {
    navigate(`/submit_waste/${id}`);
  };

  // Determine if the "Submit Collected Waste" button should be visible
  const showSubmitWasteButton =
    registrationStatus.isRegistered;// && // Volunteer is registered
    //event?.status === 'ongoing'; //&& // Event status is 'ongoing'
    // isNearEvent && // User's current location is near the event
    // !checkingLocation; // Not currently checking location

  // Simplified styles
  const styles = {
    container: {
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
    },
    backButton: {
      backgroundColor: '#666',
      color: 'white',
    },
    registerButton: {
      backgroundColor: registrationStatus.isRegistered ? '#ff5722' : '#4caf50',
      color: 'white',
      fontWeight: 'bold',
    },
    submitWasteButton: {
      backgroundColor: '#007bff', // Blue color for submit button
      color: 'white',
      fontWeight: 'bold',
      marginTop: '20px',
      width: '100%', // Make it full width
      padding: '12px 20px',
    },
    card: {
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '24px',
      marginBottom: '10px',
      color: '#333',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      marginBottom: '10px',
      color: '#333',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
    },
    infoBox: {
      padding: '15px',
      backgroundColor: '#f9f9f9',
      border: '1px solid #eee',
      borderRadius: '5px',
    },
    navigateButton: {
      backgroundColor: '#2196f3',
      color: 'white',
      marginTop: '10px',
    },
    statusBadge: {
      padding: '5px 10px',
      borderRadius: '15px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: event?.status === 'upcoming' ? '#e3f2fd' : '#e8f5e8',
      color: event?.status === 'upcoming' ? '#1976d2' : '#388e3c',
    },
    alert: {
      backgroundColor: '#e8f5e8',
      border: '1px solid #4caf50',
      borderRadius: '5px',
      padding: '15px',
      marginBottom: '20px',
      color: '#2e7d32',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        Loading event details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: '#f44336' }}>{error}</p>
        <button onClick={handleGoBack} style={{ ...styles.button, ...styles.backButton }}>
          Go Back
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '100px' }}>
        Event not found
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={handleGoBack} style={{ ...styles.button, ...styles.backButton }}>
          ← Back
        </button>
        <h1>Event Details</h1>
        {!registrationStatus.loading && (
          <button
            onClick={registrationStatus.isRegistered ? handleUnregisterFromEvent : handleRegisterForEvent}
            disabled={registering || (!registrationStatus.canRegister && !registrationStatus.isRegistered)}
            style={{ ...styles.button, ...styles.registerButton }}
          >
            {getRegistrationButtonText()}
          </button>
        )}
      </div>

      {/* Registration Status Alert */}
      {registrationStatus.isRegistered && (
        <div style={styles.alert}>
          <strong>🎉 You are registered for this event!</strong>
          <p style={{ margin: '5px 0 0 0' }}>
            We look forward to seeing you there. Check your email for event updates.
          </p>
        </div>
      )}

      {/* Event Card */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={styles.title}>{event.name}</h2>
          <span style={styles.statusBadge}>{event.status.toUpperCase()}</span>
        </div>

        {event.image && (
          <img
            src={event.image}
            alt={event.name}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '5px',
              marginBottom: '20px',
            }}
          />
        )}

        <div style={styles.infoGrid}>
          {/* Date & Time */}
          <div style={styles.infoBox}>
            <h3 style={styles.sectionTitle}>📅 Date & Time</h3>
            <p>
              <strong>Date:</strong> {formatDate(event.dateOfEvent)}
            </p>
            <p>
              <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </p>
            <p>
              <strong>Registration Deadline:</strong> {formatDate(event.deadlineForRegistration)}
            </p>
          </div>

          {/* Location */}
          <div style={styles.infoBox}>
            <h3 style={styles.sectionTitle}>📍 Location</h3>
            <p>
              <strong>Beach:</strong> {event.beachName}
            </p>
            <p>
              <strong>Address:</strong> {event.beachAddress}
            </p>
            <button
              onClick={getDirections}
              disabled={navigating}
              style={{ ...styles.button, ...styles.navigateButton }}
            >
              {navigating ? '🗺️ Getting Directions...' : '🧭 Navigate to Location'}
            </button>
          </div>
        </div>

        {/* Organizer */}
        {event.organizerId && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>👥 Organizer</h3>
            <p>
              <strong>Name:</strong> {event.organizerId.name}
            </p>
            {event.organizerId.affiliatedNgo && (
              <p>
                <strong>NGO:</strong> {event.organizerId.affiliatedNgo}
              </p>
            )}
          </div>
        )}

        {/* Description */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📝 Description</h3>
          <p>{event.description}</p>
        </div>

        {/* Registration Stats */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Registration Info</h3>
          <p>
            <strong>Registered Volunteers:</strong> {event.volunteerRegisterCount || 0}
          </p>
          <p>
            <strong>Days Until Deadline:</strong>{' '}
            {Math.max(
              0,
              Math.ceil((new Date(event.deadlineForRegistration) - new Date()) / (1000 * 60 * 60 * 24))
            )}
          </p>
        </div>

        {/* Additional Features */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🎁 Features</h3>
          <div>
            {event.refreshments && <span style={{ marginRight: '10px' }}>🥤 Refreshments</span>}
            {event.certificateOfParticipation && <span>🏆 Certificate</span>}
            {!event.refreshments && !event.certificateOfParticipation && (
              <span style={{ fontStyle: 'italic', color: '#666' }}>No additional features</span>
            )}
          </div>
        </div>

        {/* Safety Protocols */}
        {event.safetyProtocols && event.safetyProtocols.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>🛡️ Safety Protocols</h3>
            <ul>
              {event.safetyProtocols.map((protocol, index) => (
                <li key={index}>{protocol}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Submit Collected Waste Button (Conditional Rendering) */}
        {showSubmitWasteButton && (
          <button
            onClick={handleCollectWasteClick}
            style={{ ...styles.button, ...styles.submitWasteButton }}
          >
            Submit Collected Waste
          </button>
        )}
      </div>
    </div>
  );
};

export default ViewEvent;