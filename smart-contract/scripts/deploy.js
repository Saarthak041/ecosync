const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CarbonCredit contract...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "MATIC");

  // Deploy the contract
  const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
  
  // Base URI for metadata (can be updated later)
  const baseURI = "https://api.ecosync.app/metadata/";
  
  const carbonCredit = await CarbonCredit.deploy(baseURI);
  await carbonCredit.waitForDeployment();

  const contractAddress = await carbonCredit.getAddress();
  console.log("CarbonCredit deployed to:", contractAddress);

  // Grant additional roles if needed
  console.log("Setting up roles...");
  
  // You can add additional issuers and verifiers here
  // await carbonCredit.grantRole(await carbonCredit.ISSUER_ROLE(), "0x...");
  // await carbonCredit.grantRole(await carbonCredit.VERIFIER_ROLE(), "0x...");

  console.log("Deployment completed!");
  console.log("Contract address:", contractAddress);
  console.log("Transaction hash:", carbonCredit.deploymentTransaction().hash);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    transactionHash: carbonCredit.deploymentTransaction().hash
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });