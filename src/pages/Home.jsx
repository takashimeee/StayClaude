import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Award,
  BedDouble,
  Calendar,
  ChevronDown,
  Coffee,
  Droplets,
  Heart,
  Navigation,
  User,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { GUEST_OPTIONS, HERO_IMAGE, ROOMS, ROOM_STYLES, getGuestOption } from "../data/rooms";
import {
  addDays,
  calcPricing,
  formatDate,
  formatMoney,
  nightsBetween,
  stayIssue,
  todayISO,
} from "../lib/utils";
import "./Home.css";

const AMENITIES = [
  { label: "Ocean Pool", icon: Droplets },
  { label: "Forest Spa", icon: Heart },
  { label: "Boutique Bistro", icon: Coffee },
  { label: "Symmetrical WiFi", icon: Wifi },
  { label: "Private Parking", icon: Navigation },
  { label: "Artisanal Breakfast", icon: Award },
];

const QUICK_LINKS = [
  { label: "Popular Rooms", to: "/home#popular" },
  { label: "All Rooms", to: "/rooms" },
  { label: "My Reservations", to: "/my-reservations" },
  { label: "My Profile", to: "/profile" },
  { label: "Amenities", to: "/home#amenities" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" />
      </>
    ),
  },
  {
    label: "Facebook",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
  { label: "X", icon: <path d="M4 4l16 16M20 4L4 20" /> },
  {
    label: "YouTube",
    icon: (
      <>
        <rect x="2" y="5" width="20" height="14" rx="4" />
        <path d="M10 9l5 3-5 3z" />
      </>
    ),
  },
];

function PinMark({ size = 22, pin = "#0f5e4d", letter = "#fff" }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 48 60" aria-hidden="true">
      <path d="M24 2a20 20 0 0 0-20 20c0 10 20 36 20 36s20-26 20-36A20 20 0 0 0 24 2z" fill={pin} />
      <text
        x="24"
        y="32"
        textAnchor="middle"
        fontFamily="Fraunces, Georgia, serif"
        fontWeight="700"
        fontSize="26"
        fill={letter}
      >
        S
      </text>
      <circle cx="37" cy="10" r="3.5" fill="#ff8a5b" />
    </svg>
  );
}

function RoomImage({ src, alt, children }) {
  return (
    <div className="home-card__media">
      {src && <img src={src} alt={alt} loading="lazy" />}
      {children}
    </div>
  );
}

