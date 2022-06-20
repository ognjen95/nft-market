import "@nomiclabs/hardhat-waffle";
import fs from "fs";

const privateKey = fs.readFileSync(".secret").toString();
const projectId = "b7dd9d8cb0564c538476aa4f11b4d012"; // this should go in .env

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    // aurora: {
    //   url: `https://aurora-testnet.infura.io/v3/${projectId}`,
    //   accounts: [privateKey]
    // },
    // mainnet: {
    // },
  },
  // solidity: "0.8.4",
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
