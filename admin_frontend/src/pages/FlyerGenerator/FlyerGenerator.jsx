// src/components/FlyerGenerator.jsx
import { useState } from 'react';
import './FlyerGenerator.css';

const FlyerGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [flyer, setFlyer] = useState(null);
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
  setLoading(true);
  setError('');
  try {
    const res = await fetch('http://127.0.0.1:5000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (res.ok) {
      setFlyer('http://127.0.0.1:5000' + data.flyer_url); // 👈 fix
      setReport(data.report);
    } else {
      setError(data.error || 'Something went wrong.');
    }
  } catch (err) {
    setError('Failed to generate content.');
  }
  setLoading(false);
};

  return (
    <div className="flyer-generator">
      <h2>Flyer & Report Generator</h2>
      <textarea
        placeholder="Enter a theme (e.g., educate about beach cleaning and sea life)..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button onClick={handleGenerate} disabled={loading || !prompt}>
        {loading ? 'Generating...' : 'Generate'}
      </button>

      {error && <p className="error">{error}</p>}

      {flyer && (
        <div className="result">
          <h3>Flyer Image</h3>
          <img src={flyer} alt="Generated Flyer" className="flyer-image" />
        </div>
      )}

      {report && (
        <div className="result">
          <h3>Generated Report</h3>
          <p>{report}</p>
        </div>
      )}
    </div>
  );
};

export default FlyerGenerator;
