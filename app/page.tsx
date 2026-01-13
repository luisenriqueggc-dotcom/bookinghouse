"use client";
import { useState } from "react";
import { format } from "date-fns";
import BookingCalendar from "../components/BookingCalendar";

export default function Home() {
const [range, setRange] = useState<any>(null);
const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [notes, setNotes] = useState("");
const [msg, setMsg] = useState<string | null>(null);
const [loading, setLoading] = useState(false);

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Reserva un cuarto</h1>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Selecciona fechas disponibles y envía una solicitud. Te confirmaremos por correo.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 18,
        }}
      >
        {/* COLUMNA IZQUIERDA */}
        <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Disponibilidad</h2>

          <div
            style={{
              marginTop: 12,
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.03)",
            }}
          >
           <div style={{ marginTop: 12 }}>
           <BookingCalendar onChange={setRange} />
            </div>
          </div>

          <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
            Tip: después haremos que las fechas ocupadas aparezcan deshabilitadas.
          </div>
        </div>

        {/* COLUMNA DERECHA */}
        <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: 16 }}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Solicitud</h2>
          <p style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>
            Completa tus datos. La reserva se confirma cuando sea aprobada.
          </p>

          <label style={{ display: "block", fontSize: 12, marginTop: 10 }}>Nombre</label>
          <input
          value={name}
          onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />

          <label style={{ display: "block", fontSize: 12, marginTop: 10 }}>Email</label>
          <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            type="email"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />

          <label style={{ display: "block", fontSize: 12, marginTop: 10 }}>Teléfono (opcional)</label>
          <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
            placeholder="55 1234 5678"
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
            }}
          />

          <label style={{ display: "block", fontSize: 12, marginTop: 10 }}>Notas (opcional)</label>
          <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
            placeholder="¿A qué hora llegarías, cuántas personas, etc.?"
            rows={3}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(0,0,0,0.12)",
              resize: "vertical",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: 12,
              padding: 12,
              borderRadius: 14,
              border: "none",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={async () => {
              setMsg(null);
            
              if (!range?.from || !range?.to || !name || !email) {
                setMsg("Te falta seleccionar fechas, nombre y email.");
                return;
              }
            
              setLoading(true);
            
              const checkIn = format(range.from, "yyyy-MM-dd");
              const checkOut = format(range.to, "yyyy-MM-dd");
            
              const res = await fetch("/api/request-booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, phone, notes, checkIn, checkOut }),
              });
            
              const data = await res.json();
              setLoading(false);
            
              if (!res.ok) {
                setMsg(data.error || "Ocurrió un error al enviar.");
                return;
              }
            
              setMsg("✅ Solicitud enviada. Te confirmaremos por correo.");
              setName("");
              setEmail("");
              setPhone("");
              setNotes("");
            }}
            
          >
           {loading ? "Enviando..." : "Enviar solicitud"}
           
          </button>
          {msg && <p style={{ marginTop: 10, fontSize: 13 }}>{msg}</p>}
        </div>
      </section>

      <footer style={{ marginTop: 28, fontSize: 12, opacity: 0.6 }}>
        © {new Date().getFullYear()} Reservas
      </footer>
    </main>
  );
}
