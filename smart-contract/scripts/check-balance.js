const { ethers } = require("hardhat");

async function checkBalance() {
  try {
    // Get the wallet from private key
    const [deployer] = await ethers.getSigners();
    
    // Get balance
    const balance = await ethers.provider.getBalance(deployer.address);
    const balanceInMatic = ethers.formatEther(balance);
    
    console.log("=== Mumbai Testnet Balance ===");
    console.log("Wallet Address:", deployer.address);
    console.log("Balance:", balanceInMatic, "MATIC");
    console.log("Balance in Wei:", balance.toString());
    
    // Check if sufficient for deployment (need at least 0.01 MATIC)
    const minRequired = ethers.parseEther("0.01");
    if (balance >= minRequired) {
      console.log("✅ Sufficient balance for deployment!");
    } else {
      console.log("❌ Need more MATIC for deployment");
      console.log("Required:", ethers.formatEther(minRequired), "MATIC");
    }
    
  } catch (error) {
    console.error("Error checking balance:", error.message);
  }
}

checkBalance();
