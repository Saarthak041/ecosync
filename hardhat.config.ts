require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
    solidity: "0.8.20",
    defaultNetwork: "amoy",
    networks: {
        amoy: {
            url: "https://testnet-rpc.amoy.technology/",  // Updated RPC URL
            chainId: 80002,
            accounts: process.env.PRIVATE_KEY ? [`${process.env.PRIVATE_KEY}`] : [],
            gasPrice: 1,  // 10 Gwei
            timeout: 90000,  // 90 seconds
            httpHeaders: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "User-Agent": "hardhat"
            }
        }
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};

module.exports = config;