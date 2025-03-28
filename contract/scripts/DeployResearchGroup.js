const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const ResearchGroups = await hre.ethers.getContractFactory("ResearchGroups");
  console.log("Contract factory obtained...");

  const researchGroups = await ResearchGroups.deploy(); // Deploy the contract
  await researchGroups.waitForDeployment(); // FIX: Ensure deployment is awaited

  const deployedAddress = await researchGroups.getAddress(); // Get the deployed contract address

  console.log(`ResearchGroups deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
