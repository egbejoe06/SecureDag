const hre = require("hardhat");

async function main() {
  console.log("Starting DataVault deployment...");

  // Replace with the deployed KeyRegistry address
  const KEY_REGISTRY_ADDRESS = "0x459A204007F4ce833BbED148A9842214bf03E22F"; // Update this with actual address

  const DataVault = await hre.ethers.getContractFactory("DataVault");
  console.log("Contract factory obtained...");

  const dataVault = await DataVault.deploy(KEY_REGISTRY_ADDRESS);
  await dataVault.waitForDeployment();

  const deployedAddress = await dataVault.getAddress();

  console.log(`DataVault deployed at: ${deployedAddress}`);
  console.log(`KeyRegistry address: ${KEY_REGISTRY_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
