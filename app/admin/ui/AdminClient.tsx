"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Row = any;

export default function AdminClient({ initialRows }: { initialRows: Row[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setMsg(null);
    setLoadingId(id);

    const res = await fetch("/api/admin/set-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });

    const data = await res.json().catch(() => null);

    setLoadingId(null);

    if (!res.ok) {
      setMsg(data?.error || `Error HTTP ${res.status}`);
      return;
    }

    setMsg(`✅ Actualizado: ${status}`);
    router.refresh(); // recarga la tabla desde el server
  }

  return (
    <div style={{ marginTop: 18 }}>
      {msg && <p style={{ marginBottom: 12 }}>{msg}</p>}

      <div style={{ border: "1px solid rgba(0,0,0,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr", gap: 0, padding: 12, background: "rgba(0,0,0,0.03)", fontSize: 12, fontWeight: 700 }}>
          <div>Cliente</div>
          <div>Fechas</div>
          <div>Status</div>
          <div>Acciones</div>
        </div>

        {initialRows.length === 0 ? (
          <p style={{ padding: 12, opacity: 0.7 }}>No hay solicitudes.</p>
        ) : (
          initialRows.map((r) => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr", padding: 12, borderTop: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.name}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{r.email}</div>
              </div>

              <div style={{ fontSize: 13 }}>
                {r.check_in} → {r.check_out}
              </div>

              <div style={{ fontSize: 13 }}>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,0.10)" }}>
                  {r.status}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => setStatus(r.id, "approved")}
                  disabled={loadingId === r.id}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: "pointer", fontWeight: 700 }}
                >
                  {loadingId === r.id ? "..." : "Aprobar"}
                </button>
                <button
                  onClick={() => setStatus(r.id, "rejected")}
                  disabled={loadingId === r.id}
                  style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.12)", background: "white", cursor: "pointer" }}
                >
                  {loadingId === r.id ? "..." : "Rechazar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
