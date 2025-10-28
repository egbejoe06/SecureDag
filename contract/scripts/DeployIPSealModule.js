const hre = require("hardhat");

async function main() {
  console.log("Starting IPSealModule deployment...");

  const IPSealModule = await hre.ethers.getContractFactory("IPSealModule");
  console.log("Contract factory obtained...");

  const ipSealModule = await IPSealModule.deploy();
  await ipSealModule.waitForDeployment();

  const deployedAddress = await ipSealModule.getAddress();

  console.log(`IPSealModule deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
