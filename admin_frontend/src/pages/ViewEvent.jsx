import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportGenerating, setReportGenerating] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchEvent();
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

  const handleGenerateReport = async () => {
    setReportGenerating(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/reports/generate/${event._id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setReportData(response.data.data);
        setShowReportModal(true);
      } else {
        alert('Failed to generate report. Please try again.');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      alert('Error generating report. Please ensure the event has impact data.');
    } finally {
      setReportGenerating(false);
    }
  };

  const downloadReportAsPDF = () => {
    if (!reportData) return;

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Beach Cleanup Impact Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .stat-card { background: #f5f5f5; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 24px; font-weight: bold; color: #4CAF50; }
          .section { margin: 20px 0; }
          .section h2 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🌊 Beach Cleanup Impact Report</h1>
          <h2>${reportData.event.name}</h2>
          <p><strong>Date:</strong> ${formatDate(reportData.event.date)} | <strong>Location:</strong> ${reportData.event.location}</p>
          <p><strong>Organizer:</strong> ${reportData.event.organizer}</p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${reportData.statistics.totalParticipants}</div>
            <div>Volunteers</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.statistics.totalWasteCollected} kg</div>
            <div>Waste Collected</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.statistics.beachAreaCleaned} m²</div>
            <div>Beach Area Cleaned</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">${reportData.statistics.co2Offset} kg</div>
            <div>CO₂ Offset</div>
          </div>
        </div>

        <div class="section">
          <pre>${reportData.reportContent}</pre>
        </div>

        <div class="section">
          <p><em>Report generated on ${new Date(reportData.generatedAt).toLocaleString()}</em></p>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Beach_Cleanup_Report_${reportData.event.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGoBack = () => {
    navigate(-1);
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
        <button
          onClick={handleGenerateReport}
          disabled={reportGenerating}
          style={{
            padding: '10px 20px',
            backgroundColor: reportGenerating ? '#ccc' : '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: reportGenerating ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {reportGenerating ? 'Generating...' : '📊 Generate Report'}
        </button>
      </div>

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
              📊 Live Information
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
                  color: '#ff9800'
                }}>
                  {Math.ceil((new Date(event.deadlineForRegistration) - new Date()) / (1000 * 60 * 60 * 24))}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  Days Until Deadline
                </div>
              </div>
            </div>
          </div>

          {/* Rest of the existing content remains the same */}
          {/* Description, Additional Features, Safety Protocols, Organizer Info, Registered Volunteers */}
          {/* ... (keeping the existing sections for brevity) ... */}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && reportData && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              position: 'sticky',
              top: 0,
              backgroundColor: 'white',
              zIndex: 1001
            }}>
              <h2 style={{ margin: 0, color: '#333' }}>🌊 Impact Report Preview</h2>
              <div>
                <button
                  onClick={downloadReportAsPDF}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                  }}
                >
                  📄 Download HTML
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '20px' }}>
              {/* Event Info */}
              <div style={{
                textAlign: 'center',
                marginBottom: '30px',
                paddingBottom: '20px',
                borderBottom: '3px solid #4CAF50'
              }}>
                <h1 style={{ color: '#333', margin: '0 0 10px 0' }}>{reportData.event.name}</h1>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Date:</strong> {formatDate(reportData.event.date)} | 
                  <strong> Location:</strong> {reportData.event.location}
                </p>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Organizer:</strong> {reportData.event.organizer}
                </p>
              </div>

              {/* Statistics Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
              }}>
                <div style={{
                  background: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#4CAF50'
                  }}>
                    {reportData.statistics.totalParticipants}
                  </div>
                  <div style={{ color: '#666' }}>Volunteers</div>
                </div>
                <div style={{
                  background: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#2196F3'
                  }}>
                    {reportData.statistics.totalWasteCollected} kg
                  </div>
                  <div style={{ color: '#666' }}>Waste Collected</div>
                </div>
                <div style={{
                  background: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#FF9800'
                  }}>
                    {reportData.statistics.beachAreaCleaned} m²
                  </div>
                  <div style={{ color: '#666' }}>Beach Area Cleaned</div>
                </div>
                <div style={{
                  background: '#f5f5f5',
                  padding: '20px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#9C27B0'
                  }}>
                    {reportData.statistics.co2Offset} kg
                  </div>
                  <div style={{ color: '#666' }}>CO₂ Offset</div>
                </div>
              </div>

              {/* AI Generated Report Content */}
              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'Arial, sans-serif',
                  lineHeight: '1.6',
                  margin: 0,
                  color: '#333'
                }}>
                  {reportData.reportContent}
                </pre>
              </div>

              <div style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '14px',
                color: '#888'
              }}>
                <em>Report generated on {new Date(reportData.generatedAt).toLocaleString()}</em>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewEvent;