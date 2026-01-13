import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("reservations")
      .update({ status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error inesperado." }, { status: 500 });
  }
}
