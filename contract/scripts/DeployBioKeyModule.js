const hre = require("hardhat");

async function main() {
  console.log("Starting BioKeyModule deployment...");

  // Replace with the deployed contract addresses
  const DATA_VAULT_ADDRESS = "0x7921a59A9A4830E9A139916Aa847BA3afb0D4b74"; // Update this with actual DataVault address
  const KEY_REGISTRY_ADDRESS = "0x459A204007F4ce833BbED148A9842214bf03E22F"; // Update this with actual KeyRegistry address

  const BioKeyModule = await hre.ethers.getContractFactory("BioKeyModule");
  console.log("Contract factory obtained...");

  const bioKeyModule = await BioKeyModule.deploy(
    DATA_VAULT_ADDRESS,
    KEY_REGISTRY_ADDRESS
  );
  await bioKeyModule.waitForDeployment();

  const deployedAddress = await bioKeyModule.getAddress();

  console.log(`BioKeyModule deployed at: ${deployedAddress}`);
  console.log(`DataVault address: ${DATA_VAULT_ADDRESS}`);
  console.log(`KeyRegistry address: ${KEY_REGISTRY_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
