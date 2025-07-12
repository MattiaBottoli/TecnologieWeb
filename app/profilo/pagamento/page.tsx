"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuth } from "../../../context/AuthContext";

export default function PagamentoPage() {
  const { isLoggedIn, loading } = useAuth()
  const searchParams = useSearchParams()
  const mail = searchParams.get("mail") || ""
  const router = useRouter()

  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvv, setCvv] = useState("")
  const [isPaying, setIsPaying] = useState(false)

  const today = new Date()
  const year = today.getFullYear()
  const month = (today.getMonth() + 1).toString().padStart(2, '0') // +1 perché i mesi partono da 0

  const minMonth = `${year}-${month}`


  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\D/g, "")
    let sum = 0
    let shouldDouble = false

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned.charAt(i))

      if (shouldDouble) {
        digit *= 2
        if (digit > 9) digit -= 9
      }

      sum += digit
      shouldDouble = !shouldDouble
    }

    return sum % 10 === 0
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    const isValidCard = validateCardNumber(cardNumber)
    const expiryParts = expiry.split("-")
    const expiryYear = Number(expiryParts[0])
    const expiryMonth = Number(expiryParts[1])

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1

    const isExpiryValid =
      expiryParts.length === 2 &&
      (expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth))

    const isCvvValid = /^\d{3}$/.test(cvv)

    if (!isValidCard) {
      alert("Numero carta non valido.")
      return
    }
    if (!isExpiryValid) {
      alert("Data di scadenza non valida.")
      return
    }
    if (!isCvvValid) {
      alert("CVV non valido.")
      return
    }

    setIsPaying(true)

    try {
      const res = await fetch(`http://localhost:5000/api/tesseramento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mail }),
      })

      if (!res.ok) throw new Error("Errore nel pagamento")

      const data = await res.json()
      localStorage.setItem("token", data.token)
      router.refresh?.() 
      router.push("/profilo")
    } catch (err) {
      alert("Errore nel pagamento")
      console.error(err)
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="Pagamento-Container">
      <h1>Inserisci i dati di pagamento</h1>
      <form onSubmit={handlePayment} className="payment-form">
        <label>
          Numero Carta:
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="1234 5678 9012 3456"
            required
          />
        </label>
        <label>
          Scadenza:
          <input
            type="month"
            min={minMonth}
            required
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            placeholder=""
          />
        </label>
        <br/>
        <label>
          CVV:
          <input
            type="password"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            placeholder="123"
            required
          />
        </label>
        <button type="submit" className="btnlog" disabled={isPaying}>
          {isPaying ? "Elaborazione..." : "Paga e Tesserati"}
        </button>
        <Link href={"/profilo"}>
          <button>ANNULLA</button>
        </Link> 
      </form>
    </div>
  )
}