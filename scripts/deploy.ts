const hre = require("hardhat");

async function main() {
    console.log("Deploying CarbonCredit contract...");

    const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCredit.deploy();

    await carbonCredit.waitForDeployment();
    const address = await carbonCredit.getAddress();

    console.log(`CarbonCredit deployed to: ${address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });