import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil } from "lucide-react";
import PageShell from "../components/PageShell";
import { useApp } from "../context/AppContext";
import { EMAIL_PATTERN, formatDate, formatMoney, formatShortRange, getStatus, uid } from "../lib/utils";

const SECTIONS = ["Personal Info", "Reservation History", "Payment Methods", "Preferences", "Security"];

const card = "bg-white rounded-xl p-6 shadow-sm";
const input = "w-full text-sm px-3 py-2 rounded-md border border-sand outline-none focus:border-forest";

export default function Profile() {
  const { user, logout } = useApp();
  const [section, setSection] = useState("Personal Info");
  const navigate = useNavigate();

  if (!user) return null; // RequireAuth guards this route

  return (
    <PageShell>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-serif text-3xl text-forest mb-6">My Profile</h1>

        <div className="flex flex-wrap lg:flex-nowrap gap-6 items-start">
          <aside className="w-full lg:w-60 shrink-0">
            <div className={`${card} text-center mb-4`}>
              <div className="h-[72px] w-[72px] rounded-full bg-cream flex items-center justify-center mx-auto mb-3 text-2xl font-serif text-forest">
                {user.fullName
                  .split(" ")
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="font-semibold text-[15px]">{user.fullName}</div>
              <div className="text-[11px] text-ink/60">Member since {user.memberSince}</div>
            </div>

            <nav className="bg-white rounded-xl overflow-hidden shadow-sm">
              {SECTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSection(s)}
                  aria-current={section === s ? "page" : undefined}
                  className={`w-full text-left px-5 py-3.5 text-sm border-l-[3px] ${
                    section === s
                      ? "font-semibold text-coral bg-[#FBEFE6] border-coral"
                      : "border-transparent hover:bg-cream"
                  }`}
                >
                  {s}
                </button>
              ))}
              <button
                onClick={() => {
                  logout();
                  navigate("/home");
                }}
                className="w-full text-left px-5 py-3.5 text-sm text-[#C0554F] border-l-[3px] border-transparent hover:bg-cream border-t border-sand"
              >
                Log out
              </button>
            </nav>
          </aside>

          <div className="flex-1 min-w-0 w-full">
            {section === "Personal Info" && <PersonalInfo />}
            {section === "Reservation History" && <History />}
            {section === "Payment Methods" && <PaymentMethods />}
            {section === "Preferences" && <Preferences />}
            {section === "Security" && <Security />}
          </div>
        </div>
      </main>
    </PageShell>
  );
}

function PersonalInfo() {
  const { user, updateProfile } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(user);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const fields = [
    { key: "fullName", label: "FULL NAME", type: "text" },
    { key: "email", label: "EMAIL ADDRESS", type: "email" },
    { key: "phone", label: "PHONE NUMBER", type: "tel" },
    { key: "birthday", label: "DATE OF BIRTH", type: "date" },
    { key: "address", label: "HOME ADDRESS", type: "text", full: true },
  ];

  const display = (key) => {
    if (key === "birthday") return user.birthday ? formatDate(user.birthday) : "—";
    return user[key] || "—";
  };

  const save = () => {
    const found = {};
    if (!draft.fullName.trim()) found.fullName = "Enter your full name.";
    if (!EMAIL_PATTERN.test(draft.email)) found.email = "Enter a valid email address.";
    setErrors(found);
    if (Object.keys(found).length) return;
    const result = updateProfile({
      fullName: draft.fullName.trim(),
      email: draft.email,
      phone: draft.phone,
      birthday: draft.birthday,
      address: draft.address,
    });
    if (!result.ok) {
      setErrors({ email: result.error });
      return;
    }
    setEditing(false);
    setMessage("Personal information saved.");
    setTimeout(() => setMessage(""), 2500);
  };

  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Personal Information</h2>
        {editing ? (
          <div className="flex gap-4">
            <button
              onClick={() => {
                setEditing(false);
                setDraft(user);
                setErrors({});
              }}
              className="text-[13px] text-ink/60"
            >
              Cancel
            </button>
            <button onClick={save} className="text-[13px] font-semibold text-coral">
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraft(user);
              setEditing(true);
            }}
            className="flex items-center gap-1 text-[13px] font-semibold text-coral"
          >
            <Pencil size={12} /> Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        {fields.map((f) => (
          <div key={f.key} className={f.full ? "sm:col-span-2" : ""}>
            <span className="block text-[11px] text-ink/60 mb-1">{f.label}</span>
            {editing ? (
              <>
                <input
                  className={input}
                  type={f.type}
                  value={draft[f.key] ?? ""}
                  onChange={(e) => {
                    setDraft({ ...draft, [f.key]: e.target.value });
                    setErrors({ ...errors, [f.key]: undefined });
                  }}
                />
                {errors[f.key] && <span className="text-xs text-red-500 mt-1 block">{errors[f.key]}</span>}
              </>
            ) : (
              <div className="text-sm break-words">{display(f.key)}</div>
            )}
          </div>
        ))}
      </div>
      {message && <p className="text-[13px] text-forest mt-4">{message}</p>}
    </div>
  );
}

