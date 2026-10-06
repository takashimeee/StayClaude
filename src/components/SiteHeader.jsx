import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, MapPin, Menu, User, UserRound, X, CalendarCheck } from "lucide-react";
import { useApp } from "../context/AppContext";

const LINKS = [
  { label: "Home", to: "/home", match: (p, h) => p === "/home" && !h },
  { label: "Rooms", to: "/rooms", match: (p) => p.startsWith("/rooms") || p.startsWith("/booking") },
  { label: "Amenities", to: "/home#amenities", match: (p, h) => p === "/home" && h === "#amenities" },
  { label: "My Reservations", to: "/my-reservations", match: (p) => p.startsWith("/my-reservations") },
  { label: "Contact", to: "/home#contact", match: (p, h) => p === "/home" && h === "#contact" },
];

export default function SiteHeader() {
  const { user, logout } = useApp();
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const initials = user?.fullName
    ?.split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    navigate("/home");
  };

  return (
    <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 relative">
      <Link to="/home" className="flex items-center gap-2 text-forest font-serif text-xl font-semibold">
        <MapPin size={20} />
        StayEase
      </Link>

      <nav
        className={`${
          menuOpen ? "flex" : "hidden"
        } md:flex absolute md:static top-full left-0 right-0 z-30 flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 bg-white md:bg-transparent px-6 py-4 md:p-0 border-b md:border-0 border-black/5 text-sm text-ink/80`}
      >
        {LINKS.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            onClick={() => setMenuOpen(false)}
            className={
              l.match(pathname, hash) ? "text-forest font-medium" : "hover:text-forest transition-colors"
            }
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <div className="relative">
          {user ? (
            <button
              onClick={() => setUserOpen((v) => !v)}
              aria-label="Account menu"
              className="h-9 w-9 rounded-full bg-sand flex items-center justify-center text-xs font-semibold text-forest"
            >
              {initials}
            </button>
          ) : (
            <Link
              to="/login"
              aria-label="Log in"
              className="h-9 w-9 rounded-full bg-sand flex items-center justify-center text-forest"
            >
              <User size={16} />
            </Link>
          )}

          {user && userOpen && (
            <div className="absolute right-0 top-11 z-40 w-56 bg-white rounded-xl shadow-lg border border-black/5 py-2 text-sm">
              <div className="px-4 py-2 border-b border-black/5">
                <p className="font-medium text-forest truncate">{user.fullName}</p>
                <p className="text-xs text-ink/50 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-mint"
              >
                <UserRound size={14} /> My Profile
              </Link>
              <Link
                to="/my-reservations"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-mint"
              >
                <CalendarCheck size={14} /> My Reservations
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-mint text-left text-[#C0554F]"
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>

        <button
          className="md:hidden h-9 w-9 flex items-center justify-center"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </div>
  );
}
