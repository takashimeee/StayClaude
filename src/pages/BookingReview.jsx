import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle, Calendar, CheckCircle2, ChevronDown, Pencil, Star } from "lucide-react";
import PageShell from "../components/PageShell";
import Stepper from "../components/Stepper";
import GuestStepper from "../components/GuestStepper";
import PriceSummary from "../components/PriceSummary";
import { useApp } from "../context/AppContext";
import { findRoom } from "../data/rooms";
import {
  EMAIL_PATTERN,
  addDays,
  calcPricing,
  formatDate,
  guestsLabel,
  nightsBetween,
  stayIssue,
  todayISO,
} from "../lib/utils";

const CANCELLATION_SUMMARY =
  "Free cancellation until 48 hours before check-in. Cancellations made after that window are subject to a one-night fee.";
const CANCELLATION_DETAILS =
  "If you cancel at least 48 hours before your check-in time, you'll receive a full refund. Cancellations within 48 hours of check-in are charged one night's stay plus applicable fees. No-shows are charged the full reservation amount. To cancel or make changes, visit My Reservations or contact our team.";

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="text-ink text-right">{value}</span>
    </div>
  );
}

export default function BookingReview() {
  const { draft } = useApp();
  const room = findRoom(draft?.roomId);
  if (!draft || !room) return <Navigate to="/rooms" replace />;
  return <ReviewInner draft={draft} room={room} />;
}