function History() {
  const { myReservations } = useApp();
  const sorted = [...myReservations].sort((a, b) => b.checkIn.localeCompare(a.checkIn));
  return (
    <div className={card}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold">Reservation History</h2>
        <Link to="/my-reservations" className="text-[13px] font-semibold text-coral">
          Manage reservations →
        </Link>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-ink/60">
          No reservations yet.{" "}
          <Link to="/rooms" className="text-coral">
            Find a room
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-sand">
          {sorted.map((r) => {
            const status = getStatus(r);
            return (
              <li key={r.id} className="py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <div className="font-medium">{r.roomName}</div>
                  <div className="text-xs text-ink/60">
                    {r.ref} · {formatShortRange(r.checkIn, r.checkOut)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${formatMoney(r.total)}</div>
                  <div className="text-[10px] uppercase tracking-wide text-ink/50">{status}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PaymentMethods() {
  const { user, updateProfile } = useApp();
  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("GCash");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const methods = user.paymentMethods;

  const save = (list) => updateProfile({ paymentMethods: list });

  const remove = (id) => {
    const rest = methods.filter((m) => m.id !== id);
    if (rest.length && !rest.some((m) => m.isDefault)) rest[0] = { ...rest[0], isDefault: true };
    save(rest);
  };

  const makeDefault = (id) => save(methods.map((m) => ({ ...m, isDefault: m.id === id })));

  const add = () => {
    const digits = number.replace(/\D/g, "");
    const isCard = type === "Card";
    if (isCard ? digits.length < 13 || digits.length > 19 : digits.length < 10) {
      setError(isCard ? "Enter a valid card number." : "Enter a valid mobile number.");
      return;
    }
    const label = isCard
      ? `Card •••• ${digits.slice(-4)}`
      : `Mobile Wallet (${type}) •••• ${digits.slice(-4)}`;
    save([...methods, { id: uid(), label, isDefault: methods.length === 0 }]);
    setAdding(false);
    setNumber("");
    setError("");
  };

  return (
    <div className={card}>
      <h2 className="text-base font-semibold mb-5">Payment Methods</h2>

      {methods.length === 0 && <p className="text-sm text-ink/60 mb-4">No saved payment methods yet.</p>}

      {methods.map((m) => (
        <div
          key={m.id}
          className="flex flex-wrap items-center justify-between gap-2 border border-sand rounded-lg px-4 py-3 mb-3"
        >
          <div className="flex items-center gap-2.5">
            {m.isDefault && (
              <span className="text-[10px] font-bold bg-mint text-forest px-2 py-0.5 rounded-full">DEFAULT</span>
            )}
            <span className="text-sm">{m.label}</span>
          </div>
          <div className="flex gap-4 text-xs">
            {!m.isDefault && (
              <button onClick={() => makeDefault(m.id)} className="text-forest hover:underline">
                Make default
              </button>
            )}
            <button onClick={() => remove(m.id)} className="text-ink/60 hover:text-[#C0554F]">
              Remove
            </button>
          </div>
        </div>
      ))}

      {adding ? (
        <div className="border border-dashed border-forest rounded-lg p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
            <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
              <option>GCash</option>
              <option>Maya</option>
              <option>Card</option>
            </select>
            <input
              className={input}
              placeholder={type === "Card" ? "Card number" : "Mobile number, e.g. 0917 123 4567"}
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setError("");
              }}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3">
            <button onClick={add} className="text-sm bg-forest text-white rounded-full px-5 py-2">
              Add method
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setError("");
              }}
              className="text-sm text-ink/60"
            >
              Cancel
            </button>
          </div>
          <p className="text-[11px] text-ink/50">Only the last 4 digits are stored.</p>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full text-[13px] font-semibold text-forest border border-dashed border-forest rounded-lg px-4 py-2.5 hover:bg-mint"
        >
          + Add Payment Method
        </button>
      )}
    </div>
  );
}

function Toggle({ title, description, on, onToggle }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-sand last:border-0">
      <div>
        <div className="text-sm font-semibold mb-0.5">{title}</div>
        <div className="text-xs text-ink/60 max-w-sm">{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={title}
        onClick={onToggle}
        className={`relative h-[22px] w-10 rounded-full shrink-0 transition-colors ${on ? "bg-forest" : "bg-[#D9D2C4]"}`}
      >
        <span
          className={`absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white transition-all ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Preferences() {
  const { user, updateProfile } = useApp();
  const [prefs, setPrefs] = useState(user.preferences);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(() => setMessage(""), 2200);
    return () => clearTimeout(t);
  }, [message]);

  const flip = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const dirty = JSON.stringify(prefs) !== JSON.stringify(user.preferences);

  return (
    <div className={card}>
      <h2 className="text-base font-semibold mb-3">Preferences</h2>
      <Toggle
        title="Email Notifications"
        description="Reservation offers, booking updates, and loyalty program updates."
        on={prefs.email}
        onToggle={() => flip("email")}
      />
      <Toggle
        title="SMS/Text Reminders"
        description="Get text messages for check-in reminders and time-sensitive updates."
        on={prefs.sms}
        onToggle={() => flip("sms")}
      />
      <Toggle
        title="Newsletter Subscription"
        description="Receive our monthly digest covering new packages and travel guides."
        on={prefs.newsletter}
        onToggle={() => flip("newsletter")}
      />
      <div className="flex items-center justify-end gap-4 mt-5">
        {message && <span className="text-[13px] text-forest">{message}</span>}
        <button
          onClick={() => {
            updateProfile({ preferences: prefs });
            setMessage("Changes saved!");
          }}
          disabled={!dirty}
          className="bg-coral hover:bg-coral-dark disabled:opacity-50 text-white text-sm font-semibold rounded-full px-6 py-3"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function Security() {
  const { changePassword } = useApp();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError("");
    setMessage("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (form.next.length < 8) return setError("New password must be at least 8 characters.");
    if (form.next !== form.confirm) return setError("New passwords don't match.");
    const result = changePassword(form.current, form.next);
    if (!result.ok) return setError(result.error);
    setForm({ current: "", next: "", confirm: "" });
    setMessage("Password updated.");
    return undefined;
  };

  return (
    <form onSubmit={submit} className={card}>
      <h2 className="text-base font-semibold mb-5">Security</h2>
      <div className="space-y-4 max-w-sm">
        <label className="block">
          <span className="block text-[11px] text-ink/60 mb-1">CURRENT PASSWORD</span>
          <input
            className={input}
            type="password"
            autoComplete="current-password"
            value={form.current}
            onChange={(e) => set("current", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink/60 mb-1">NEW PASSWORD</span>
          <input
            className={input}
            type="password"
            autoComplete="new-password"
            value={form.next}
            onChange={(e) => set("next", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="block text-[11px] text-ink/60 mb-1">CONFIRM NEW PASSWORD</span>
          <input
            className={input}
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-red-500">
            {error}
          </p>
        )}
        {message && <p className="text-[13px] text-forest">{message}</p>}
        <button
          type="submit"
          className="bg-forest hover:bg-forest-dark text-white text-sm font-semibold rounded-full px-6 py-3"
        >
          Update password
        </button>
      </div>
    </form>
  );
}
