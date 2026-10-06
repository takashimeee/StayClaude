import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CalendarDays, Search } from "lucide-react";
import PageShell from "../components/PageShell";
import Modal from "../components/Modal";
import GuestStepper from "../components/GuestStepper";
import { useApp } from "../context/AppContext";
import { findRoom } from "../data/rooms";
import {
  addDays,
  calcPricing,
  cancellationOutcome,
  downloadReceipt,
  formatDate,
  formatMoney,
  formatShortRange,
  getStatus,
  guestsLabel,
  nightsBetween,
  stayIssue,
  todayISO,
} from "../lib/utils";

const TABS = ["Upcoming", "Completed", "Cancelled"];
const RANGES = [
  { value: "any", label: "Anytime" },
  { value: "next30", label: "Next 30 days" },
  { value: "next90", label: "Next 90 days" },
  { value: "past30", label: "Past 30 days" },
  { value: "past90", label: "Past 90 days" },
];
const PAGE_SIZE = 3;

const BADGE = {
  upcoming: "bg-mint text-forest",
  completed: "bg-sand text-ink/70",
  cancelled: "bg-[#FBEAEA] text-[#C0554F]",
};

function inRange(r, range) {
  if (range === "any") return true;
  const t = todayISO();
  switch (range) {
    case "next30":
      return r.checkIn >= t && r.checkIn <= addDays(t, 30);
    case "next90":
      return r.checkIn >= t && r.checkIn <= addDays(t, 90);
    case "past30":
      return r.checkIn < t && r.checkIn >= addDays(t, -30);
    case "past90":
      return r.checkIn < t && r.checkIn >= addDays(t, -90);
    default:
      return true;
  }
}

