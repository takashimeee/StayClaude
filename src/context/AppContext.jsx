import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ROOMS, findRoom } from "../data/rooms";
import {
  addDays,
  calcPricing,
  makeRef,
  nightsBetween,
  rangesOverlap,
  todayISO,
  uid,
} from "../lib/utils";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const PREFIX = "stayease:";

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function usePersisted(key, init) {
  const [value, setValue] = useState(() => load(key, typeof init === "function" ? init() : init));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }, [key, value]);
  return [value, setValue];
}

function makeReservation({
  room,
  checkIn,
  checkOut,
  adults,
  children,
  guest,
  paymentMethod,
  ownerEmail,
  cancelled = false,
}) {
  const nights = nightsBetween(checkIn, checkOut);
  const pricing = calcPricing(room, nights);
  return {
    id: uid(),
    ref: makeRef(),
    ownerEmail,
    roomId: room.id,
    roomName: room.name,
    image: room.image,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    ...pricing,
    guest,
    paymentMethod,
    cancelled,
    cancelledAt: cancelled ? new Date().toISOString() : null,
    refund: cancelled ? pricing.total : 0,
    createdAt: new Date().toISOString(),
  };
}

const DEMO_EMAIL = "sarah.jenkins@example.com";

function seedUsers() {
  return [
    {
      id: uid(),
      fullName: "Sarah Jenkins",
      email: DEMO_EMAIL,
      password: "password123",
      phone: "+1 (555) 234-5678",
      birthday: "1992-04-15",
      address: "43 Mango Avenue, Cebu City, Philippines",
      memberSince: "2023",
      paymentMethods: [{ id: uid(), label: "Mobile Wallet (GCash) •••• 1234", isDefault: true }],
      preferences: { email: true, sms: false, newsletter: true },
    },
  ];
}

function seedReservations() {
  const t = todayISO();
  const guest = {
    fullName: "Sarah Jenkins",
    email: DEMO_EMAIL,
    phone: "+1 (555) 234-5678",
    specialRequests: "",
  };
  const mk = (roomId, start, len, adults, children, extra = {}) =>
    makeReservation({
      room: findRoom(roomId),
      checkIn: addDays(t, start),
      checkOut: addDays(t, start + len),
      adults,
      children,
      guest,
      paymentMethod: "GCash",
      ownerEmail: DEMO_EMAIL,
      ...extra,
    });
  return [
    mk("eco-canopy-sanctuary", 20, 3, 2, 0),
    mk("garden-villa", 45, 3, 2, 0),
    mk("sunset-penthouse", 80, 4, 2, 2),
    mk("ocean-suite", -60, 3, 2, 0),
    mk("heritage-pool-estate", 120, 3, 4, 0, { cancelled: true }),
  ];
}

function defaultSearch() {
  const t = todayISO();
  return { checkIn: addDays(t, 14), checkOut: addDays(t, 17), guests: "2a" };
}

