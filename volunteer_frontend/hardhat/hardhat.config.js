require("@nomiclabs/hardhat-ethers");
require("dotenv").config(); // <-- Load .env

const { INFURA_API_KEY, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    }
  }
};
