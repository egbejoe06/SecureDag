const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const DeScholarProposal = await hre.ethers.getContractFactory(
    "DeScholarProposal"
  );
  console.log("Contract factory obtained...");

  const deScholarProposal = await DeScholarProposal.deploy(); // Deploy the contract
  await deScholarProposal.waitForDeployment(); // FIX: Ensure deployment is awaited

  const deployedAddress = await deScholarProposal.getAddress(); // Get the deployed contract address

  console.log(`DeScholarProposal deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
