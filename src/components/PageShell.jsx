import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function PageShell({ stepper = null, children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink font-sans">
      <header className="bg-white border-b border-black/5 relative z-20">
        <SiteHeader />
        {stepper}
      </header>
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