export function AppProvider({ children: kids }) {
  const [users, setUsers] = usePersisted("users", seedUsers);
  const [session, setSession] = usePersisted("session", null);
  const [reservations, setReservations] = usePersisted("reservations", seedReservations);
  const [draft, setDraft] = usePersisted("draft", null);
  const [search, setSearch] = usePersisted("search", defaultSearch);

  // Reset a stale search (dates already in the past)
  useEffect(() => {
    if (search.checkIn < todayISO()) setSearch(defaultSearch());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = useMemo(() => users.find((u) => u.email === session) ?? null, [users, session]);

  const myReservations = useMemo(
    () =>
      reservations
        .filter((r) => user && r.ownerEmail === user.email)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [reservations, user]
  );

  /* ---------- auth ---------- */
  const login = (email, password) => {
    const e = email.trim().toLowerCase();
    const found = users.find((u) => u.email === e);
    if (found && found.password === null) {
      return { ok: false, error: "This account uses Google. Please continue with Google." };
    }
    if (!found || found.password !== password) {
      return { ok: false, error: "Incorrect email or password." };
    }
    setSession(found.email);
    return { ok: true };
  };

  const signup = ({ fullName, email, password }) => {
    const e = email.trim().toLowerCase();
    if (users.some((u) => u.email === e)) {
      return { ok: false, error: "An account with this email already exists." };
    }
    const created = {
      id: uid(),
      fullName: fullName.trim(),
      email: e,
      password,
      phone: "",
      birthday: "",
      address: "",
      memberSince: String(new Date().getFullYear()),
      paymentMethods: [],
      preferences: { email: true, sms: false, newsletter: true },
    };
    setUsers((prev) => [...prev, created]);
    setSession(e);
    return { ok: true };
  };

  // Sign in (or auto-create an account) from a verified Google profile.
  const loginWithGoogle = ({ email, name }) => {
    const e = email.trim().toLowerCase();
    if (!users.some((u) => u.email === e)) {
      const created = {
        id: uid(),
        fullName: name.trim(),
        email: e,
        password: null, // Google accounts have no local password
        phone: "",
        birthday: "",
        address: "",
        memberSince: String(new Date().getFullYear()),
        paymentMethods: [],
        preferences: { email: true, sms: false, newsletter: true },
        provider: "google",
      };
      setUsers((prev) => [...prev, created]);
    }
    setSession(e);
    return { ok: true };
  };

  const logout = () => {
    setSession(null);
    setDraft(null);
  };

  const updateProfile = (patch) => {
    if (!user) return { ok: false, error: "Not signed in." };
    const email = patch.email ? patch.email.trim().toLowerCase() : user.email;
    if (email !== user.email && users.some((u) => u.email === email)) {
      return { ok: false, error: "That email is already in use." };
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...patch, email } : u)));
    if (email !== user.email) {
      setReservations((prev) =>
        prev.map((r) => (r.ownerEmail === user.email ? { ...r, ownerEmail: email } : r))
      );
      setSession(email);
    }
    return { ok: true };
  };

  const changePassword = (current, next) => {
    if (!user || user.password !== current) {
      return { ok: false, error: "Current password is incorrect." };
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, password: next } : u)));
    return { ok: true };
  };

  /* ---------- availability ---------- */
  const isRoomAvailable = useCallback(
    (roomId, checkIn, checkOut, excludeId) =>
      !reservations.some(
        (r) =>
          r.roomId === roomId &&
          r.id !== excludeId &&
          !r.cancelled &&
          rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
      ),
    [reservations]
  );

  /* ---------- booking draft ---------- */
  const startDraft = (roomId, { checkIn, checkOut, adults, children }) => {
    setDraft({
      roomId,
      checkIn,
      checkOut,
      adults,
      children,
      fullName: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      specialRequests: "",
    });
  };
  const clearDraft = () => setDraft(null);

  /* ---------- reservations ---------- */
  const addReservation = ({ roomId, checkIn, checkOut, adults, children, guest, paymentMethod }) => {
    const room = findRoom(roomId);
    if (!room || !user) return { ok: false, error: "Something went wrong. Please start again." };
    if (!isRoomAvailable(roomId, checkIn, checkOut)) {
      return { ok: false, error: "This room was just booked for those dates. Please pick new dates." };
    }
    const reservation = makeReservation({
      room,
      checkIn,
      checkOut,
      adults,
      children,
      guest,
      paymentMethod,
      ownerEmail: user.email,
    });
    setReservations((prev) => [...prev, reservation]);
    return { ok: true, reservation };
  };

  const modifyReservation = (id, { checkIn, checkOut, adults, children }) => {
    const current = reservations.find((r) => r.id === id);
    if (!current) return { ok: false, error: "Reservation not found." };
    const room = findRoom(current.roomId);
    const available = isRoomAvailable(room.id, checkIn, checkOut, id);
    const nights = nightsBetween(checkIn, checkOut);
    if (nights < room.minNights) {
      return { ok: false, error: `Minimum stay is ${room.minNights} night${room.minNights > 1 ? "s" : ""}.` };
    }
    if (adults + children > room.maxGuests) {
      return { ok: false, error: `This room fits up to ${room.maxGuests} guests.` };
    }
    if (!available) return { ok: false, error: "This room is booked for those dates." };
    const pricing = calcPricing(room, nights);
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checkIn, checkOut, nights, adults, children, ...pricing } : r))
    );
    return { ok: true, oldTotal: current.total, newTotal: pricing.total };
  };

  const cancelReservation = (id, refund) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, cancelled: true, cancelledAt: new Date().toISOString(), refund } : r
      )
    );
  };

  const value = {
    user,
    login,
    signup,
    loginWithGoogle,
    logout,
    updateProfile,
    changePassword,
    search,
    setSearch,
    draft,
    setDraft,
    startDraft,
    clearDraft,
    reservations,
    myReservations,
    addReservation,
    modifyReservation,
    cancelReservation,
    isRoomAvailable,
    rooms: ROOMS,
  };

  return <AppContext.Provider value={value}>{kids}</AppContext.Provider>;
}