function ReviewInner({ draft, room }) {
  const { setDraft, isRoomAvailable } = useApp();
  const navigate = useNavigate();

  const [editingStay, setEditingStay] = useState(false);
  const [editingGuest, setEditingGuest] = useState(false);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [guestError, setGuestError] = useState("");

  const set = (key, value) =>
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "checkIn" && next.checkOut <= value) next.checkOut = addDays(value, room.minNights);
      return next;
    });

  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const available = nights > 0 ? isRoomAvailable(room.id, draft.checkIn, draft.checkOut) : true;
  const issue = stayIssue({ room, ...draft, available });
  const pricing = calcPricing(room, nights);

  const saveGuest = () => {
    if (!draft.fullName.trim()) return setGuestError("Enter the guest's full name.");
    if (!EMAIL_PATTERN.test(draft.email)) return setGuestError("Enter a valid email address.");
    if (draft.phone.trim().replace(/\D/g, "").length < 7) return setGuestError("Enter a valid phone number.");
    setGuestError("");
    setEditingGuest(false);
    return undefined;
  };

  return (
    <PageShell stepper={<Stepper current={1} />}>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest">Review Your Booking</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">
          Please double-check all information below. Once confirmed, proceed to secure your payment.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-2 bg-mint border border-forest/15 text-forest text-xs rounded-lg px-4 py-3">
              <CheckCircle2 size={14} className="shrink-0" />
              {CANCELLATION_SUMMARY}
            </div>

            {issue && (
              <div
                role="alert"
                className="flex items-center gap-2 bg-[#FBE9E4] text-[#C9552F] text-xs rounded-lg px-4 py-3"
              >
                <AlertTriangle size={14} className="shrink-0" /> {issue} Edit your stay details to continue.
              </div>
            )}

            <div className="bg-white rounded-xl p-4 flex gap-4 items-center">
              <img
                src={room.image}
                alt={room.name}
                className="h-24 w-32 object-cover rounded-lg shrink-0 bg-sand"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-block text-[10px] uppercase tracking-wide bg-mint text-forest px-2 py-1 rounded mb-1">
                    {room.style}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-ink/60">
                    <Star size={13} className="fill-coral text-coral" />
                    {room.rating} ({room.reviewCount})
                  </span>
                </div>
                <h2 className="font-serif text-lg text-forest">{room.name}</h2>
                <p className="text-xs text-ink/50 mt-1">
                  {room.view} · {room.sqm} sqm
                </p>
              </div>
            </div>

            {/* Stay details */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-1">
                <h2 className="font-serif text-lg text-forest">Stay Details</h2>
                <button
                  onClick={() => setEditingStay((v) => !v)}
                  className="flex items-center gap-1 text-xs text-coral hover:underline"
                >
                  <Pencil size={12} /> {editingStay ? "Close" : "Edit"}
                </button>
              </div>

              {!editingStay ? (
                <div className="divide-y divide-black/5">
                  <SummaryRow
                    label="Check-in Date"
                    value={`${formatDate(draft.checkIn, {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })} (from 3:00 PM)`}
                  />
                  <SummaryRow
                    label="Check-out Date"
                    value={`${formatDate(draft.checkOut, {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })} (until 11:00 AM)`}
                  />
                  <SummaryRow label="Length of Stay" value={`${nights} Night${nights !== 1 ? "s" : ""}`} />
                  <SummaryRow label="Guests" value={guestsLabel(draft.adults, draft.children)} />
                </div>
              ) : (
                <div className="pt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-xs text-ink/60 mb-2">Check-in Date</span>
                      <div className="relative">
                        <input
                          type="date"
                          min={todayISO()}
                          value={draft.checkIn}
                          onChange={(e) => set("checkIn", e.target.value)}
                          className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                        />
                        <Calendar
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-forest pointer-events-none"
                        />
                      </div>
                    </label>
                    <label className="block">
                      <span className="block text-xs text-ink/60 mb-2">Check-out Date</span>
                      <div className="relative">
                        <input
                          type="date"
                          min={draft.checkIn}
                          value={draft.checkOut}
                          onChange={(e) => set("checkOut", e.target.value)}
                          className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                        />
                        <Calendar
                          size={14}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-forest pointer-events-none"
                        />
                      </div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <GuestStepper
                      label="Adults"
                      value={draft.adults}
                      min={1}
                      max={Math.max(1, room.maxGuests - draft.children)}
                      onChange={(v) => set("adults", v)}
                    />
                    <GuestStepper
                      label="Children"
                      value={draft.children}
                      min={0}
                      max={Math.max(0, room.maxGuests - draft.adults)}
                      onChange={(v) => set("children", v)}
                    />
                  </div>
                  <button
                    onClick={() => setEditingStay(false)}
                    className="text-sm bg-forest text-white rounded-full px-5 py-2 hover:bg-forest-dark"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Guest info */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-1">
                <h2 className="font-serif text-lg text-forest">Primary Guest Info</h2>
                <button
                  onClick={() => (editingGuest ? saveGuest() : setEditingGuest(true))}
                  className="flex items-center gap-1 text-xs text-coral hover:underline"
                >
                  <Pencil size={12} /> {editingGuest ? "Done" : "Edit"}
                </button>
              </div>

              {!editingGuest ? (
                <div className="divide-y divide-black/5">
                  <SummaryRow label="Full Name" value={draft.fullName} />
                  <SummaryRow label="Email Address" value={draft.email} />
                  <SummaryRow label="Phone Number" value={draft.phone} />
                </div>
              ) : (
                <div className="pt-3 space-y-4">
                  <label className="block">
                    <span className="block text-xs text-ink/60 mb-2">Full Name</span>
                    <input
                      type="text"
                      value={draft.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="block text-xs text-ink/60 mb-2">Email Address</span>
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs text-ink/60 mb-2">Phone Number</span>
                      <input
                        type="tel"
                        value={draft.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-xs text-ink/60 mb-2">Special Requests</span>
                    <textarea
                      value={draft.specialRequests}
                      onChange={(e) => set("specialRequests", e.target.value)}
                      rows={3}
                      className="w-full bg-cream rounded-lg px-3 py-2 text-sm outline-none resize-none"
                    />
                  </label>
                  {guestError && <p className="text-xs text-red-500">{guestError}</p>}
                  <button
                    onClick={saveGuest}
                    className="text-sm bg-forest text-white rounded-full px-5 py-2 hover:bg-forest-dark"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {!editingGuest && (
              <div className="bg-white rounded-xl p-5">
                <h2 className="font-serif text-lg text-forest mb-3">Special Requests</h2>
                <p className="text-sm text-ink/70 bg-cream rounded-lg px-4 py-3">
                  {draft.specialRequests || "No special requests added."}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-5">
              <h2 className="font-serif text-lg text-forest mb-2">Cancellation Policy</h2>
              <p className="text-sm text-ink/70 mb-2">
                {policyExpanded ? CANCELLATION_DETAILS : CANCELLATION_SUMMARY}
              </p>
              <button
                onClick={() => setPolicyExpanded((v) => !v)}
                className="flex items-center gap-1 text-sm text-coral hover:underline"
              >
                {policyExpanded ? "Show less" : "View full policy"}
                <ChevronDown size={14} className={`transition-transform ${policyExpanded ? "rotate-180" : ""}`} />
              </button>
            </div>

            <Link to="/booking" className="inline-block text-sm text-forest hover:underline">
              ← Back to booking details
            </Link>
          </div>

          <PriceSummary
            room={room}
            draft={draft}
            nights={nights}
            pricing={pricing}
            note="SSL secured payment gateway · prices in USD"
          >
            <button
              onClick={() => navigate("/booking/payment")}
              disabled={Boolean(issue) || editingGuest}
              className="w-full mt-5 bg-coral hover:bg-coral-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium rounded-full py-3"
            >
              Proceed to Payment
            </button>
            <p className="text-center text-xs text-ink/50 mt-3">You'll be taken to our secure payment page next</p>
          </PriceSummary>
        </div>
      </main>
    </PageShell>
  );
}
