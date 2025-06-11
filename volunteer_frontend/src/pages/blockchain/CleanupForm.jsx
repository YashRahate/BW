// src/components/CleanupForm.jsx
import React, { useState } from "react";
import recordCleanupOnChain from "../../blockchain/interact";


const CleanupForm = () => {
  const [eventId, setEventId] = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [kg, setKg] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await recordCleanupOnChain(eventId, volunteerId, Number(kg), location);

    if (result.success) {
      alert(`Cleanup recorded! TxHash: ${result.txHash}`);
    } else {
      alert("Failed: " + result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Record Cleanup</h2>
      <input placeholder="Event ID" value={eventId} onChange={(e) => setEventId(e.target.value)} required />
      <input placeholder="Volunteer ID" value={volunteerId} onChange={(e) => setVolunteerId(e.target.value)} required />
      <input type="number" placeholder="Waste Collected (Kg)" value={kg} onChange={(e) => setKg(e.target.value)} required />
      <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Record Cleanup"}
      </button>
    </form>
  );
};

export default CleanupForm;
