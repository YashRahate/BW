const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("CleanupLogger");
  const contract = await ContractFactory.deploy(); // no constructor args

  await contract.deployed();

  console.log("Contract deployed at:", contract.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
