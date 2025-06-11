import { ethers } from "ethers";
import { contractABI } from "./abi";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Make sure this matches your deployment

const recordCleanupOnChain = async (eventId, volunteerId, kg, location) => {
  try {
    if (!window.ethereum) throw new Error("MetaMask not installed");

    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const network = await provider.getNetwork();
    console.log("Connected to network:", network); // 🧠 ADD THIS FOR DEBUGGING

    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    const tx = await contract.recordCleanup(eventId, volunteerId, kg, location);
    await tx.wait();

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("Blockchain Error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
};

export default recordCleanupOnChain;
