// src/components/WasteSubmission.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WasteSubmission = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [wasteData, setWasteData] = useState({
    category: '',
    type: '',
    weight: '',
    bagCount: '', // Added bag count field
  });
  
  const [wasteInfoOptions, setWasteInfoOptions] = useState({
    categories: [],
    typesByCategory: {},
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedBags, setDetectedBags] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const ROBOFLOW_API_KEY = "1LQguMxnArMopGecFXSP";

  useEffect(() => {
    fetchWasteInformation();
  }, []);

  const fetchWasteInformation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/waste/waste-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setWasteInfoOptions({
          categories: response.data.categories,
          typesByCategory: response.data.typesByCategory,
        });
      }
    } catch (error) {
      console.error('Error fetching waste information:', error);
      setError('Failed to load waste categories and types.');
    } finally {
      setLoading(false);
    }
  };

  const loadImageBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWasteData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'category') {
      setWasteData((prev) => ({ ...prev, type: '' }));
    }
    
    // Reset verification when bag count changes
    if (name === 'bagCount') {
      setIsVerified(false);
      setVerificationError(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setDetectedBags(null);
      setIsVerified(false);
      setVerificationError(null);
    }
  };

  const verifyBagCount = async () => {
    if (!imageFile || !wasteData.bagCount) {
      setVerificationError('Please upload an image and enter bag count first.');
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const imageBase64 = await loadImageBase64(imageFile);
      
      const response = await axios({
        method: "POST",
        url: "https://serverless.roboflow.com/garbage-bag-obj-detctn/1",
        params: {
          api_key: ROBOFLOW_API_KEY
        },
        data: imageBase64,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const detectedCount = response.data.predictions?.length || 0;
      const enteredCount = parseInt(wasteData.bagCount);
      
      setDetectedBags(detectedCount);

      if (detectedCount === enteredCount) {
        setIsVerified(true);
        setVerificationError(null);
      } else {
        setIsVerified(false);
        setVerificationError(
          `Verification failed! Detected ${detectedCount} bags but you entered ${enteredCount} bags. Please check and try again.`
        );
      }
    } catch (error) {
      console.error('Bag verification error:', error);
      setVerificationError('Failed to verify bag count. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isVerified) {
      setError('Please verify your bag count before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const volunteerId = decodedToken.id;

      const response = await axios.post(
        `${API_BASE_URL}/waste/add`,
        {
          eventId,
          volunteerId,
          category: wasteData.category,
          type: wasteData.type,
          weight: parseFloat(wasteData.weight),
          bagCount: parseInt(wasteData.bagCount), // Include verified bag count
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        alert('✅ Waste data submitted successfully!');
        navigate(`/event/${eventId}`);
      } else {
        setError(response.data.message || 'Failed to submit waste data.');
      }
    } catch (err) {
      console.error('Waste submission error:', err);
      setError(err.response?.data?.message || 'Error submitting waste data. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '50px auto 20px',
      padding: '20px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9',
    },
    title: {
      textAlign: 'center',
      marginBottom: '30px',
      color: '#333',
    },
    formGroup: {
      marginBottom: '15px',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold',
      color: '#555',
    },
    input: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box',
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      fontSize: '16px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    primaryButton: {
      backgroundColor: '#28a745',
      color: 'white',
    },
    secondaryButton: {
      backgroundColor: '#007bff',
      color: 'white',
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#28a745',
      color: 'white',
      marginTop: '20px',
    },
    disabledButton: {
      opacity: '0.6',
      cursor: 'not-allowed',
    },
    error: {
      color: '#dc3545',
      marginBottom: '15px',
      textAlign: 'center',
    },
    success: {
      color: '#28a745',
      marginBottom: '15px',
      textAlign: 'center',
    },
    imagePreview: {
      maxWidth: '100%',
      height: '200px',
      objectFit: 'contain',
      border: '1px solid #ddd',
      borderRadius: '4px',
      marginTop: '10px',
    },
    verificationSection: {
      border: '1px solid #007bff',
      borderRadius: '5px',
      padding: '15px',
      backgroundColor: '#f8f9fa',
      marginBottom: '20px',
    },
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Submit Collected Waste</h2>
      {error && <div style={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Category:</label>
          <select
            name="category"
            value={wasteData.category}
            onChange={handleInputChange}
            required
            style={styles.input}
          >
            <option value="">Select Category</option>
            {wasteInfoOptions.categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Type:</label>
          <select
            name="type"
            value={wasteData.type}
            onChange={handleInputChange}
            required
            disabled={!wasteData.category}
            style={styles.input}
          >
            <option value="">Select Type</option>
            {wasteData.category &&
              wasteInfoOptions.typesByCategory[wasteData.category]?.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Weight (kg):</label>
          <input
            type="number"
            name="weight"
            value={wasteData.weight}
            onChange={handleInputChange}
            required
            min="0.01"
            step="0.01"
            style={styles.input}
          />
        </div>

        {/* Bag Verification Section */}
        <div style={styles.verificationSection}>
          <h3 style={{ marginTop: 0, color: '#007bff' }}>Bag Count Verification</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Number of Garbage Bags:</label>
            <input
              type="number"
              name="bagCount"
              value={wasteData.bagCount}
              onChange={handleInputChange}
              required
              min="1"
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Upload Image of Garbage Bags:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              style={styles.input}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={styles.imagePreview} />
            )}
          </div>

          <button
            type="button"
            onClick={verifyBagCount}
            disabled={isVerifying || !imageFile || !wasteData.bagCount}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              ...(isVerifying || !imageFile || !wasteData.bagCount ? styles.disabledButton : {})
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify Bag Count'}
          </button>

          {verificationError && <div style={styles.error}>{verificationError}</div>}
          
          {isVerified && (
            <div style={styles.success}>
              ✅ Verification successful! Detected {detectedBags} bags matching your input.
            </div>
          )}
          
          {detectedBags !== null && !isVerified && (
            <div style={styles.error}>
              ❌ Detected {detectedBags} bags in the image.
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || !isVerified}
          style={{
            ...styles.button,
            ...styles.submitButton,
            ...(submitting || !isVerified ? styles.disabledButton : {})
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Waste Data'}
        </button>
      </form>
    </div>
  );
};

export default WasteSubmission;