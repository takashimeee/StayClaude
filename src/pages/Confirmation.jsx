import { useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Check, Copy, CreditCard, Download, Lock, MessageCircle, Clock, UtensilsCrossed } from "lucide-react";
import PageShell from "../components/PageShell";
import Stepper from "../components/Stepper";
import { useApp } from "../context/AppContext";
import { downloadReceipt, formatDate, formatMoney, guestsLabel } from "../lib/utils";

const NEXT_STEPS = [
  { icon: Clock, title: "Check-in starts at 3:00 PM", text: "Our reception is open 24/7 if your arrival time changes." },
  {
    icon: MessageCircle,
    title: "Need help? Contact resort",
    text: "Our concierge is available at +1 (800) 456-EASE for any arrangements.",
  },
  {
    icon: UtensilsCrossed,
    title: "Browse our amenities & dining",
    text: "Start planning your stay: dine-ins, spa treatments, and more.",
  },
];

export default function Confirmation() {
  const { id } = useParams();
  const { myReservations } = useApp();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const booking = myReservations.find((r) => r.id === id);
  if (!booking) return <Navigate to="/my-reservations" replace />;

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(booking.ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setMessage("Couldn't copy — please select the reference manually.");
    }
  };

  const handleDownload = () => {
    downloadReceipt(booking);
    setMessage("Receipt downloaded.");
  };

  return (
    <PageShell stepper={<Stepper current={4} />}>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full border-2 border-forest text-forest flex items-center justify-center mx-auto mb-5">
            <Check size={30} />
          </div>
          <h1 className="font-serif text-3xl text-forest mb-2">Booking Confirmed!</h1>
          <p className="text-sm text-ink/60">
            A confirmation email and receipt have been sent to {booking.guest.email}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm max-w-xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-sand">
            <div>
              <span className="text-[11px] tracking-wide text-ink/50">BOOKING CONFIRMATION</span>
              <div className="font-bold text-sm flex items-center gap-2">
                REF: {booking.ref}
                <button onClick={copyRef} aria-label="Copy reference" className="text-ink/50 hover:text-forest">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <span className="flex items-center gap-1 bg-mint text-forest text-[11px] font-semibold px-3 py-1 rounded-full">
              <Lock size={11} /> PAID &amp; SECURED
            </span>
          </div>

          <div className="flex gap-4 p-5">
            <img
              src={booking.image}
              alt={booking.roomName}
              className="w-28 h-24 rounded-lg object-cover shrink-0 bg-sand"
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1">
              <div className="col-span-2 font-semibold">{booking.roomName}</div>
              <div>
                <span className="block text-[11px] text-ink/50">CHECK IN</span>
                {formatDate(booking.checkIn)}
              </div>
              <div>
                <span className="block text-[11px] text-ink/50">CHECK OUT</span>
                {formatDate(booking.checkOut)}
              </div>
              <div>
                <span className="block text-[11px] text-ink/50">DURATION</span>
                {booking.nights} Night{booking.nights !== 1 ? "s" : ""}
              </div>
              <div>
                <span className="block text-[11px] text-ink/50">GUESTS</span>
                {guestsLabel(booking.adults, booking.children)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-t border-sand bg-[#FAF7F0]">
            <div>
              <span className="text-xs text-ink/50">Total Paid (Full Payment)</span>
              <div className="text-xl font-bold text-forest">${formatMoney(booking.total)}</div>
            </div>
            <span className="flex items-center gap-1 text-xs text-ink/60">
              <CreditCard size={16} /> {booking.paymentMethod}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={() => navigate("/my-reservations")}
            className="bg-coral hover:bg-coral-dark transition-colors text-white text-sm font-semibold rounded-full px-6 py-3"
          >
            View My Reservation →
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 border border-ink text-ink hover:bg-black/5 transition-colors text-sm font-semibold rounded-full px-6 py-3"
          >
            <Download size={15} /> Download Receipt
          </button>
        </div>
        {message && (
          <p className="text-center text-sm text-forest mt-4" role="status">
            {message}
          </p>
        )}

        <section className="mt-14 text-center">
          <h2 className="font-serif text-2xl text-forest mb-1">What's Next?</h2>
          <p className="text-sm text-ink/60 mb-8">A quick guide to ensure your journey is smooth and memorable.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
            {NEXT_STEPS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-white rounded-xl p-5 shadow-sm">
                <Icon size={20} className="text-forest mb-3" />
                <h3 className="text-sm font-semibold mb-1">{title}</h3>
                <p className="text-xs text-ink/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <Link to="/home#amenities" className="inline-block mt-8 text-sm text-coral hover:underline">
            Explore our amenities →
          </Link>
        </section>
      </main>
    </PageShell>
  );
}
