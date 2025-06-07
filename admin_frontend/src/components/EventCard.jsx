import React from 'react';

const EventCard = ({ event, onEdit, onDelete }) => {
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

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'relative'
    }}>
      {/* Event Image */}
      {event.image && (
        <div style={{
          width: '100%',
          height: '200px',
          marginBottom: '15px',
          borderRadius: '6px',
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

      {/* Event Details */}
      <h3 style={{
        margin: '0 0 10px 0',
        color: '#333',
        fontSize: '20px'
      }}>
        {event.name}
      </h3>

      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Date:</strong> {formatDate(event.dateOfEvent)}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Beach:</strong> {event.beachName}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Location:</strong> {event.beachAddress}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Registration Deadline:</strong> {formatDate(event.deadlineForRegistration)}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Registered Volunteers:</strong> {event.volunteerRegisterCount || 0}
        </p>
        <p style={{ margin: '5px 0', color: '#666' }}>
          <strong>Status:</strong> 
          <span style={{
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            marginLeft: '5px',
            backgroundColor: event.status === 'upcoming' ? '#e3f2fd' : 
                           event.status === 'ongoing' ? '#fff3e0' : '#e8f5e8',
            color: event.status === 'upcoming' ? '#1976d2' : 
                   event.status === 'ongoing' ? '#f57c00' : '#388e3c'
          }}>
            {event.status.toUpperCase()}
          </span>
        </p>
      </div>

      {/* Description */}
      <div style={{ marginBottom: '15px' }}>
        <p style={{ margin: '0', color: '#555', lineHeight: '1.5' }}>
          {event.description}
        </p>
      </div>

      {/* Additional Info */}
      <div style={{ marginBottom: '20px', fontSize: '14px' }}>
        {event.refreshments && (
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            margin: '2px',
            backgroundColor: '#e8f5e8',
            color: '#388e3c',
            borderRadius: '12px'
          }}>
            Refreshments Provided
          </span>
        )}
        {event.certificateOfParticipation && (
          <span style={{
            display: 'inline-block',
            padding: '4px 8px',
            margin: '2px',
            backgroundColor: '#e3f2fd',
            color: '#1976d2',
            borderRadius: '12px'
          }}>
            Certificate Available
          </span>
        )}
      </div>

      {/* Safety Protocols */}
      {event.safetyProtocols && event.safetyProtocols.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <strong style={{ color: '#333', fontSize: '14px' }}>Safety Protocols:</strong>
          <ul style={{ margin: '5px 0', paddingLeft: '20px', fontSize: '14px', color: '#666' }}>
            {event.safetyProtocols.map((protocol, index) => (
              <li key={index} style={{ margin: '2px 0' }}>
                {protocol}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={() => onEdit(event)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(event._id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default EventCard;