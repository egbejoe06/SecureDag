const hre = require("hardhat");

async function main() {
  console.log("Starting ProviderRegistry deployment...");

  const ProviderRegistry = await hre.ethers.getContractFactory(
    "ProviderRegistry"
  );
  console.log("Contract factory obtained...");

  const providerRegistry = await ProviderRegistry.deploy();
  await providerRegistry.waitForDeployment();

  const deployedAddress = await providerRegistry.getAddress();

  console.log(`ProviderRegistry deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
