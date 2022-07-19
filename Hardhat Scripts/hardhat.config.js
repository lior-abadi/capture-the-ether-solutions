require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.4.21",
  networks: {
    ropsten: {
      url: process.env.INFURA_ENDPOINT,
      accounts: [process.env.PKEY]
    }
  }

};
