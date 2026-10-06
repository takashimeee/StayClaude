import { Link } from "react-router-dom";
import { Camera, MapPin, Play, Send } from "lucide-react";

const QUICK_LINKS = [
  { label: "Popular Rooms", to: "/home#popular" },
  { label: "All Rooms", to: "/rooms" },
  { label: "My Reservations", to: "/my-reservations" },
  { label: "My Profile", to: "/profile" },
  { label: "Amenities", to: "/home#amenities" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-forest text-mint mt-4" id="contact">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 font-serif text-lg mb-3">
            <MapPin size={18} /> StayEase
          </div>
          <p className="text-sm text-mint/70 leading-relaxed">
            Staying at a StayEase gateway is an invitation to discover beautiful tropical retreats and
            boutique spaces built with sustainable design principles.
          </p>
        </div>

        <div>
          <h4 className="font-medium mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm text-mint/70">
            {QUICK_LINKS.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-mint/70">
            <li>StayEase Getaways HQ</li>
            <li>100 Tropic Breeze Lane, Suite 8</li>
            <li>+1 (800) 456-EASE</li>
            <li>
              <a href="mailto:reservations@stayease.com" className="hover:text-white">
                reservations@stayease.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-3">Follow Our Escape</h4>
          <div className="flex gap-3">
            {[
              { Icon: Camera, label: "Instagram" },
              { Icon: MapPin, label: "Maps" },
              { Icon: Send, label: "Messages" },
              { Icon: Play, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-label={label}
                className="h-9 w-9 rounded-full border border-mint/30 flex items-center justify-center hover:bg-mint/10"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-mint/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-xs text-mint/50 gap-2">
          <span>© 2026 StayEase Getaways. All rights reserved.</span>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
