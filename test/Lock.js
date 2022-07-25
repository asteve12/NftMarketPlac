const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
  it("Should create and execute sale", async function () {
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy();
    await market.deployed();

    const marketAddress = market.address;

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed();

    const nftContractAddr = nft.address;

    let listingPrice = await market.getListingPrice();
    listingPrice = listingPrice.toString()

    const auctionPrice = ethers.utils.parseUnits("1", "ether")

    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")
    
    await market.createMarketItem(nftContractAddr, 1, auctionPrice, { value: listingPrice })
    await market.createMarketItem(nftContractAddr, 2, auctionPrice, { value: listingPrice })
    
    const [_, buyerAddress] = await ethers.getSigners();

    await market.connect(buyerAddress).createMarketSale(nftContractAddr, 1, {value:auctionPrice})

    const items = await market.fetchMarketItems()
    
    console.log("items",items)

  })
  
});
