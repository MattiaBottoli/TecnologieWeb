"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <header className="header">
      <div className="logo">
        <Link href='/'>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </Link> 
      </div>
      <nav>
        <ul>
          <li><Link href="/bivacchi">SCOPRI</Link></li> 
          <li><Link href="/escursioni">PROGRAMMA</Link></li>  
          <li><Link href="/aggiungi">AGGIUNGI</Link></li>
        </ul>
      </nav>
      
      <div className="auth-buttons">
        {isLoggedIn ? (
          <>
            <button className="contact-btn" onClick={logout}>Logout</button>
            <Link href="/profilo">
                <button className="contact-btn">Profilo</button>
            </Link>
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