import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftmarketaddress, nftaddress
} from '../config'

import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import { NFTType } from '../types/nft.types'
import { NFTCard } from '../components'

const CreatorDashboard = () => {
  const [nfts, setNfts] = useState<NFTType[]>([])
  const [sold, setSold] = useState<NFTType[]>([])

  const [loadingState, setLoadingState] = useState(true)

  const loadNFTs = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchItemsCreated()

    const items = await Promise.all(data.map(async (i: NFTType) => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        sold: i.sold,
        image: meta.data.image,
      }
      return item
    }))
    /* create a filtered array of items that have been sold */
    const soldItems = items.filter(i => i.sold)
    setSold(soldItems)
    setNfts(items)
    setLoadingState(false)
  }

  useEffect(() => {
    loadNFTs()
  }, [])

  if (loadingState && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets created</h1>)

  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2">Items Created</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <NFTCard
                key={i}
                description={nft.description}
                image={nft.image}
                price={`Price - ${nft.price} Eth`}
                name={nft.name}
              />
            ))
          }
        </div>
      </div>
      <div className="px-4">
        {
          Boolean(sold.length) && (
            <div>
              <h2 className="text-2xl py-2">Items sold</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {
                  sold.map((nft, i) => (
                    <NFTCard
                      key={i}
                      description={nft.description}
                      image={nft.image}
                      price={`Price - ${nft.price} Eth`}
                      name={nft.name}
                    />
                  ))
                }
              </div>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default CreatorDashboard;