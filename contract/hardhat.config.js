require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: "https://testnet.hashio.io/api",
      accounts: [
        "b4f1f73018c79fc521fd52673a951ded8ee1137842b67a9462eca2d120398e96",
      ],
    },
  },
};
