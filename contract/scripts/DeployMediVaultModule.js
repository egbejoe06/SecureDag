const hre = require("hardhat");

async function main() {
  console.log("Starting MediVaultModule deployment...");

  // Replace with the deployed contract addresses
  const DATA_VAULT_ADDRESS = "0x7921a59A9A4830E9A139916Aa847BA3afb0D4b74"; // Update this with actual DataVault address
  const KEY_REGISTRY_ADDRESS = "0x459A204007F4ce833BbED148A9842214bf03E22F"; // Update this with actual KeyRegistry address
  const PROVIDER_REGISTRY_ADDRESS =
    "0x435d778934db991532c477eb4D1908ee073e6194"; // Update this with actual ProviderRegistry address

  const MediVaultModule = await hre.ethers.getContractFactory(
    "MediVaultModule"
  );
  console.log("Contract factory obtained...");

  const mediVaultModule = await MediVaultModule.deploy(
    DATA_VAULT_ADDRESS,
    KEY_REGISTRY_ADDRESS,
    PROVIDER_REGISTRY_ADDRESS
  );
  await mediVaultModule.waitForDeployment();

  const deployedAddress = await mediVaultModule.getAddress();

  console.log(`MediVaultModule deployed at: ${deployedAddress}`);
  console.log(`DataVault address: ${DATA_VAULT_ADDRESS}`);
  console.log(`KeyRegistry address: ${KEY_REGISTRY_ADDRESS}`);
  console.log(`ProviderRegistry address: ${PROVIDER_REGISTRY_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
