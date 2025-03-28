const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  const QuestionAndAnswer = await hre.ethers.getContractFactory(
    "QuestionAndAnswer"
  );
  console.log("Contract factory obtained...");

  const questionAndAnswer = await QuestionAndAnswer.deploy(); // Deploy the contract
  await questionAndAnswer.waitForDeployment(); // FIX: Ensure deployment is awaited

  const deployedAddress = await questionAndAnswer.getAddress(); // Get the deployed contract address

  console.log(`QuestionAndAnswer deployed at: ${deployedAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
