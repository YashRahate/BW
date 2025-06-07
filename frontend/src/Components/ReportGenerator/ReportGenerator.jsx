import { useState } from 'react';
import './ReportGenerator.css'; // Reuse same styling

const ReportGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    setReport('');

    try {
      const res = await fetch('http://127.0.0.1:5000/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      if (res.ok) {
        setReport(data.report);
      } else {
        setError(data.error || 'Failed to generate report.');
      }
    } catch (err) {
      setError('Network error while generating report.');
    }

    setLoading(false);
  };

  return (
    <div className="report-generator">
      <h2>Environmental Report Generator</h2>
      <textarea
        placeholder="Enter a topic (e.g., ocean pollution or saving coral reefs)..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button onClick={handleGenerateReport} disabled={loading || !prompt}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>

      {error && <p className="error">{error}</p>}

      {report && (
        <div className="result">
          <h3>Generated Report</h3>
          <p>{report}</p>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
