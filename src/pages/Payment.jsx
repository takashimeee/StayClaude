import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AlertCircle, CreditCard, Loader2, Lock, Wallet } from "lucide-react";
import PageShell from "../components/PageShell";
import Stepper from "../components/Stepper";
import PriceSummary from "../components/PriceSummary";
import { useApp } from "../context/AppContext";
import { findRoom } from "../data/rooms";
import { calcPricing, formatMoney, nightsBetween, stayIssue } from "../lib/utils";

const METHODS = [
  { id: "gcash", label: "GCash", detail: "Mobile wallet", icon: Wallet },
  { id: "maya", label: "Maya", detail: "Mobile wallet", icon: Wallet },
  { id: "card", label: "Credit / Debit Card", detail: "Visa, Mastercard, Amex", icon: CreditCard },
];

export default function Payment() {
  const { draft } = useApp();
  const room = findRoom(draft?.roomId);
  if (!draft || !room) return <Navigate to="/rooms" replace />;
  return <PaymentInner draft={draft} room={room} />;
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs text-ink/60 mb-1">{label}</span>
      {children}
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
    </label>
  );
}

const inputCls = "w-full bg-white border border-black/10 focus:border-forest rounded-lg px-3 py-3 text-sm outline-none";

function PaymentInner({ draft, room }) {
  const { user, addReservation, clearDraft, isRoomAvailable } = useApp();
  const navigate = useNavigate();

  const [methodId, setMethodId] = useState(
    user?.paymentMethods?.find((m) => m.isDefault)?.label.includes("Maya") ? "maya" : "gcash"
  );
  const [status, setStatus] = useState("idle"); // idle | redirecting | error
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({ mobile: "", cardNumber: "", cardName: "", expiry: "", cvc: "" });
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const method = METHODS.find((m) => m.id === methodId);
  const nights = nightsBetween(draft.checkIn, draft.checkOut);
  const available = nights > 0 ? isRoomAvailable(room.id, draft.checkIn, draft.checkOut) : true;
  const issue = stayIssue({ room, ...draft, available });
  const pricing = calcPricing(room, nights);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const found = {};
    if (methodId === "card") {
      const digits = form.cardNumber.replace(/\D/g, "");
      if (digits.length < 13 || digits.length > 19) found.cardNumber = "Enter a valid card number.";
      if (!form.cardName.trim()) found.cardName = "Enter the name on the card.";
      const m = form.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m) found.expiry = "Use MM/YY.";
      else {
        const month = Number(m[1]);
        const year = 2000 + Number(m[2]);
        const now = new Date();
        const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
        if (month < 1 || month > 12 || expired) found.expiry = "Card has expired or date is invalid.";
      }
      if (!/^\d{3,4}$/.test(form.cvc)) found.cvc = "3–4 digits.";
    } else {
      const digits = form.mobile.replace(/\D/g, "");
      const ok = /^(09\d{9}|639\d{9})$/.test(digits);
      if (!ok) found.mobile = "Enter a valid mobile number, e.g. 0917 123 4567.";
    }
    return found;
  };

  const handlePay = () => {
    if (issue) {
      setStatus("error");
      setErrorMsg(issue);
      return;
    }
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("redirecting");
    setErrorMsg("");
    // Simulated round trip to the payment provider
    timer.current = setTimeout(() => {
      const label =
        methodId === "card"
          ? `Card •••• ${form.cardNumber.replace(/\D/g, "").slice(-4)}`
          : method.label;
      const result = addReservation({
        roomId: room.id,
        checkIn: draft.checkIn,
        checkOut: draft.checkOut,
        adults: draft.adults,
        children: draft.children,
        guest: {
          fullName: draft.fullName,
          email: draft.email,
          phone: draft.phone,
          specialRequests: draft.specialRequests,
        },
        paymentMethod: label,
      });
      if (!result.ok) {
        setStatus("error");
        setErrorMsg(result.error);
        return;
      }
      navigate(`/booking/confirmation/${result.reservation.id}`, { replace: true });
      clearDraft();
    }, 1400);
  };

  const busy = status === "redirecting";

  return (
    <PageShell stepper={<Stepper current={2} />}>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest">Complete Your Payment</h1>
        <p className="text-sm text-ink/60 mt-1 mb-6">
          Secure your stay instantly using your mobile wallet or card. This is a demo — no real payment is taken.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
          <div>
            <div className="space-y-3 mb-4">
              {METHODS.map(({ id, label, detail, icon: Icon }) => {
                const selected = id === methodId;
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setMethodId(id);
                      setErrors({});
                      setStatus("idle");
                    }}
                    disabled={busy}
                    className={`w-full flex items-center gap-3 bg-white rounded-xl px-4 py-4 text-left border-2 transition-colors disabled:opacity-60 ${
                      selected ? "border-[#8FB9C7]" : "border-transparent"
                    }`}
                  >
                    <span className="h-9 w-9 rounded-full bg-forest text-white flex items-center justify-center shrink-0">
                      <Icon size={16} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-ink/50">{detail}</span>
                    </span>
                    <span
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                        selected ? "border-forest" : "border-ink/20"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-forest" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Method details */}
            <div className="bg-mint rounded-xl p-4 mb-4 space-y-3">
              {methodId === "card" ? (
                <>
                  <Field label="Card number" error={errors.cardNumber}>
                    <input
                      className={inputCls}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={form.cardNumber}
                      disabled={busy}
                      onChange={(e) => setField("cardNumber", e.target.value)}
                    />
                  </Field>
                  <Field label="Name on card" error={errors.cardName}>
                    <input
                      className={inputCls}
                      autoComplete="cc-name"
                      placeholder="Sarah Jenkins"
                      value={form.cardName}
                      disabled={busy}
                      onChange={(e) => setField("cardName", e.target.value)}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry (MM/YY)" error={errors.expiry}>
                      <input
                        className={inputCls}
                        autoComplete="cc-exp"
                        placeholder="08/29"
                        value={form.expiry}
                        disabled={busy}
                        onChange={(e) => setField("expiry", e.target.value)}
                      />
                    </Field>
                    <Field label="CVC" error={errors.cvc}>
                      <input
                        className={inputCls}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder="123"
                        value={form.cvc}
                        disabled={busy}
                        onChange={(e) => setField("cvc", e.target.value)}
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <Field label={`${method.label} mobile number`} error={errors.mobile}>
                  <input
                    className={inputCls}
                    type="tel"
                    autoComplete="tel"
                    placeholder="0917 123 4567"
                    value={form.mobile}
                    disabled={busy}
                    onChange={(e) => setField("mobile", e.target.value)}
                  />
                </Field>
              )}
            </div>

            <p className="flex items-center gap-2 text-xs text-ink/50 mb-4">
              <Lock size={12} /> Payments are securely processed via our PCI-compliant partner
            </p>

            <button
              onClick={handlePay}
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 bg-coral hover:bg-coral-dark disabled:opacity-70 transition-colors text-white text-sm font-medium rounded-full py-4"
            >
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Redirecting…
                </>
              ) : (
                <>
                  Pay with {method.label} · ${formatMoney(pricing.total)}
                </>
              )}
            </button>
            <p className="text-center text-xs text-ink/50 mt-2">
              {methodId === "card" ? "Your card will be charged securely" : `You'll be redirected to ${method.label} to complete payment`}
            </p>

            <hr className="border-black/5 my-6" />

            <p className="text-xs font-medium text-ink/50 uppercase tracking-wide mb-3">Payment status</p>

            {status === "idle" && (
              <div className="bg-white rounded-lg px-4 py-4 text-sm text-ink/50">
                Waiting for payment — enter your details and tap Pay above.
              </div>
            )}
            {busy && (
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-4 text-sm text-forest">
                <Loader2 size={16} className="animate-spin" />
                Processing with {method.label}…
              </div>
            )}
            {status === "error" && (
              <div
                role="alert"
                className="flex items-center justify-between gap-3 bg-[#FBE9E4] border border-coral/30 rounded-lg px-4 py-4 text-sm text-[#C9552F]"
              >
                <span className="flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {errorMsg || "Payment unsuccessful. Please try again or select another payment method."}
                </span>
                {issue ? (
                  <Link to="/booking/review" className="shrink-0 font-medium underline hover:no-underline">
                    Edit stay
                  </Link>
                ) : (
                  <button
                    onClick={() => setStatus("idle")}
                    className="shrink-0 font-medium underline hover:no-underline"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}

            <Link to="/booking/review" className="inline-block mt-6 text-sm text-forest hover:underline">
              ← Back to review
            </Link>
          </div>

          <PriceSummary room={room} draft={draft} nights={nights} pricing={pricing} note="SSL Encrypted" />
        </div>
      </main>
    </PageShell>
  );
}
