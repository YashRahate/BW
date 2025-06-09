import React, { useState } from 'react';
import './WasteClassifier';

const WasteClassifier = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Prediction failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="waste-classifier">
      <h2>Waste-Classifier</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && <img src={preview} alt="preview" className="preview" />}
        <button type="submit" disabled={!selectedFile || loading}>
          {loading ? 'Classifying...' : 'Classify Waste'}
        </button>
      </form>

      {result && (
        <div className="result">
          {result.error ? (
            <p className="error">{result.error}</p>
          ) : (
            <>
              <p>Prediction: <strong>{result.prediction}</strong></p>
              <p>Confidence: {(result.confidence * 100).toFixed(2)}%</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default WasteClassifier;
