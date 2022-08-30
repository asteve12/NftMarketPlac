import  axios  from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal"
import { ethers } from 'ethers'
import { nftaddress, nftMarketAddr } from '../.config'
import NFT from "./abi/NFT.json"
import Market from "./abi/NftMarket.json"
import { PulseLoader } from 'react-spinners'


export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState("not-loaded")
  const [showLoader, setLoader] = useState(false)
  
  useEffect(() => {
    loadNfts()
  }, [])
  
  async function loadNfts() {
 
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   cacheProvider: true,
    // })
    // const connection = await web3Modal.connect()
    // const provider = new ethers.providers.Web3Provider(connection)
    //check if wallet installed
    if (window.ethereum) {

    
    }
    else {
      alert("install wallet for site to functon properly")
      
      
    }

    setLoader(true)

    console.log("my-provider", process.env.NEXT_PUBLIC_RPC)
    let provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC);
    const tokenContract = new ethers.Contract(nftaddress,NFT.abi,provider)
    const marketContract = new ethers.Contract(nftMarketAddr,Market.abi,provider)
    const data = await marketContract.fetchMarketItems();

    const items = await Promise.all(data.map(async (i) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri);
      let price = ethers.utils.formatUnits(i.price.toString(), "ether")
      let item = {
        price, 
        tokenId: i.itemId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description:meta.data.description
      }
   return item
      
    }))
    setNfts(items)
    setLoadingState("loaded")
    setLoader(false)
  }

  if (loadingState === "loaded" && !nfts.length) {
    return (
      <h1 className='px-20 py-10 text-3xl'>No items in marketplace</h1>
    )
     
  }
  
  async function buyNft(nft) {

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection)
    const { chainId } = await provider.getNetwork()
    //check chainId
    if (chainId !== 80001) {
      alert("only polygon network is supported")
      return;
    }

    try { 
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftMarketAddr, Market.abi, signer)
      
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether")
  
      const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
        value:price
      })
      await transaction.wait()
      loadNfts();
  
    } catch (e) {
      console.log("errorMe", e)
      let errorMsg = e.data.message.split("*")
      alert(`an error occured ${errorMsg[0]}`)
      
    }
    
 
  
  }

  if (showLoader === true) {
    return <div className=" flex   justify-center items-center">
      
            <PulseLoader />
    </div>
  }
  
  return (
    <div className="flex justify-center">
    
      <div className='px-4' style={{ maxWidth: "1600px" }}>
        <div className='grid grid-cols sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
        {
          nfts.map((nft, i) => {
            return (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img className="w-full h-1/2 bg-yellow object-cover" src={nft.image}></img>
                <div className='pl-3 pt-2'>
                  <p className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ overflow: "hidden" }}>
                    <p className='text-gray-400'>{nft.description}</p>
                  </div>
                </div>
                <div className='p-4 bg-black'>
                  <p className='text-2xl mb-4 font-bold text-white'>{nft.price} ETH</p>
                  <button
                    className='w-full h-100px bg-pink-500 text-white 
                   font-bold py-2 px-12 rounded'
                    onClick={()=> buyNft(nft)}
                  >buy</button>
                </div>

              </div>
            )
            
          })
        }
        </div>
      
      </div>
   
    </div>
  )
}
