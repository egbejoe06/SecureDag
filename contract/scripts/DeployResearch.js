const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const DST_TOKEN_ADDRESS = "0x4BBE9eB5333074c9aE7948a5e6B2e1d7Ad612a78"; // Replace with actual DST token address

  const DeScholarResearch = await hre.ethers.getContractFactory(
    "DeScholarResearch"
  );
  console.log("Contract factory obtained...");

  const deScholarResearch = await DeScholarResearch.deploy(DST_TOKEN_ADDRESS);
  await deScholarResearch.waitForDeployment(); // Ensure deployment completes

  const deployedAddress = await deScholarResearch.getAddress(); // Get the deployed contract address

  console.log(`DeScholarResearch deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
