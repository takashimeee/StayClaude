import { Link } from "react-router-dom";
import { BedDouble, Users } from "lucide-react";

export default function RoomCard({ room, status, onBook }) {
  // status: { bookable: boolean, reason?: string }
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="relative h-48 bg-sand">
        <img src={room.image} alt={room.name} loading="lazy" className="w-full h-full object-cover" />
        <span
          className={`absolute top-3 left-3 text-[10px] uppercase tracking-wide px-3 py-1 rounded-full text-white ${
            status.bookable ? "bg-forest" : "bg-ink/70"
          }`}
        >
          {status.bookable ? "Available" : "Unavailable"}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-forest font-medium">{room.resort}</p>
        <h3 className="font-serif text-lg text-forest">{room.name}</h3>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
          <span className="flex items-center gap-1">
            <BedDouble size={13} /> {room.beds}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} /> Up to {room.maxGuests} Guests
          </span>
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {room.chips.map((c) => (
            <li key={c} className="text-[10px] bg-mint text-forest px-2.5 py-1 rounded-full">
              {c}
            </li>
          ))}
        </ul>
        {!status.bookable && status.reason && <p className="text-xs text-[#C9552F]">{status.reason}</p>}
        <div className="flex items-center justify-between mt-auto pt-3">
          <p className="font-serif text-xl text-coral">
            ${room.price}
            <span className="font-sans text-xs text-ink/50"> / night</span>
          </p>
          <div className="flex gap-2">
            <Link
              to={`/rooms/${room.id}`}
              className="text-xs border border-forest text-forest rounded-full px-4 py-2 hover:bg-forest hover:text-white transition-colors"
            >
              Details
            </Link>
            <button
              onClick={onBook}
              disabled={!status.bookable}
              className="text-xs bg-coral hover:bg-coral-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full px-4 py-2 transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
