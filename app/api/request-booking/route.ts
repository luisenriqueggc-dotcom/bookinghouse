import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  console.log("request-booking: started");

  // ✅ 1) LOG de variables de entorno (para saber si faltan en Vercel)
  console.log("env check:", {
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasResend: !!process.env.RESEND_API_KEY,
    hasNotifyEmail: !!process.env.NOTIFY_EMAIL,
    fromEmail: process.env.FROM_EMAIL ? "set" : "missing",
  });

  try {
    const body = await req.json();
    console.log("body received:", body);

    const { name, email, phone, notes, checkIn, checkOut } = body;

    if (!name || !email || !checkIn || !checkOut) {
      console.log("missing fields:", { name, email, checkIn, checkOut });
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // ✅ 2) Validación explícita (si falta, lo verás clarito en logs)
    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase env missing", { supabaseUrl: !!supabaseUrl, supabaseKey: !!supabaseKey });
      return NextResponse.json(
        { error: "Faltan variables de Supabase en Vercel (URL o SERVICE_ROLE_KEY)." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("inserting reservation into supabase...");

    // Guardar solicitud como PENDING
    const { data, error } = await supabase
      .from("reservations")
      .insert({
        room_id: "cuarto-1",
        name,
        email,
        phone: phone || null,
        notes: notes || null,
        check_in: checkIn,
        check_out: checkOut,
        status: "pending",
      })
      .select("id")
      .single();

    console.log("supabase result:", { data, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aviso por correo al admin
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    console.log("email check:", {
      hasResendKey: !!resendKey,
      hasNotifyEmail: !!notifyEmail,
    });

    if (resendKey && notifyEmail) {
      const resend = new Resend(resendKey);

      console.log("sending email via resend...");

      await resend.emails.send({
        from: process.env.FROM_EMAIL || "Reservas <onboarding@resend.dev>",
        to: notifyEmail,
        subject: `Nueva solicitud: ${checkIn} → ${checkOut}`,
        html: `
          <p><b>${name}</b> envió una solicitud.</p>
          <p><b>Fechas:</b> ${checkIn} → ${checkOut}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Tel:</b> ${phone || "-"}</p>
          <p><b>Notas:</b> ${notes || "-"}</p>
          <p><b>ID:</b> ${data?.id}</p>
        `,
      });

      console.log("email sent ✅");
    } else {
      console.log("email skipped (missing RESEND_API_KEY or NOTIFY_EMAIL)");
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    console.error("request-booking ERROR:", e?.message || e);
    console.error(e);
    return NextResponse.json({ error: e?.message || "Error inesperado." }, { status: 500 });
  }
}

