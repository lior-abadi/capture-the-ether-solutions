require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {version: "0.4.21",},
      {version: "0.8.13",},
      {version: "0.7.6"}
    ]
  },
  networks: {
    ropsten: {
      url: process.env.INFURA_ENDPOINT,
      accounts: [process.env.PKEY]
    }
  }

};
