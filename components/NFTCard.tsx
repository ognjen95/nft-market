import { FunctionComponent } from 'react'

type Props = {
  name: string,
  description?: string,
  handleBuyNFT?: () => void,
  price: number | string,
  image: string,
}
const NFTCard: FunctionComponent<Props> = ({ name, description, handleBuyNFT, price, image }) => {
  const hasBuyButton = !!handleBuyNFT;

  return (
    <div className="border shadow rounded-xl overflow-hidden my-4 flex flex-col justify-between	">
      <img src={image} alt='NFT-image' />

     {<div className={(!name && !description ? '' : 'p-4')}>
        {name && <p style={{ height: '64px' }} className="text-2xl font-semibold">{name}</p>}
        {description && (
          <div style={{ height: '70px', overflow: 'hidden' }}>
            <p className="text-gray-400">{description}</p>
          </div>)}
      </div>}
      
      <div className="p-4 bg-gray-800">
        <p className="text-2xl mb-4 font-bold text-white">{price} ETH</p>
        {hasBuyButton && <button className="w-full bg-green-500 text-white font-bold py-2 px-12 rounded" onClick={handleBuyNFT}>Buy</button>}
      </div>
    </div>
  )
}

export default NFTCard