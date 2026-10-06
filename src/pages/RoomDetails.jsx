import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import {
  BedDouble,
  CalendarDays,
  ChevronDown,
  Image as ImageIcon,
  Maximize,
  Mountain,
  Star,
  Users,
} from "lucide-react";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import { AMENITY_META } from "../components/amenityIcons";
import { useApp } from "../context/AppContext";
import { GUEST_OPTIONS, REVIEWS, ROOMS, findRoom, getGuestOption } from "../data/rooms";
import { addDays, calcPricing, formatDate, formatMoney, nightsBetween, stayIssue, todayISO } from "../lib/utils";

export default function RoomDetails() {
  const { id } = useParams();
  const room = findRoom(id);
  if (!room) return <Navigate to="/rooms" replace />;
  return <RoomDetailsInner key={room.id} room={room} />;
}

function RoomDetailsInner({ room }) {
  const { search, setSearch, isRoomAvailable, startDraft } = useApp();
  const navigate = useNavigate();

  const [active, setActive] = useState(0);
  const [checkIn, setCheckIn] = useState(search.checkIn);
  const [checkOut, setCheckOut] = useState(search.checkOut);
  const [guestKey, setGuestKey] = useState(search.guests);
  const [showError, setShowError] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [allReviews, setAllReviews] = useState(false);

  const guest = getGuestOption(guestKey);
  const nights = nightsBetween(checkIn, checkOut);
  const available = nights > 0 ? isRoomAvailable(room.id, checkIn, checkOut) : true;
  const issue = stayIssue({
    room,
    checkIn,
    checkOut,
    adults: guest.adults,
    children: guest.children,
    available,
  });
  const pricing = calcPricing(room, nights);

  const changeCheckIn = (value) => {
    setCheckIn(value);
    if (checkOut <= value) setCheckOut(addDays(value, room.minNights));
    setShowError(false);
  };

  const handleConfirm = () => {
    if (issue) {
      setShowError(true);
      return;
    }
    setSearch({ checkIn, checkOut, guests: guestKey });
    startDraft(room.id, { checkIn, checkOut, adults: guest.adults, children: guest.children });
    navigate("/booking");
  };

  const quickFacts = [
    { icon: Users, label: `${room.maxGuests} Guests` },
    { icon: BedDouble, label: room.beds },
    { icon: Maximize, label: `${room.sqm} sqm` },
    { icon: Mountain, label: room.view },
  ];

  const recommendations = ROOMS.filter((r) => r.id !== room.id).slice(0, 3);
  const reviews = allReviews ? REVIEWS : REVIEWS.slice(0, 1);
  const bookable = !issue;

  return (
    <PageShell>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-2 rounded-xl overflow-hidden">
          <img
            src={room.gallery[active]}
            alt={room.name}
            className="w-full h-72 md:h-[360px] object-cover bg-sand"
          />
          <div className="grid grid-cols-2 gap-2">
            {room.gallery.map((src, i) => (
              <button
                key={src}
                onClick={() => setActive(i)}
                aria-label={`Show photo ${i + 1}`}
                className={`relative h-[176px] overflow-hidden focus:outline-none bg-sand ${
                  active === i ? "ring-2 ring-coral ring-inset" : ""
                }`}
              >
                <img src={src} alt={`${room.name} view ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-sm text-ink/60">
          <span>{room.location}</span>
          <button
            onClick={() => setPhotosOpen(true)}
            className="flex items-center gap-1 text-coral hover:underline"
          >
            <ImageIcon size={14} /> View all {room.gallery.length} photos
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 mt-8">
          {/* Left */}
          <div>
            <h1 className="font-serif text-3xl text-forest">{room.name}</h1>

            <div className="flex flex-wrap gap-6 bg-mint rounded-lg px-5 py-3 mt-4 text-sm">
              {quickFacts.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-ink/80">
                  <Icon size={16} className="text-forest" />
                  {label}
                </div>
              ))}
            </div>

            <section className="mt-8">
              <h2 className="font-serif text-lg text-forest mb-2">The Retreat</h2>
              {room.about.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-ink/80 mb-3">
                  {p}
                </p>
              ))}
            </section>

            <section className="mt-8">
              <h2 className="font-serif text-lg text-forest mb-4">Room Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                {room.amenities.map((key) => {
                  const { icon: Icon, label } = AMENITY_META[key];
                  return (
                    <div key={key} className="flex items-center gap-3 text-sm">
                      <span className="h-8 w-8 shrink-0 rounded-full bg-mint flex items-center justify-center text-forest">
                        <Icon size={15} />
                      </span>
                      {label}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-serif text-lg text-forest flex items-center gap-2">
                  Guest Reviews
                  <span className="flex items-center gap-1 text-sm font-sans text-ink/70">
                    <Star size={14} className="fill-coral text-coral" />
                    {room.rating}
                  </span>
                </h2>
                <button onClick={() => setAllReviews((v) => !v)} className="text-sm text-coral hover:underline">
                  {allReviews ? "Show fewer reviews" : `See all ${room.reviewCount} reviews`}
                </button>
              </div>
              <div className="space-y-3">
                {reviews.map((rv) => (
                  <div key={rv.author} className="bg-white rounded-lg p-5">
                    <div className="flex items-center gap-1 text-coral mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < rv.rating ? "fill-coral" : "text-ink/20"} />
                      ))}
                      <span className="ml-auto text-xs text-ink/50">{rv.date}</span>
                    </div>
                    <p className="text-sm text-ink/80 italic mb-3">"{rv.text}"</p>
                    <p className="text-sm font-medium text-forest">{rv.author}</p>
                    <p className="text-xs text-ink/50">{rv.meta}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Booking card */}
          <aside className="h-fit lg:sticky lg:top-6 bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-2xl font-semibold text-coral">${room.price}</span>
                <span className="text-sm text-ink/60"> / night</span>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full ${
                  available && !issue?.includes("fits") ? "bg-mint text-forest" : "bg-[#FBE9E4] text-[#C9552F]"
                }`}
              >
                {available ? "Available" : "Booked"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <label className="bg-cream rounded-lg px-3 py-2 text-xs">
                <span className="block text-ink/60 mb-1">Check-in</span>
                <input
                  type="date"
                  min={todayISO()}
                  value={checkIn}
                  onChange={(e) => changeCheckIn(e.target.value)}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
              <label className="bg-cream rounded-lg px-3 py-2 text-xs">
                <span className="block text-ink/60 mb-1">Check-out</span>
                <input
                  type="date"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setShowError(false);
                  }}
                  className="w-full bg-transparent text-sm outline-none"
                />
              </label>
            </div>

            <label className="relative block bg-cream rounded-lg px-3 py-2 text-xs mb-4">
              <span className="block text-ink/60 mb-1">Guests</span>
              <select
                value={guestKey}
                onChange={(e) => {
                  setGuestKey(e.target.value);
                  setShowError(false);
                }}
                className="w-full bg-transparent text-sm outline-none appearance-none pr-6"
              >
                {GUEST_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 translate-y-[2px] pointer-events-none text-ink/50"
              />
            </label>

            <p className="text-xs text-center text-ink/50 mb-4 flex items-center justify-center gap-1">
              <CalendarDays size={13} />
              {nights > 0
                ? `${nights} night${nights > 1 ? "s" : ""} selected (${formatDate(checkIn, {
                    month: "short",
                    day: "numeric",
                  })} – ${formatDate(checkOut, { month: "short", day: "numeric" })})`
                : "Pick a check-out date after check-in"}
            </p>

            <div className="text-sm space-y-2 border-t border-black/5 pt-4">
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
              <div className="flex justify-between font-semibold text-forest pt-2 border-t border-black/5">
                <span>Total Amount</span>
                <span>${formatMoney(pricing.total)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              className={`w-full transition-colors text-white text-sm font-medium rounded-full py-3 mt-5 ${
                bookable ? "bg-coral hover:bg-coral-dark" : "bg-coral/60"
              }`}
            >
              Confirm Reservation
            </button>

            {(showError || (issue && nights > 0)) && issue && (
              <p className="text-center text-xs text-[#C9552F] mt-3" role="alert">
                {issue}
              </p>
            )}

            <p className="text-center text-xs text-ink/40 mt-2">
              No charge until you pay · Free cancellation up to 48 hours before check-in
            </p>
          </aside>
        </div>

        {/* You might also like */}
        <section className="mt-16 border border-dashed border-[#8FB9C7]/40 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-xl text-forest">You Might Also Like</h2>
            <Link to="/rooms" className="text-sm text-coral hover:underline">
              View all accommodations
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendations.map((r) => (
              <div key={r.id} className="bg-white rounded-lg overflow-hidden">
                <img src={r.image} alt={r.name} className="w-full h-36 object-cover bg-sand" />
                <div className="p-4">
                  <h3 className="font-serif text-forest mb-1">{r.name}</h3>
                  <p className="text-xs text-ink/50 mb-3">
                    {r.view} · {r.beds} · Up to {r.maxGuests} guests
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-semibold">${r.price}</span>
                      <span className="text-ink/50"> /night</span>
                    </span>
                    <Link to={`/rooms/${r.id}`} className="text-coral text-xs hover:underline">
                      View details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {photosOpen && (
        <Modal title={`${room.name} — Photos`} onClose={() => setPhotosOpen(false)} wide>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {room.gallery.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`${room.name} photo ${i + 1}`}
                className="w-full h-52 object-cover rounded-lg bg-sand"
              />
            ))}
          </div>
        </Modal>
      )}
    </PageShell>
  );
}
