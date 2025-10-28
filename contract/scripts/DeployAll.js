const hre = require("hardhat");

async function main() {
  console.log("Starting comprehensive SecureDAG deployment...");
  console.log("================================================");

  const deployedContracts = {};

  try {
    // 1. Deploy KeyRegistry (no dependencies)
    console.log("\n1. Deploying KeyRegistry...");
    const KeyRegistry = await hre.ethers.getContractFactory("KeyRegistry");
    const keyRegistry = await KeyRegistry.deploy();
    await keyRegistry.waitForDeployment();
    deployedContracts.keyRegistry = await keyRegistry.getAddress();
    console.log(`✓ KeyRegistry deployed at: ${deployedContracts.keyRegistry}`);

    // 2. Deploy ProviderRegistry (no dependencies)
    console.log("\n2. Deploying ProviderRegistry...");
    const ProviderRegistry = await hre.ethers.getContractFactory(
      "ProviderRegistry"
    );
    const providerRegistry = await ProviderRegistry.deploy();
    await providerRegistry.waitForDeployment();
    deployedContracts.providerRegistry = await providerRegistry.getAddress();
    console.log(
      `✓ ProviderRegistry deployed at: ${deployedContracts.providerRegistry}`
    );

    // 3. Deploy DataVault (depends on KeyRegistry)
    console.log("\n3. Deploying DataVault...");
    const DataVault = await hre.ethers.getContractFactory("DataVault");
    const dataVault = await DataVault.deploy(deployedContracts.keyRegistry);
    await dataVault.waitForDeployment();
    deployedContracts.dataVault = await dataVault.getAddress();
    console.log(`✓ DataVault deployed at: ${deployedContracts.dataVault}`);

    // 4. Deploy BioKeyModule (depends on DataVault and KeyRegistry)
    console.log("\n4. Deploying BioKeyModule...");
    const BioKeyModule = await hre.ethers.getContractFactory("BioKeyModule");
    const bioKeyModule = await BioKeyModule.deploy(
      deployedContracts.dataVault,
      deployedContracts.keyRegistry
    );
    await bioKeyModule.waitForDeployment();
    deployedContracts.bioKeyModule = await bioKeyModule.getAddress();
    console.log(
      `✓ BioKeyModule deployed at: ${deployedContracts.bioKeyModule}`
    );

    // 5. Deploy MediVaultModule (depends on DataVault, KeyRegistry, and ProviderRegistry)
    console.log("\n5. Deploying MediVaultModule...");
    const MediVaultModule = await hre.ethers.getContractFactory(
      "MediVaultModule"
    );
    const mediVaultModule = await MediVaultModule.deploy(
      deployedContracts.dataVault,
      deployedContracts.keyRegistry,
      deployedContracts.providerRegistry
    );
    await mediVaultModule.waitForDeployment();
    deployedContracts.mediVaultModule = await mediVaultModule.getAddress();
    console.log(
      `✓ MediVaultModule deployed at: ${deployedContracts.mediVaultModule}`
    );

    // 6. Deploy IPSealModule (no dependencies)
    console.log("\n6. Deploying IPSealModule...");
    const IPSealModule = await hre.ethers.getContractFactory("IPSealModule");
    const ipSealModule = await IPSealModule.deploy();
    await ipSealModule.waitForDeployment();
    deployedContracts.ipSealModule = await ipSealModule.getAddress();
    console.log(
      `✓ IPSealModule deployed at: ${deployedContracts.ipSealModule}`
    );

    // Summary
    console.log("\n================================================");
    console.log("🎉 All contracts deployed successfully!");
    console.log("================================================");
    console.log("Contract Addresses:");
    console.log(`KeyRegistry:      ${deployedContracts.keyRegistry}`);
    console.log(`ProviderRegistry: ${deployedContracts.providerRegistry}`);
    console.log(`DataVault:        ${deployedContracts.dataVault}`);
    console.log(`BioKeyModule:     ${deployedContracts.bioKeyModule}`);
    console.log(`MediVaultModule:  ${deployedContracts.mediVaultModule}`);
    console.log(`IPSealModule:     ${deployedContracts.ipSealModule}`);
    console.log("================================================");

    // Save addresses to a file for reference
    const fs = require("fs");
    const deploymentInfo = {
      network: hre.network.name,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts,
    };

    fs.writeFileSync(
      `deployments-${hre.network.name}-${Date.now()}.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(
      `\n📄 Deployment info saved to deployments-${
        hre.network.name
      }-${Date.now()}.json`
    );
  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
