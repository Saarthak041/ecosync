require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ignition");
require("dotenv").config();

// Verify private key exists
if (!process.env.PRIVATE_KEY) {
    throw new Error("Please set your PRIVATE_KEY in a .env file");
}

module.exports = {
    solidity: "0.8.20",
    networks: {
        amoy: {
            url: "https://openapi.amoy.direct/",
            chainId: 80002,
            accounts: [`${process.env.PRIVATE_KEY}`]
        }
    }
};