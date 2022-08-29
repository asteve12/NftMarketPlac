import "../styles/globals.css"
import Link from 'next/link'
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6 flex  justify-between md:block'>
        <p className='text-xl   md:text-4xl md:text-left font-bold'>
          <Nav.Link href="/"> Metaverse  Marketplace</Nav.Link>
         
        </p>
        <div className="flex mt-4  text-10px hidden md:block ">
          <Link href="/">
            <a className='mr-6 text-pink-500'>
              Home
            </a>
          </Link>
          <Link href="/create-item">
            <a className='mr-6 text-pink-500'>
              Sell Digital Asset
            </a>
          </Link>
          <Link href="/my-assets">
            <a className='mr-6 text-pink-500'>
              My Digital Assets
            </a>
          </Link>

          <Link href="/creator-dashboard">
            <a className='mr-6 text-pink-500'>
              Creator Dashboard
            </a>
          </Link>
          
        </div>
        <div className="sm:hidden">
        <Nav  activeKey="1" >
              <NavDropdown  className="text-white" title="Menu" id="nav-dropdown">
              <Nav.Link href="/">Home</Nav.Link>
           
                <Nav.Link href="/create-item">
                      Sell Digital Asset
              </Nav.Link>
              <Nav.Link href="/my-assets">
                          My Digital Assets
                    </Nav.Link>
               <Nav.Link href="/creator-dashboard">
                          Creator Dashboard
                    </Nav.Link>
                </NavDropdown>
    </Nav>
      
         </div>
        </nav>
            <Component {...pageProps} />
    </div>
  )
}

export default MyApp
