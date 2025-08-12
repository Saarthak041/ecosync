const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying CarbonCredit contract...");
    
    const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
    
    console.log("CarbonCredit deployed to:", await carbonCredit.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });