import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import { nftaddress, nftMarketAddr } from '../.config'
import NFT from "./abi/NFT.json"
import Market from "./abi/NftMarket.json"


export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState("not-loaded")
      
    useEffect(() => {
        loadNFTs()
    }, [])
    
  async function loadNFTs() {

    if (window.ethereum) {
      const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const { chainId } = await provider.getNetwork()
      if (chainId !== 80001) {
        alert("only polygon network is supported")
        return;
      }
      else {
        const marketContract = new ethers.Contract(nftMarketAddr, Market.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await marketContract.fetchMyNFTs()
        
        const items = await Promise.all(data.map(async i => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          const meta = await axios.get(tokenUri)
          let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
          }
          return item
        }))
        setNfts(items)
        setLoadingState('loaded') 
      }

    
    }
    else {
      alert("install wallet for site to functon properly")
      return;
      
      
    }
        
        
          
   
    }
    
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)




    return (
        <div className="flex justify-center">
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              {
                nfts.map((nft, i) => (
                  <div key={i} className="border shadow rounded-xl overflow-hidden">
                    <img src={nft.image} className="rounded" />
                    <div className="p-4 bg-black">
                      <p className="text-2xl font-bold text-white">Price - {nft.price} Eth</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )



}