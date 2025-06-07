import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AddEvent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get editEvent from navigation state if it exists
  const editEvent = location.state?.editEvent || null;
  
  const [formData, setFormData] = useState({
    name: '',
    dateOfEvent: '',
    deadlineForRegistration: '',
    startTime: '',
    endTime: '',
    beachName: '',
    beachLocation: { latitude: '', longitude: '' },
    beachAddress: '',
    description: '',
    image: '',
    refreshments: false,
    certificateOfParticipation: false,
    safetyProtocols: ['']
  });

  const [beaches, setBeaches] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchBeaches();
    if (editEvent) {
      setFormData({
        ...editEvent,
        dateOfEvent: new Date(editEvent.dateOfEvent).toISOString().split('T')[0],
        deadlineForRegistration: new Date(editEvent.deadlineForRegistration).toISOString().split('T')[0],
        safetyProtocols: editEvent.safetyProtocols?.length > 0 ? editEvent.safetyProtocols : ['']
      });
      setImagePreview(editEvent.image || '');
    }
  }, [editEvent]);

  const fetchBeaches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/beaches`);
      const data = await response.json();
      if (data.success) {
        setBeaches(data.data);
      }
    } catch (error) {
      console.error('Error fetching beaches:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleBeachChange = async (e) => {
    const beachName = e.target.value;
    setFormData(prev => ({ ...prev, beachName }));

    if (beachName) {
      try {
        const response = await fetch(`${API_BASE_URL}/beaches/${beachName}`);
        const data = await response.json();
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            beachLocation: data.data.beachLocation,
            beachAddress: data.data.beachAddress
          }));
        }
      } catch (error) {
        console.error('Error fetching beach details:', error);
      }
    }
  };

  const handleSafetyProtocolChange = (index, value) => {
    const newProtocols = [...formData.safetyProtocols];
    newProtocols[index] = value;
    setFormData(prev => ({ ...prev, safetyProtocols: newProtocols }));
  };

  const addSafetyProtocol = () => {
    setFormData(prev => ({
      ...prev,
      safetyProtocols: [...prev.safetyProtocols, '']
    }));
  };

  const removeSafetyProtocol = (index) => {
    const newProtocols = formData.safetyProtocols.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, safetyProtocols: newProtocols }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image;

    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        body: formDataImg
      });
      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      return formData.image;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload image if new file selected
      const imageUrl = await uploadImage();

      const submitData = {
        ...formData,
        image: imageUrl,
        safetyProtocols: formData.safetyProtocols.filter(protocol => protocol.trim() !== '')
      };

      const token = localStorage.getItem('token');
      const url = editEvent 
        ? `${API_BASE_URL}/events/${editEvent._id}`
        : `${API_BASE_URL}/events/create`;
      
      const method = editEvent ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        alert(editEvent ? 'Event updated successfully!' : 'Event created successfully!');
        navigate('/my_events');
      } else {
        alert(data.message || 'Error saving event');
      }
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/my_events');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>{editEvent ? 'Edit Event' : 'Add New Event'}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Event Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Event Date *</label>
            <input
              type="date"
              name="dateOfEvent"
              value={formData.dateOfEvent}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Registration Deadline *</label>
            <input
              type="date"
              name="deadlineForRegistration"
              value={formData.deadlineForRegistration}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Beach Name *</label>
          <select
            name="beachName"
            value={formData.beachName}
            onChange={handleBeachChange}
            required
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          >
            <option value="">Select a beach</option>
            {beaches.map(beach => (
              <option key={beach._id} value={beach.beachName}>
                {beach.beachName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Beach Address</label>
          <input
            type="text"
            name="beachAddress"
            value={formData.beachAddress}
            onChange={handleInputChange}
            readOnly
            style={{ width: '100%', padding: '8px', margin: '5px 0', backgroundColor: '#f5f5f5' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            style={{ width: '100%', padding: '8px', margin: '5px 0', resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Event Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '8px', margin: '5px 0' }}
          />
          {imagePreview && (
            <div style={{ marginTop: '10px' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Safety Protocols</label>
          {formData.safetyProtocols.map((protocol, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
              <input
                type="text"
                value={protocol}
                onChange={(e) => handleSafetyProtocolChange(index, e.target.value)}
                placeholder="Enter safety protocol"
                style={{ flex: 1, padding: '8px' }}
              />
              {formData.safetyProtocols.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSafetyProtocol(index)}
                  style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button 
            type="button" 
            onClick={addSafetyProtocol}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', marginTop: '5px' }}
          >
            Add Protocol
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            <input
              type="checkbox"
              name="refreshments"
              checked={formData.refreshments}
              onChange={handleInputChange}
              style={{ marginRight: '8px' }}
            />
            Refreshments Provided
          </label>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              name="certificateOfParticipation"
              checked={formData.certificateOfParticipation}
              onChange={handleInputChange}
              style={{ marginRight: '8px' }}
            />
            Certificate of Participation
          </label>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading}
            style={{ 
              padding: '12px 24px', 
              backgroundColor: loading || uploading ? '#6c757d' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: loading || uploading ? 'not-allowed' : 'pointer' 
            }}
          >
            {loading || uploading ? 'Saving...' : (editEvent ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;