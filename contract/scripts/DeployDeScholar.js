const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const DeScholarToken = await hre.ethers.getContractFactory("DeScholarToken");
  console.log("Contract factory obtained...");

  const deScholarToken = await DeScholarToken.deploy(); // Deploy the contract
  await deScholarToken.waitForDeployment(); // FIX: Ensure deployment is awaited

  const deployedAddress = await deScholarToken.getAddress(); // Get the deployed contract address

  console.log(`DeScholarToken deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
