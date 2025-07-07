// src/blockchain/abi.js
export const contractABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "string", "name": "eventId", "type": "string" },
      { "indexed": false, "internalType": "string", "name": "volunteerId", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "wasteCollectedKg", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "location", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "CleanupRecorded",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "eventId", "type": "string" },
      { "internalType": "string", "name": "volunteerId", "type": "string" },
      { "internalType": "uint256", "name": "wasteCollectedKg", "type": "uint256" },
      { "internalType": "string", "name": "location", "type": "string" }
    ],
    "name": "recordCleanup",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