export default function MyReservations() {
  const { myReservations } = useApp();
  const [tab, setTab] = useState("Upcoming");
  const [text, setText] = useState("");
  const [range, setRange] = useState("any");
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null); // { type: 'view'|'modify'|'cancel', id }

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const filtered = myReservations.filter((r) => {
    const q = text.trim().toLowerCase();
    return (
      getStatus(r) === tab.toLowerCase() &&
      inRange(r, range) &&
      (!q || r.roomName.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selected = modal ? myReservations.find((r) => r.id === modal.id) : null;

  const counts = TABS.reduce((acc, t) => {
    acc[t] = myReservations.filter((r) => getStatus(r) === t.toLowerCase()).length;
    return acc;
  }, {});

  return (
    <PageShell>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest">My Reservations</h1>
        <p className="text-sm text-ink/60 mt-1">View and manage your bookings</p>

        {notice && (
          <div role="status" className="mt-4 bg-mint text-forest text-sm rounded-lg px-4 py-3">
            {notice}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 mb-5">
          <div className="flex gap-6" role="tablist">
            {TABS.map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={`text-sm font-semibold pb-2 border-b-2 ${
                  tab === t ? "text-coral border-coral" : "text-ink/50 border-transparent hover:text-ink"
                }`}
              >
                {t} <span className="text-xs font-normal">({counts[t]})</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 bg-white border border-sand rounded-full px-4 py-2 text-sm w-56">
              <Search size={14} className="text-ink/50" />
              <input
                className="w-full bg-transparent outline-none text-sm"
                placeholder="Search by room/reference"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label className="flex items-center gap-2 bg-white border border-sand rounded-full px-4 py-2 text-sm">
              <CalendarDays size={14} className="text-ink/50" />
              <select
                value={range}
                onChange={(e) => {
                  setRange(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none text-sm"
                aria-label="Filter by date"
              >
                {RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          {pageItems.length > 0 ? (
            pageItems.map((r) => (
              <ReservationCard
                key={r.id}
                r={r}
                onView={() => setModal({ type: "view", id: r.id })}
                onModify={() => setModal({ type: "modify", id: r.id })}
                onCancel={() => setModal({ type: "cancel", id: r.id })}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl py-14 text-center">
              <p className="text-sm text-ink/60 mb-4">
                {myReservations.length === 0
                  ? "You don't have any reservations yet."
                  : "No reservations match your filters."}
              </p>
              <Link
                to="/rooms"
                className="inline-block bg-coral hover:bg-coral-dark text-white text-sm rounded-full px-6 py-2.5"
              >
                Find a room
              </Link>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="flex items-center justify-center gap-2 pt-8 text-sm" aria-label="Pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="px-2 disabled:opacity-30"
            >
              « Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                aria-current={n === currentPage ? "page" : undefined}
                className={`h-7 w-7 rounded-full ${
                  n === currentPage ? "bg-coral text-white font-bold" : "hover:bg-black/5"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="px-2 disabled:opacity-30"
            >
              Next »
            </button>
          </nav>
        )}
      </main>

      {selected && modal.type === "view" && <ViewModal r={selected} onClose={() => setModal(null)} />}
      {selected && modal.type === "modify" && (
        <ModifyModal
          r={selected}
          onClose={() => setModal(null)}
          onDone={(msg) => {
            setNotice(msg);
            setModal(null);
          }}
        />
      )}
      {selected && modal.type === "cancel" && (
        <CancelModal
          r={selected}
          onClose={() => setModal(null)}
          onDone={(msg) => {
            setNotice(msg);
            setModal(null);
          }}
        />
      )}
    </PageShell>
  );
}

function ReservationCard({ r, onView, onModify, onCancel }) {
  const status = getStatus(r);
  const total = status === "cancelled" ? r.refund : r.total;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex flex-wrap items-center gap-4">
      <img src={r.image} alt={r.roomName} className="w-20 h-[70px] rounded-lg object-cover shrink-0 bg-sand" />

      <div className="flex-1 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-[15px]">{r.roomName}</span>
          <span className={`text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-full ${BADGE[status]}`}>
            {status.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-ink/60">
          REF: {r.ref} · {formatShortRange(r.checkIn, r.checkOut)} · {r.nights} Night{r.nights !== 1 ? "s" : ""} ·{" "}
          {guestsLabel(r.adults, r.children)}
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          onClick={onView}
          className="text-xs font-semibold px-4 py-2 rounded-full bg-coral hover:bg-coral-dark text-white transition-colors"
        >
          View Details
        </button>
        {status === "upcoming" && (
          <>
            <button
              onClick={onModify}
              className="text-xs font-semibold px-4 py-2 rounded-full bg-white border border-sand hover:bg-cream transition-colors"
            >
              Modify
            </button>
            <button
              onClick={onCancel}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-sand text-[#C0554F] hover:bg-[#FBEAEA] transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <div className="text-right shrink-0 min-w-[84px]">
        <div className="text-[11px] text-ink/60">{status === "cancelled" ? "Refunded" : "Total Paid"}</div>
        <div className="font-bold text-base">${formatMoney(total)}</div>
      </div>
    </div>
  );
}

function ViewModal({ r, onClose }) {
  const status = getStatus(r);
  const row = (label, value) => (
    <div className="flex justify-between gap-4 py-2 text-sm border-b border-black/5">
      <span className="text-ink/60">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
  return (
    <Modal title="Reservation details" onClose={onClose}>
      <img src={r.image} alt={r.roomName} className="w-full h-40 object-cover rounded-lg mb-4 bg-sand" />
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-serif text-lg text-forest">{r.roomName}</h3>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${BADGE[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      {row("Reference", r.ref)}
      {row("Check-in", `${formatDate(r.checkIn)} (from 3:00 PM)`)}
      {row("Check-out", `${formatDate(r.checkOut)} (until 11:00 AM)`)}
      {row("Nights", r.nights)}
      {row("Guests", guestsLabel(r.adults, r.children))}
      {row("Primary guest", `${r.guest.fullName} · ${r.guest.email}`)}
      {r.guest.specialRequests && row("Special requests", r.guest.specialRequests)}
      {row("Room subtotal", `$${formatMoney(r.subtotal)}`)}
      {row("Resort fees & taxes", `$${formatMoney(r.fees)}`)}
      {row("Service fee", `$${formatMoney(r.service)}`)}
      {row("Total", `$${formatMoney(r.total)}`)}
      {row("Payment method", r.paymentMethod)}
      {status === "cancelled" && row("Refund", `$${formatMoney(r.refund)}`)}
      <div className="flex justify-end gap-3 mt-5">
        {status !== "cancelled" && (
          <button
            onClick={() => downloadReceipt(r)}
            className="text-sm border border-forest/30 text-forest rounded-full px-5 py-2 hover:bg-mint"
          >
            Download receipt
          </button>
        )}
        {status === "completed" && (
          <Link
            to={`/rooms/${r.roomId}`}
            className="text-sm bg-coral hover:bg-coral-dark text-white rounded-full px-5 py-2"
          >
            Book again
          </Link>
        )}
        <button onClick={onClose} className="text-sm bg-forest text-white rounded-full px-5 py-2">
          Close
        </button>
      </div>
    </Modal>
  );
}

function ModifyModal({ r, onClose, onDone }) {
  const { modifyReservation, isRoomAvailable } = useApp();
  const room = findRoom(r.roomId);
  const [checkIn, setCheckIn] = useState(r.checkIn);
  const [checkOut, setCheckOut] = useState(r.checkOut);
  const [adults, setAdults] = useState(r.adults);
  const [children, setChildren] = useState(r.children);
  const [error, setError] = useState("");

  const nights = nightsBetween(checkIn, checkOut);
  const available = nights > 0 ? isRoomAvailable(room.id, checkIn, checkOut, r.id) : true;
  const issue = stayIssue({ room, checkIn, checkOut, adults, children, available });
  const pricing = calcPricing(room, nights);
  const diff = pricing.total - r.total;

  const save = () => {
    const result = modifyReservation(r.id, { checkIn, checkOut, adults, children });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onDone(
      `Reservation ${r.ref} updated. New total: $${formatMoney(result.newTotal)}.`
    );
  };

  return (
    <Modal title={`Modify — ${r.roomName}`} onClose={onClose}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="block text-xs text-ink/60 mb-2">Check-in</span>
          <input
            type="date"
            min={todayISO()}
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              if (checkOut <= e.target.value) setCheckOut(addDays(e.target.value, room.minNights));
              setError("");
            }}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
          />
        </label>
        <label className="block">
          <span className="block text-xs text-ink/60 mb-2">Check-out</span>
          <input
            type="date"
            min={checkIn}
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setError("");
            }}
            className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
          />
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <GuestStepper
          label="Adults"
          value={adults}
          min={1}
          max={Math.max(1, room.maxGuests - children)}
          onChange={setAdults}
        />
        <GuestStepper
          label="Children"
          value={children}
          min={0}
          max={Math.max(0, room.maxGuests - adults)}
          onChange={setChildren}
        />
      </div>

      {(issue || error) && (
        <div role="alert" className="flex items-center gap-2 bg-[#FBE9E4] text-[#C9552F] text-xs rounded-lg px-4 py-3 mb-4">
          <AlertTriangle size={14} className="shrink-0" /> {error || issue}
        </div>
      )}

      <div className="bg-mint rounded-lg p-4 text-sm space-y-1 mb-5">
        <div className="flex justify-between text-ink/70">
          <span>Current total</span>
          <span>${formatMoney(r.total)}</span>
        </div>
        <div className="flex justify-between text-ink/70">
          <span>New total ({nights} night{nights !== 1 ? "s" : ""})</span>
          <span>${formatMoney(pricing.total)}</span>
        </div>
        <div className="flex justify-between font-semibold text-forest pt-1 border-t border-ink/10">
          <span>{diff >= 0 ? "Additional amount due" : "Refund due"}</span>
          <span>${formatMoney(Math.abs(diff))}</span>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="text-sm border border-sand rounded-full px-5 py-2 hover:bg-cream">
          Keep as is
        </button>
        <button
          onClick={save}
          disabled={Boolean(issue)}
          className="text-sm bg-coral hover:bg-coral-dark disabled:opacity-50 text-white rounded-full px-5 py-2"
        >
          Save changes
        </button>
      </div>
    </Modal>
  );
}

function CancelModal({ r, onClose, onDone }) {
  const { cancelReservation } = useApp();
  const outcome = cancellationOutcome(r);

  const confirm = () => {
    cancelReservation(r.id, outcome.refund);
    onDone(`Reservation ${r.ref} cancelled. Refund: $${formatMoney(outcome.refund)}.`);
  };

  return (
    <Modal title="Cancel this reservation?" onClose={onClose}>
      <p className="text-sm text-ink/70 mb-1">
        <strong>{r.roomName}</strong> · {formatShortRange(r.checkIn, r.checkOut)}
      </p>
      <p className="text-sm text-ink/70 mb-4">Reference {r.ref}</p>

      <div
        className={`rounded-lg p-4 text-sm mb-5 ${
          outcome.free ? "bg-mint text-forest" : "bg-[#FBE9E4] text-[#C9552F]"
        }`}
      >
        {outcome.free ? (
          <>Free cancellation applies. You'll be refunded the full ${formatMoney(r.total)}.</>
        ) : (
          <>
            You're within 48 hours of check-in, so one night plus taxes (${formatMoney(outcome.charge)}) is
            charged. You'll be refunded ${formatMoney(outcome.refund)}.
          </>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="text-sm border border-sand rounded-full px-5 py-2 hover:bg-cream">
          Keep reservation
        </button>
        <button onClick={confirm} className="text-sm bg-[#C0554F] hover:bg-[#a9463f] text-white rounded-full px-5 py-2">
          Yes, cancel it
        </button>
      </div>
    </Modal>
  );
}
