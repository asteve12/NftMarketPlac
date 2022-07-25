require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()

const projectId = "2cafc22ace1d4167acec9622129065c8"

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      accounts:[privateKey]
    }
   
    
  },
  solidity: "0.8.9",
};
