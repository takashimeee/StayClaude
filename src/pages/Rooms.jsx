import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, ChevronDown, Users } from "lucide-react";
import PageShell from "../components/PageShell";
import RoomCard from "../components/RoomCard";
import { useApp } from "../context/AppContext";
import { GUEST_OPTIONS, ROOMS, ROOM_STYLES, getGuestOption } from "../data/rooms";
import { addDays, nightsBetween, stayIssue, todayISO } from "../lib/utils";

export default function Rooms() {
  const { search, setSearch, isRoomAvailable, startDraft } = useApp();
  const navigate = useNavigate();
  const [style, setStyle] = useState("All Styles");
  const [sort, setSort] = useState("recommended");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const guest = getGuestOption(search.guests);
  const nights = nightsBetween(search.checkIn, search.checkOut);
  const datesOk = nights > 0;

  const onChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "checkIn" && next.checkOut <= value) next.checkOut = addDays(value, 1);
      return next;
    });
  };

  const rows = ROOMS.filter((r) => style === "All Styles" || r.style === style)
    .map((room) => {
      const reason = datesOk
        ? stayIssue({
            room,
            checkIn: search.checkIn,
            checkOut: search.checkOut,
            adults: guest.adults,
            children: guest.children,
            available: isRoomAvailable(room.id, search.checkIn, search.checkOut),
          })
        : "Pick valid dates to check availability.";
      return { room, status: { bookable: !reason, reason } };
    })
    .filter((row) => !onlyAvailable || row.status.bookable)
    .sort((a, b) => {
      if (sort === "low") return a.room.price - b.room.price;
      if (sort === "high") return b.room.price - a.room.price;
      if (sort === "rating") return b.room.rating - a.room.rating;
      return 0;
    });

  const book = (room) => {
    startDraft(room.id, {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: guest.adults,
      children: guest.children,
    });
    navigate("/booking");
  };

  return (
    <PageShell>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest">Find Your Room</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">
          Choose your dates and party size to see what's available.
        </p>

        <div className="bg-white rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <label className="bg-cream rounded-lg px-3 py-2 text-xs">
            <span className="flex items-center gap-1 text-ink/60 mb-1">
              <Calendar size={12} /> Check-in
            </span>
            <input
              type="date"
              name="checkIn"
              min={todayISO()}
              value={search.checkIn}
              onChange={onChange}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="bg-cream rounded-lg px-3 py-2 text-xs">
            <span className="flex items-center gap-1 text-ink/60 mb-1">
              <Calendar size={12} /> Check-out
            </span>
            <input
              type="date"
              name="checkOut"
              min={search.checkIn}
              value={search.checkOut}
              onChange={onChange}
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <label className="relative bg-cream rounded-lg px-3 py-2 text-xs">
            <span className="flex items-center gap-1 text-ink/60 mb-1">
              <Users size={12} /> Guests
            </span>
            <select
              name="guests"
              value={search.guests}
              onChange={onChange}
              className="w-full bg-transparent text-sm outline-none appearance-none pr-6"
            >
              {GUEST_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 bottom-3 pointer-events-none text-ink/50" />
          </label>
        </div>

        {!datesOk && (
          <div className="flex items-center gap-2 bg-[#FBE9E4] text-[#C9552F] text-xs rounded-lg px-4 py-3 mb-6">
            <AlertTriangle size={14} /> Check-out must be after check-in.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by style">
            {ROOM_STYLES.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                aria-pressed={style === s}
                className={`text-xs font-medium rounded-full px-4 py-2 border transition-colors ${
                  style === s
                    ? "bg-forest text-white border-forest"
                    : "bg-white text-ink border-transparent hover:border-forest"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              Only show available
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white rounded-full px-3 py-2 outline-none"
              aria-label="Sort rooms"
            >
              <option value="recommended">Recommended</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rows.map(({ room, status }) => (
              <RoomCard key={room.id} room={room} status={status} onBook={() => book(room)} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-ink/60 py-16">
            No rooms match your filters. Try a different style or dates.
          </p>
        )}
      </main>
    </PageShell>
  );
}
