"use client";

import { useState } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function BookingCalendar({ onChange }: { onChange: (range: any) => void }) {
  const [range, setRange] = useState<DateRange | undefined>();

  return (
    <div>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={(r) => {
            setRange(r);
            onChange(r);
          }}          
        numberOfMonths={2}
      />

      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
        {!range?.from && <p style={{ margin: 0 }}>Selecciona tu fecha de entrada.</p>}
        {range?.from && !range?.to && <p style={{ margin: 0 }}>Ahora selecciona la fecha de salida.</p>}
        {range?.from && range?.to && (
          <p style={{ margin: 0 }}>
            Fechas seleccionadas:{" "}
            <b>{format(range.from, "dd/MM/yyyy")}</b> — <b>{format(range.to, "dd/MM/yyyy")}</b>
          </p>
        )}
      </div>
    </div>
  );
}
