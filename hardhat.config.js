require("@nomicfoundation/hardhat-toolbox");
/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url:process.env.NEXT_PUBLIC_RPC,
      accounts:[process.env.NEXT_PUBLIC_PRIVATE_KEY]
    }
  },
  solidity: "0.8.9",
};
