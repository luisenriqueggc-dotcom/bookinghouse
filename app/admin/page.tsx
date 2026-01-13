import { createClient } from "@supabase/supabase-js";
import AdminClient from "./ui/AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ margin: 0 }}>Admin</h1>
        <p style={{ color: "crimson" }}>Error cargando reservas: {error.message}</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ margin: 0, fontSize: 28 }}>Admin — Solicitudes</h1>
      <p style={{ marginTop: 8, opacity: 0.7 }}>
        Aquí puedes aprobar o rechazar solicitudes.
      </p>

      <AdminClient initialRows={data || []} />
    </main>
  );
}
