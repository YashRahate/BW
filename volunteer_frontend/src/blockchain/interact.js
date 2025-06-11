// src/blockchain/interact.js
import { ethers } from "ethers";
import { contractABI } from "./abi";

// Replace this with your actual deployed contract address
const contractAddress = "0x667D9de47aA12CC95b0D4c7Cb4c1C053d1cC2f20";

const recordCleanupOnChain = async (eventId, volunteerId, kg, location) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not installed");

    // Request account access if needed
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.providers.Web3Provider(window.ethereum); // Ethers v5
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.recordCleanup(eventId, volunteerId, kg, location);
    await tx.wait(); // Wait for transaction to be mined

    return { success: true, txHash: tx.hash };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default recordCleanupOnChain;
