import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    canRegister: false,
    loading: true
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchEvent();
    checkRegistrationStatus();
  }, [id]);

  const fetchEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setRegistrationStatus({
          isRegistered: response.data.data.isRegistered,
          canRegister: response.data.data.canRegister,
          loading: false
        });
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      setRegistrationStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const handleRegisterForEvent = async () => {
    setRegistering(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/volunteers/register/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('✅ Successfully registered for the event!');
        
        // Update registration status
        setRegistrationStatus({
          isRegistered: true,
          canRegister: false,
          loading: false
        });

        // Refresh event data to show updated volunteer count
        fetchEvent();
      } else {
        alert(`❌ Registration failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Error during registration. Please try again.';
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
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        alert('✅ Successfully unregistered from the event!');
        
        // Update registration status
        setRegistrationStatus({
          isRegistered: false,
          canRegister: true,
          loading: false
        });

        // Refresh event data to show updated volunteer count
        fetchEvent();
      } else {
        alert(`❌ Unregistration failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Unregistration error:', error);
      const errorMessage = error.response?.data?.message || 'Error during unregistration. Please try again.';
      alert(`❌ ${errorMessage}`);
    } finally {
      setRegistering(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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

  const getRegistrationButtonStyle = () => {
    const baseStyle = {
      padding: '12px 24px',
      border: 'none',
      borderRadius: '6px',
      cursor: registrationStatus.canRegister || registrationStatus.isRegistered ? 'pointer' : 'not-allowed',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    };

    if (registering) {
      return {
        ...baseStyle,
        backgroundColor: '#ccc',
        color: '#666',
        cursor: 'not-allowed'
      };
    }

    if (registrationStatus.isRegistered) {
      return {
        ...baseStyle,
        backgroundColor: '#ff5722',
        color: 'white'
      };
    }

    if (registrationStatus.canRegister) {
      return {
        ...baseStyle,
        backgroundColor: '#4caf50',
        color: 'white'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#ccc',
      color: '#666'
    };
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading event details...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#f44336'
      }}>
        <p>{error}</p>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        Event not found
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <button
          onClick={handleGoBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>
        <h1 style={{
          margin: '0',
          color: '#333',
          fontSize: '28px'
        }}>
          Event Details
        </h1>
        {!registrationStatus.loading && (
          <button
            onClick={registrationStatus.isRegistered ? handleUnregisterFromEvent : handleRegisterForEvent}
            disabled={registering || (!registrationStatus.canRegister && !registrationStatus.isRegistered)}
            style={getRegistrationButtonStyle()}
          >
            {getRegistrationButtonText()}
          </button>
        )}
      </div>

      {/* Registration Status Alert */}
      {registrationStatus.isRegistered && (
        <div style={{
          backgroundColor: '#e8f5e8',
          border: '2px solid #4caf50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <strong style={{ color: '#2e7d32' }}>
            🎉 You are registered for this event!
          </strong>
          <p style={{ margin: '5px 0 0 0', color: '#2e7d32' }}>
            We look forward to seeing you there. Check your email for event updates.
          </p>
        </div>
      )}

      {/* Event Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Event Image */}
        {event.image && (
          <div style={{
            width: '100%',
            height: '400px',
            overflow: 'hidden'
          }}>
            <img 
              src={event.image} 
              alt={event.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}

        {/* Event Content */}
        <div style={{ padding: '30px' }}>
          {/* Event Title and Status */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px'
          }}>
            <h2 style={{
              margin: '0',
              color: '#333',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              {event.name}
            </h2>
            <span style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold',
              backgroundColor: event.status === 'upcoming' ? '#e3f2fd' : 
                             event.status === 'ongoing' ? '#fff3e0' : '#e8f5e8',
              color: event.status === 'upcoming' ? '#1976d2' : 
                     event.status === 'ongoing' ? '#f57c00' : '#388e3c'
            }}>
              {event.status.toUpperCase()}
            </span>
          </div>

          {/* Organizer Information */}
          {event.organizerId && (
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                margin: '0 0 10px 0',
                color: '#333',
                fontSize: '18px'
              }}>
                👥 Organized by
              </h3>
              <p style={{ margin: '5px 0', color: '#555' }}>
                <strong>Organizer:</strong> {event.organizerId.name}
              </p>
              {event.organizerId.affiliatedNgo && (
                <p style={{ margin: '5px 0', color: '#555' }}>
                  <strong>NGO:</strong> {event.organizerId.affiliatedNgo}
                </p>
              )}
            </div>
          )}

          {/* Event Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '30px',
            marginBottom: '30px'
          }}>
            {/* Date & Time Info */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#333',
                fontSize: '18px'
              }}>
                📅 Date & Time
              </h3>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Event Date:</strong> {formatDate(event.dateOfEvent)}
              </p>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </p>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Registration Deadline:</strong> {formatDate(event.deadlineForRegistration)}
              </p>
            </div>

            {/* Location Info */}
            <div style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#333',
                fontSize: '18px'
              }}>
                📍 Location
              </h3>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Beach:</strong> {event.beachName}
              </p>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Address:</strong> {event.beachAddress}
              </p>
              <p style={{ margin: '8px 0', color: '#555' }}>
                <strong>Coordinates:</strong> {event.beachLocation.latitude}, {event.beachLocation.longitude}
              </p>
            </div>
          </div>

          {/* Live Information */}
          <div style={{
            padding: '20px',
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            marginBottom: '30px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '18px'
            }}>
              📊 Registration Information
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4caf50'
                }}>
                  {event.volunteerRegisterCount || 0}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Registered Volunteers
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#2196f3'
                }}>
                  {event.registeredVolunteers?.length || 0}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Active Registrations
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: Math.ceil((new Date(event.deadlineForRegistration) - new Date()) / (1000 * 60 * 60 * 24)) > 0 ? '#ff9800' : '#f44336'
                }}>
                  {Math.max(0, Math.ceil((new Date(event.deadlineForRegistration) - new Date()) / (1000 * 60 * 60 * 24)))}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Days Until Deadline
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '18px'
            }}>
              📝 Description
            </h3>
            <p style={{ 
              margin: '0', 
              color: '#555', 
              lineHeight: '1.6',
              fontSize: '16px'
            }}>
              {event.description}
            </p>
          </div>

          {/* Additional Features */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{
              margin: '0 0 15px 0',
              color: '#333',
              fontSize: '18px'
            }}>
              🎁 Additional Features
            </h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {event.refreshments && (
                <span style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#e8f5e8',
                  color: '#388e3c',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🥤 Refreshments Provided
                </span>
              )}
              {event.certificateOfParticipation && (
                <span style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  🏆 Certificate Available
                </span>
              )}
              {!event.refreshments && !event.certificateOfParticipation && (
                <span style={{ color: '#666', fontStyle: 'italic' }}>
                  No additional features listed
                </span>
              )}
            </div>
          </div>

          {/* Safety Protocols */}
          {event.safetyProtocols && event.safetyProtocols.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{
                margin: '0 0 15px 0',
                color: '#333',
                fontSize: '18px'
              }}>
                🛡️ Safety Protocols
              </h3>
              <ul style={{ 
                margin: '0', 
                paddingLeft: '20px', 
                color: '#555',
                lineHeight: '1.6'
              }}>
                {event.safetyProtocols.map((protocol, index) => (
                  <li key={index} style={{ margin: '8px 0' }}>
                    {protocol}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;