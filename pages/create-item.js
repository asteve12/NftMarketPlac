import Link from 'next/link'
import { create  } from "ipfs-http-client"
import { useEffect, useState } from 'react'
import Web3Modal from "web3modal"
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { nftaddress, nftMarketAddr } from '../.config'
import NFT from "./abi/NFT.json"
import Market from "./abi/NftMarket.json"
import { toast, ToastContainer} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { BeatLoader } from 'react-spinners'

const auth =
    'Basic ' + Buffer.from(process.env.NEXT_PUBLIC_PROJECT_ID + ':' + process.env.NEXT_PUBLIC_SECRET_KEY).toString('base64');
   
const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol:"https",
    headers: {
    authorization:auth
},})

export default function CreateItems() {
    const [fileUrl, setFileUrl] = useState(null);
    const [formInput, updateFormInput] = useState({ price: "", name: "", description: "" })
    const [isUploading, setIsUploading] = useState(false)
    const [isCreate,setIsCreate] = useState(false)
    const router = useRouter()
    
  

    async function onChange(e) {
        const file = e.target.files[0]
        setIsUploading(true)
        
        try {
            const added = await client.add(
                file,
                {
                    progress:(prog)=> console.log(`received: ${prog}`)
                }
            )

            console.log("returnedOBj", added)
            if(added.path) setIsUploading(false)
          
            const url =  `https://stev-market.infura-ipfs.io/ipfs/${added.path}`
            setFileUrl(url)
            console.log("url",file)
            
        } catch (e) {
            console.log(e)
        }
    }

    async function createItem() {
        const { name, description, price } = formInput
        if (!name || !description || !price || !fileUrl) return
        
        const data = JSON.stringify({
            name, description,image:fileUrl
        })

        try {
            const added = await client.add(data)
            const url = `https://stev-market.infura-ipfs.io/ipfs/${added.path}`
            createSale(url)
            
        } catch (error) {
            console.log("Error uploading file", error)
            
        }
        
    }

    async function createSale(url) {
        try {
            setIsCreate(true)
            const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        
         const currentBal = await provider.getBalance(window.ethereum.selectedAddress)
       if (formInput.price > ethers.utils.formatUnits(currentBal,"wei")) {
            return toast.error("insufficient balance in wallet")
       }
            console.log("maga",parseInt(window.ethereum.chainId,16))
        if (parseInt(window.ethereum.chainId,16) !== 80001) {
            return toast.error("only polygon testnet supported")
        }

         let contract = new ethers.Contract(nftaddress,NFT.abi,signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()

        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, "ether")
        contract = new ethers.Contract(nftMarketAddr, Market.abi, signer)
        let listingPrice = await contract.getListingPrice()
        listingPrice = listingPrice.toString()
        transaction = await contract.createMarketItem(
            nftaddress,
            tokenId,
            price,{value:listingPrice}
        )
            const txReceipt = await transaction.wait();
            if (txReceipt) {
                setIsCreate(false)
                toast.success("success")
            }  
            
        router.push("/")
        }
        catch (e) {
            toast.error("an error occurred try again")
            setIsCreate(false)
        }
        




    }    



    return (
        <>
             <ToastContainer></ToastContainer>
              <div className='flex justify-center'>
           
            <div className='w-1/2 flex flex-col pb-12'>
                <input
                    placeholder='Asset Name'
                    className='mt-8 border round p-4'
                    onChange={(e) => updateFormInput({
                        ...formInput,
                        name: e.target.value
                    })}
                ></input>
                <textarea
                    placeholder='Asset Description'
                    className='mt-2 border rounded p-4'
                    onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}
                    

                ></textarea>

                <input
                    placeholder='Asset Price in Matic'
                    className="mt-2 border rounded p-4"
                    onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                    
                ></input>

                <input
                    type="file"
                    name="Asset"
                    className='my-4'
                    onChange={onChange}
                ></input>
                {isUploading && <p className="text-center font-bold font-[15px] text-pink">file upload in progress....</p>}
                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl}></img>
                    )
                }
                <button
                    onClick={createItem}
                    className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
                
                >
                        {isCreate ?  <BeatLoader></BeatLoader>:"Create Digital Asset"  } 
                </button>

            </div>

        </div>
        </>
      
    )




     
}



