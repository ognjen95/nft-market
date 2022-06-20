import { ChangeEvent, ChangeEventHandler, useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

// @ts-ignore
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0")

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState('')
  const [formInput, setFormInput] = useState({ price: '', name: '', description: '' })
  const { push } = useRouter()

  const chooseImage = async (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement)?.files?.[0]
    try {
      if (file) {
        const added = await client.add(
          file,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
      }
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const createNFT = async () => {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* upload to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`
      /* after file is uploaded to IPFS, pass the URL to save it */
      createSale(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }
  }

  const createSale = async (url: string) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    /* then list the item for sale on the marketplace */
    contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()

    transaction = await contract.createMarketItem(nftaddress, tokenId, price, { value: listingPrice })
    await transaction.wait()
    push('/')
  }
  const updateName = (e: ChangeEvent) => setFormInput({ ...formInput, name: (e.target as HTMLInputElement)?.value })
  const updateDescription = (e: ChangeEvent) => setFormInput({ ...formInput, description: (e.target as HTMLInputElement)?.value })
  const updatePrice = (e: ChangeEvent) => setFormInput({ ...formInput, price: (e.target as HTMLInputElement)?.value })

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <h1 className="flex justify-center p-6 text-3xl">Create New NFT</h1>
        <input
          placeholder="Asset Name"
          className="mt-8 border rounded p-4"
          onChange={updateName}
        />
        <textarea
          placeholder="Asset Description"
          className="mt-2 border rounded p-4"
          onChange={updateDescription}
        />
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={updatePrice}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={chooseImage}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={createNFT} className="font-bold mt-4 bg-gray-800 text-white rounded p-4 shadow-lg">
          Create Digital Asset
        </button>
      </div>
    </div>
  )
}