function Navbar() {
  const { user } = useApp();
  return (
    <header className="home-nav">
      <div className="home-container home-nav__inner">
        <Link to="/home" className="home-brand">
          <PinMark />
          StayEase
        </Link>

        <nav aria-label="Main">
          <ul className="home-nav__links">
            <li>
              <Link to="/home" className="home-nav__link home-nav__link--active" aria-current="page">
                Home
              </Link>
            </li>
            <li>
              <Link to="/rooms" className="home-nav__link">
                Rooms
              </Link>
            </li>
            <li>
              <a href="#amenities" className="home-nav__link">
                Amenities
              </a>
            </li>
            <li>
              <Link to="/my-reservations" className="home-nav__link">
                My Reservations
              </Link>
            </li>
            <li>
              <a href="#contact" className="home-nav__link">
                Contact
              </a>
            </li>
          </ul>
        </nav>

        <Link
          to={user ? "/profile" : "/login"}
          className="home-nav__avatar"
          aria-label={user ? "Your profile" : "Log in"}
        >
          <User size={16} aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}

function SearchBar() {
  const { search, setSearch } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearch((prev) => {
      const next = { ...prev, [name]: value };
      // Check-out can't be before check-in
      if (next.checkIn && next.checkOut && next.checkOut <= next.checkIn && name === "checkIn") {
        next.checkOut = addDays(next.checkIn, 1);
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/rooms");
  };

  const today = todayISO();

  return (
    <form className="home-search" onSubmit={handleSubmit}>
      <label className="home-search__field">
        <span className="home-search__label">Check in</span>
        <span className="home-search__control">
          <Calendar size={14} aria-hidden="true" />
          <input
            type="date"
            name="checkIn"
            min={today}
            value={search.checkIn}
            onChange={handleChange}
            required
          />
        </span>
      </label>

      <label className="home-search__field">
        <span className="home-search__label">Check out</span>
        <span className="home-search__control">
          <Calendar size={14} aria-hidden="true" />
          <input
            type="date"
            name="checkOut"
            min={search.checkIn}
            value={search.checkOut}
            onChange={handleChange}
            required
          />
        </span>
      </label>

      <label className="home-search__field">
        <span className="home-search__label">Guests</span>
        <span className="home-search__control">
          <Users size={14} aria-hidden="true" />
          <select name="guests" value={search.guests} onChange={handleChange}>
            {GUEST_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="home-search__chevron" size={14} aria-hidden="true" />
        </span>
      </label>

      <button type="submit" className="home-btn home-btn--coral">
        Search
      </button>
    </form>
  );
}

function PopularCard({ room }) {
  return (
    <article className="home-card">
      <RoomImage src={room.image} alt={room.name} />
      <div className="home-card__body">
        <p className="home-card__resort">{room.resort}</p>
        <h3 className="home-card__title">{room.name}</h3>
        <ul className="home-chips">
          {room.chips.map((amenity) => (
            <li key={amenity}>{amenity}</li>
          ))}
        </ul>
        <div className="home-card__footer">
          <p className="home-price">
            ${room.price}
            <span> / night</span>
          </p>
          <Link to={`/rooms/${room.id}`} className="home-btn home-btn--outline">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

function AvailableCard({ room, onBookNow }) {
  return (
    <article className="home-card">
      <RoomImage src={room.image} alt={room.name}>
        <span className="home-badge">Available</span>
      </RoomImage>
      <div className="home-card__body">
        <h3 className="home-card__title">{room.name}</h3>
        <p className="home-card__meta">
          <span>
            <BedDouble size={13} aria-hidden="true" />
            {room.beds}
          </span>
          <span>
            <Users size={13} aria-hidden="true" />
            Up to {room.maxGuests} Guests
          </span>
        </p>
        <div className="home-card__footer">
          <p className="home-price">
            ${room.price}
            <span> / night</span>
          </p>
          <button type="button" className="home-btn home-btn--coral" onClick={onBookNow}>
            Book Now
          </button>
        </div>
      </div>
    </article>
  );
}

function BookingDetailsDialog({ room, search, onClose, onContinue }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const nights = nightsBetween(search.checkIn, search.checkOut);
  const pricing = calcPricing(room, nights);

  return (
    <div
      className="home-booking-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="home-booking-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-booking-title"
      >
        <div className="home-booking-dialog__header">
          <div>
            <p className="home-booking-dialog__eyebrow">Room details</p>
            <h2 className="home-booking-dialog__title" id="home-booking-title">
              {room.name}
            </h2>
          </div>
          <button
            type="button"
            className="home-booking-dialog__close"
            onClick={onClose}
            aria-label="Close room details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="home-booking-dialog__style">{room.style}</p>
        <dl className="home-booking-dialog__details">
          <div>
            <dt>Beds</dt>
            <dd>{room.beds}</dd>
          </div>
          <div>
            <dt>Guest capacity</dt>
            <dd>Up to {room.maxGuests} Guests</dd>
          </div>
          <div>
            <dt>Your dates</dt>
            <dd>
              {formatDate(search.checkIn, { month: "short", day: "numeric" })} –{" "}
              {formatDate(search.checkOut, { month: "short", day: "numeric", year: "numeric" })}{" "}
              <span>
                ({nights} night{nights !== 1 ? "s" : ""})
              </span>
            </dd>
          </div>
          <div>
            <dt>Price</dt>
            <dd>
              ${room.price} <span>/ night</span>
            </dd>
          </div>
          <div>
            <dt>Estimated total</dt>
            <dd>${formatMoney(pricing.total)}</dd>
          </div>
        </dl>

        <div className="home-booking-dialog__actions">
          <button type="button" className="home-booking-dialog__back" onClick={onClose}>
            Close
          </button>
          <Link to={`/rooms/${room.id}`} className="home-booking-dialog__back" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
            Full details
          </Link>
          <button type="button" className="home-btn home-btn--coral" onClick={onContinue}>
            Continue booking
          </button>
        </div>
      </section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="home-footer" id="contact">
      <div className="home-container home-footer__grid">
        <div>
          <p className="home-footer__brand">
            <PinMark size={18} pin="#fff" letter="#2c4a41" />
            StayEase
          </p>
          <p className="home-footer__text">
            Staying at a StayEase gateway is an invitation to discover beautiful tropical retreats
            and boutique spaces built with sustainable design principles.
          </p>
        </div>

        <div>
          <h2 className="home-footer__heading">Quick Links</h2>
          <ul className="home-footer__list">
            {QUICK_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="home-footer__heading">Contact</h2>
          <address className="home-footer__list">
            <span>StayEase Gateways HQ</span>
            <span>100 Tropic Breeze Lane, Suite B</span>
            <span>+1 (800) 555-EASE</span>
            <a href="mailto:reservations@stayease.com">reservations@stayease.com</a>
          </address>
        </div>

        <div>
          <h2 className="home-footer__heading">Follow Our Escape</h2>
          <div className="home-socials">
            {SOCIAL_LINKS.map(({ label, icon }) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                className="home-social"
                aria-label={label}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icon}
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  const { search, isRoomAvailable, startDraft } = useApp();
  const navigate = useNavigate();
  const [activeStyle, setActiveStyle] = useState("All Styles");
  const [selectedRoom, setSelectedRoom] = useState(null);

  const guest = getGuestOption(search.guests);

  // Only rooms that are free for the searched dates and fit the party
  const bookable = ROOMS.filter((room) => {
    const nights = nightsBetween(search.checkIn, search.checkOut);
    if (nights <= 0) return true;
    return !stayIssue({
      room,
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: guest.adults,
      children: guest.children,
      available: isRoomAvailable(room.id, search.checkIn, search.checkOut),
    });
  });

  const visibleRooms =
    activeStyle === "All Styles" ? bookable : bookable.filter((room) => room.style === activeStyle);

  const popularRooms = ROOMS.filter((r) => r.popular);

  const handleContinue = (room) => {
    startDraft(room.id, {
      checkIn: search.checkIn,
      checkOut: search.checkOut,
      adults: guest.adults,
      children: guest.children,
    });
    setSelectedRoom(null);
    navigate("/booking");
  };

  return (
    <div className="home">
      <Navbar />

      <main>
        <section
          className="home-hero"
          style={HERO_IMAGE ? { "--hero-image": `url(${HERO_IMAGE})` } : undefined}
        >
          <div className="home-container home-hero__inner">
            <div>
              <h1 className="home-hero__title">Your Escape Starts Here</h1>
              <p className="home-hero__sub">
                Discover handpicked resorts and boutique hotels carefully chosen for your perfect
                luxury getaway.
              </p>
            </div>
            <SearchBar />
          </div>
        </section>

        <section className="home-section home-section--mint" id="popular">
          <div className="home-container">
            <div className="home-section__head">
              <div>
                <h2 className="home-section__title">Popular Rooms</h2>
                <p className="home-section__sub">
                  Highly rated experiences and premium comfort recommended by our guest network.
                </p>
              </div>
            </div>
            <div className="home-grid">
              {popularRooms.map((room) => (
                <PopularCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        </section>

        <section className="home-section home-section--cream" id="rooms">
          <div className="home-container">
            <div className="home-section__head">
              <div>
                <h2 className="home-section__title">Available Rooms</h2>
                <p className="home-section__sub">
                  Choose from currently vacant luxury experiences matching your planned stay.
                </p>
              </div>
              <div className="home-filters" role="group" aria-label="Filter rooms by style">
                {ROOM_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className="home-pill"
                    aria-pressed={activeStyle === style}
                    onClick={() => setActiveStyle(style)}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {visibleRooms.length > 0 ? (
              <div className="home-grid">
                {visibleRooms.map((room) => (
                  <AvailableCard key={room.id} room={room} onBookNow={() => setSelectedRoom(room)} />
                ))}
              </div>
            ) : (
              <p className="home-empty">
                No rooms in this style are available for your dates. Try another style or change your
                search.
              </p>
            )}
            <p style={{ textAlign: "center", marginTop: 24 }}>
              <Link to="/rooms" className="home-btn home-btn--outline">
                Browse all rooms
              </Link>
            </p>
          </div>
        </section>

        <section className="home-section home-section--teal" id="amenities">
          <div className="home-container">
            <div className="home-section__head home-section__head--center">
              <div>
                <h2 className="home-section__title">Our Amenities</h2>
                <p className="home-section__sub">
                  Curated features of distinction designed to craft an environment of uninterrupted
                  leisure and ease.
                </p>
              </div>
            </div>
            <ul className="home-amenities">
              {AMENITIES.map(({ label, icon: Icon }) => (
                <li key={label} className="home-amenity">
                  <span className="home-amenity__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <Footer />
      {selectedRoom && (
        <BookingDetailsDialog
          room={selectedRoom}
          search={search}
          onClose={() => setSelectedRoom(null)}
          onContinue={() => handleContinue(selectedRoom)}
        />
      )}
    </div>
  );
}
