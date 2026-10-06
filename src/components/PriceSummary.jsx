import { ShieldCheck, Star } from "lucide-react";
import { formatDate, formatMoney, guestsLabel } from "../lib/utils";

export default function PriceSummary({ room, draft, nights, pricing, children, note }) {
  return (
    <aside className="h-fit lg:sticky lg:top-6 bg-mint rounded-xl p-5">
      <img src={room.image} alt={room.name} className="w-full h-32 object-cover rounded-lg mb-4 bg-sand" />
      <h3 className="font-serif text-lg text-forest">{room.name}</h3>
      <div className="flex items-center gap-1 text-xs text-ink/60 mb-4">
        <Star size={13} className="fill-coral text-coral" />
        {room.rating} ({room.reviewCount} reviews)
      </div>

      <div className="border-t border-ink/10 pt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3 text-ink/70">
          <span>Dates</span>
          <span className="text-right">
            {draft.checkIn && draft.checkOut
              ? `${formatDate(draft.checkIn, { month: "short", day: "numeric", year: "numeric" })} – ${formatDate(
                  draft.checkOut,
                  { month: "short", day: "numeric", year: "numeric" }
                )}`
              : "Choose your dates"}
          </span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Length of Stay</span>
          <span>{nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "—"}</span>
        </div>
        <div className="flex justify-between gap-3 text-ink/70">
          <span>Guests</span>
          <span className="text-right">{guestsLabel(draft.adults, draft.children)}</span>
        </div>
      </div>

      <div className="border-t border-ink/10 mt-4 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-ink/70">
          <span>
            ${room.price} x {nights} night{nights !== 1 ? "s" : ""}
          </span>
          <span>${formatMoney(pricing.subtotal)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Resort fees &amp; taxes</span>
          <span>${formatMoney(pricing.fees)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>Service fee</span>
          <span>${formatMoney(pricing.service)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-ink/10 mt-4 pt-4">
        <span className="font-serif text-forest">Total Amount</span>
        <span className="font-serif text-lg text-coral">${formatMoney(pricing.total)}</span>
      </div>

      {children}

      <p className="flex items-center justify-center gap-1 text-xs text-ink/50 mt-4">
        <ShieldCheck size={13} /> {note ?? "You won't be charged yet"}
      </p>
    </aside>
  );
}
