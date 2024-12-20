// src/app/components/navbar/Navbar.js
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import "./navbar.css";
import ConnectButton from './ConnectButton';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="navbar">
            <div className="logo">
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <h2>Offbeat Greets</h2>
                </Link>
            </div>
            <div className="nav-links">
                <Link 
                    href="/" 
                    aria-current={pathname === "/" ? "page" : undefined}
                >
                    Home
                </Link>
                <Link 
                    href="/about"
                    aria-current={pathname === "/about" ? "page" : undefined}
                >
                    About
                </Link>
                <Link 
                    href="/contact"
                    aria-current={pathname === "/contact" ? "page" : undefined}
                >
                    Contact Us
                </Link>
                <ConnectButton />
            </div>
        </nav>
    );
}