import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, Calendar } from "lucide-react";
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
  formatMoney,
  nightsBetween,
  stayIssue,
  todayISO,
} from "../lib/utils";

export default function Booking() {
  const { draft } = useApp();
  const room = findRoom(draft?.roomId);
  if (!draft || !room) return <Navigate to="/rooms" replace />;
  return <BookingInner draft={draft} room={room} />;
}

function BookingInner({ draft, room }) {
  const { setDraft, isRoomAvailable, user } = useApp();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  // Pre-fill guest info from the signed-in profile if the draft has blanks
  useEffect(() => {
    if (!user) return;
    setDraft((d) =>
      d && !d.fullName && !d.email
        ? { ...d, fullName: user.fullName, email: user.email, phone: user.phone || "" }
        : d
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const set = (key, value) => {
    setDraft((d) => {
      const next = { ...d, [key]: value };
      if (key === "checkIn" && next.checkOut <= value) next.checkOut = addDays(value, room.minNights);
      return next;
    });
    setErrors((e) => ({ ...e, [key]: undefined, stay: undefined }));
  };

  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const available = nights > 0 ? isRoomAvailable(room.id, draft.checkIn, draft.checkOut) : true;
  const issue = stayIssue({ room, ...draft, available });
  const pricing = calcPricing(room, nights);

  const handleContinue = () => {
    const next = {};
    if (issue) next.stay = issue;
    if (!draft.fullName.trim()) next.fullName = "Enter the guest's full name.";
    if (!EMAIL_PATTERN.test(draft.email)) next.email = "Enter a valid email address.";
    if (draft.phone.trim().replace(/\D/g, "").length < 7) next.phone = "Enter a valid phone number.";
    setErrors(next);
    if (Object.keys(next).length === 0) navigate("/booking/review");
  };

  const stayError = errors.stay || issue;

  return (
    <PageShell stepper={<Stepper current={0} />}>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest">Complete Your Booking</h1>
        <p className="text-sm text-ink/60 mt-1 mb-8">
          Please review your selected room and provide guest information to continue your stay booking.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          <div>
            <div className="bg-white rounded-xl p-4 flex gap-4 items-center mb-6">
              <img src={room.image} alt={room.name} className="h-20 w-28 object-cover rounded-lg bg-sand" />
              <div>
                <span className="inline-block text-[10px] uppercase tracking-wide bg-mint text-forest px-2 py-1 rounded mb-1">
                  Selected Accommodation
                </span>
                <h2 className="font-serif text-lg text-forest">{room.name}</h2>
                <p className="text-sm text-ink/60">
                  ${formatMoney(room.price)} / night (excluding taxes) · {room.minNights}-night minimum
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              <label className="block">
                <span className="block text-xs text-ink/60 mb-2">Check-in Date</span>
                <div className="relative">
                  <input
                    type="date"
                    min={todayISO()}
                    value={draft.checkIn}
                    onChange={(e) => set("checkIn", e.target.value)}
                    className="w-full bg-white border border-forest/30 focus:border-forest rounded-lg px-3 py-3 text-sm outline-none"
                  />
                  <Calendar
                    size={16}
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
                    className={`w-full bg-white border rounded-lg px-3 py-3 text-sm outline-none ${
                      stayError ? "border-red-300" : "border-black/10 focus:border-forest"
                    }`}
                  />
                  <Calendar
                    size={16}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest pointer-events-none"
                  />
                </div>
              </label>
            </div>

            {stayError ? (
              <div
                role="alert"
                className="flex items-center gap-2 bg-[#FBE9E4] text-[#C9552F] text-xs rounded-lg px-4 py-3 mb-6"
              >
                <AlertTriangle size={14} /> {stayError}
              </div>
            ) : (
              <div className="mb-6" />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <GuestStepper
                tone="white"
                label="Adults (Age 13+)"
                value={draft.adults}
                min={1}
                max={Math.max(1, room.maxGuests - draft.children)}
                onChange={(v) => set("adults", v)}
              />
              <GuestStepper
                tone="white"
                label="Children (Age 2-12)"
                value={draft.children}
                min={0}
                max={Math.max(0, room.maxGuests - draft.adults)}
                onChange={(v) => set("children", v)}
                hint="no charge"
              />
            </div>

            <hr className="border-black/5 mb-6" />

            <h2 className="font-serif text-lg text-forest mb-4">Primary Guest Information</h2>
            <label className="block mb-4">
              <span className="block text-xs text-ink/60 mb-2">Full Name</span>
              <input
                type="text"
                value={draft.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="Sarah Jenkins"
                className={`w-full bg-white rounded-lg px-3 py-3 text-sm outline-none border ${
                  errors.fullName ? "border-red-300" : "border-transparent focus:border-forest/30"
                }`}
              />
              {errors.fullName && <span className="text-xs text-red-500 mt-1 block">{errors.fullName}</span>}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <label className="block">
                <span className="block text-xs text-ink/60 mb-2">Email Address</span>
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="sarah.jenkins@example.com"
                  className={`w-full bg-white rounded-lg px-3 py-3 text-sm outline-none border ${
                    errors.email ? "border-red-300" : "border-transparent focus:border-forest/30"
                  }`}
                />
                {errors.email && <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>}
              </label>
              <label className="block">
                <span className="block text-xs text-ink/60 mb-2">Phone Number</span>
                <input
                  type="tel"
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className={`w-full bg-white rounded-lg px-3 py-3 text-sm outline-none border ${
                    errors.phone ? "border-red-300" : "border-transparent focus:border-forest/30"
                  }`}
                />
                {errors.phone && <span className="text-xs text-red-500 mt-1 block">{errors.phone}</span>}
              </label>
            </div>

            <label className="block mb-8">
              <span className="block text-xs text-ink/60 mb-2">Special Requests (Optional)</span>
              <textarea
                value={draft.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
                placeholder="e.g., Feather-free pillow, early check-in request, high floor preference..."
                rows={4}
                className="w-full bg-white rounded-lg px-3 py-3 text-sm outline-none border border-transparent focus:border-forest/30 resize-none"
              />
            </label>

            <div className="flex justify-end">
              <button
                onClick={handleContinue}
                className="flex items-center gap-2 bg-coral hover:bg-coral-dark transition-colors text-white text-sm font-medium rounded-full px-6 py-3"
              >
                Continue to Review <ArrowRight size={15} />
              </button>
            </div>
          </div>

          <PriceSummary room={room} draft={draft} nights={nights} pricing={pricing} />
        </div>
      </main>
    </PageShell>
  );
}
