import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { name, email, phone, notes, checkIn, checkOut } = body;

    if (!name || !email || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Faltan datos." }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aviso por correo al admin
    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    if (resendKey && notifyEmail) {
      const resend = new Resend(resendKey);
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
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e: any) {
    return NextResponse.json({ error: "Error inesperado." }, { status: 500 });
  }
}
