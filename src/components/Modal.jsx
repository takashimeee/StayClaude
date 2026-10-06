import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${wide ? "max-w-3xl" : "max-w-lg"} bg-white rounded-xl shadow-2xl p-6 text-ink`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="font-serif text-xl text-forest">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 shrink-0 rounded-full bg-mint flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
