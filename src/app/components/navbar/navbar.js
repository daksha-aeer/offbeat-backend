// src/app/components/navbar/Navbar.js
import Link from 'next/link'
import "./navbar.css";
import ConnectButton from './ConnectButton';


export default function Navbar() {
    return (
        <nav className="navbar">
            <div className='logo'>
                <h2>Offbeat Greets</h2>
            </div>
            <div className='nav-links'>
                <Link href="/">Home</Link>
                <Link href="/about">About</Link>
                <Link href="/contact">Contact Us</Link>
                <ConnectButton />
            </div>
            
      </nav>
    );
}
