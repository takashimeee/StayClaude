import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

export default function NotFound() {
  return (
    <PageShell>
      <main className="max-w-xl mx-auto px-6 py-20 text-center">
        <h1 className="font-serif text-4xl text-forest mb-2">Page not found</h1>
        <p className="text-sm text-ink/60 mb-6">The page you're looking for doesn't exist or has moved.</p>
        <Link to="/home" className="inline-block bg-coral hover:bg-coral-dark text-white text-sm rounded-full px-6 py-3">
          Back to home
        </Link>
      </main>
    </PageShell>
  );
}
