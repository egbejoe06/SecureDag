const hre = require("hardhat");

async function main() {
  console.log("Starting KeyRegistry deployment...");

  const KeyRegistry = await hre.ethers.getContractFactory("KeyRegistry");
  console.log("Contract factory obtained...");

  const keyRegistry = await KeyRegistry.deploy();
  await keyRegistry.waitForDeployment();

  const deployedAddress = await keyRegistry.getAddress();

  console.log(`KeyRegistry deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
