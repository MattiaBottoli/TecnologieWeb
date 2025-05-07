"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Esplora() {
  return(
    <div className="container">
      <header>
        <h1>Stacca la spina e ammira i paesaggi del Trentino</h1>
      </header>
      <section>
        <p>
          <Link href="/esplora/programmazione">
            Programma un'escursione 
          </Link> da fare con la famiglia, con gli amici o anche in solitaria.
        </p>
      </section>
      <section>
        <p>Se non sai ancora dove andare ti consigliamo di visualizzare le 
          sezioni <Link href="/percorsi">percorsi</Link> e <Link href="/bivacchi">bivacchi</Link> 
        </p>
      </section>
      <footer>
        <p>
          Inoltre tesserandoti avrai accesso ai contenuti esclusivi.
          Per maggiori informazioni <Link href="/tesserati">clicca qui</Link>.
        </p>
      </footer>
    </div>
  );
}