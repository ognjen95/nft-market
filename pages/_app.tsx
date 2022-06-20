import '../styles/globals.css'
import { AppProps } from 'next/app'
import { Navbar } from '../components'

function Marketplace({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Navbar />
      <Component {...pageProps} />
    </div >
  )
}

export default Marketplace