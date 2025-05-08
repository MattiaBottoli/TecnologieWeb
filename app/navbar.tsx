"use client";

import "../styles/nav.css";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo">
        <Link href='/'>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </Link> 
      </div>
      <nav>
        <ul>
          <li><Link href="/bivacchi">Visualizza Bivacchi e percorsi</Link></li> 
          <li><Link href="/tesserati">Tesseramento</Link></li>
          <li><Link href="#">Social</Link></li>
          <li><Link href="/escursioni">Escursioni</Link></li>  
          <li><Link href="/aggiungi">Aggiungi</Link></li>
        </ul>
      </nav>
      
      <div className="auth-buttons">
        {isLoggedIn ? (
          <>
            <button className="contact-btn" onClick={logout}>Logout</button>
            <button className="contact-btn" onClick={() => setMenuOpen(!menuOpen)}>Profilo</button>
            {menuOpen && (
              <div className="dropdown">
                <Link href="/escursioni">In programma</Link>
                <Link href="/preferiti">Preferiti</Link>
                <Link href="/profilo">Profilo</Link>
              </div>
            )}
          </>
        ) : (
          <>
            <Link href="/registrati">
              <button className="contact-btn">REGISTRATI</button>
            </Link>
            <Link href="/login">
              <button className="contact-btn">LOGIN</button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}