import React, { useState, useEffect } from "react";
import recordCleanupOnChain from "../../blockchain/interact";
import "./CleanupForm.css"; // Import the CSS file

const CleanupForm = () => {
  const [eventId, setEventId] = useState("");
  const [volunteerId, setVolunteerId] = useState("");
  const [kg, setKg] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      } catch (error) {
        alert("Wallet connection failed");
      }
    } else {
      alert("Please install MetaMask");
    }
  };

  useEffect(() => {
    // Auto-connect if already authorized
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    };
    checkWalletConnection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!walletAddress) {
      alert("Please connect your wallet first.");
      setLoading(false);
      return;
    }

    const result = await recordCleanupOnChain(eventId, volunteerId, Number(kg), location);

    if (result.success) {
      alert(`Cleanup recorded! TxHash: ${result.txHash}`);
    } else {
      alert("Failed: " + result.error);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="cleanup-form">
      <h2>Record Cleanup</h2>

      <button 
        type="button" 
        onClick={connectWallet} 
        className={`wallet-button ${walletAddress ? 'connected' : ''}`}
      >
        {walletAddress 
          ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
          : "Connect Wallet"
        }
      </button>

      <input 
        className="form-input"
        placeholder="Event ID" 
        value={eventId} 
        onChange={(e) => setEventId(e.target.value)} 
        required 
      />
      
      <input 
        className="form-input"
        placeholder="Volunteer ID" 
        value={volunteerId} 
        onChange={(e) => setVolunteerId(e.target.value)} 
        required 
      />
      
      <input 
        className="form-input"
        type="number" 
        placeholder="Waste Collected (Kg)" 
        value={kg} 
        onChange={(e) => setKg(e.target.value)} 
        required 
      />
      
      <input 
        className="form-input"
        placeholder="Location" 
        value={location} 
        onChange={(e) => setLocation(e.target.value)} 
        required 
      />

      <button type="submit" disabled={loading} className="submit-button">
        {loading && <span className="loading-spinner"></span>}
        {loading ? "Submitting..." : "Record Cleanup"}
      </button>
    </form>
  );
};

export default CleanupForm;