import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";

const CONTENT = {
  terms: {
    title: "Terms of Service",
    sections: [
      ["Bookings", "A reservation is confirmed once payment succeeds. You'll receive a reference number you can use to find it under My Reservations."],
      ["Cancellations", "Cancel at least 48 hours before check-in for a full refund. Later cancellations are charged one night plus applicable taxes."],
      ["Your account", "Keep your login details private. You are responsible for activity on your account."],
      ["Demo notice", "This is a demonstration app. No real payments are processed and data is stored only in your browser."],
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      ["What we store", "Your name, email, phone number and booking details, used only to manage your reservations."],
      ["Where it lives", "In this demo, everything is stored locally in your own browser (localStorage). Nothing is sent to a server."],
      ["Your choices", "Update your details or notification preferences any time from My Profile. Clearing your browser data removes everything."],
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = CONTENT[kind];
  return (
    <PageShell>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-serif text-3xl text-forest mb-6">{page.title}</h1>
        <div className="space-y-6">
          {page.sections.map(([heading, body]) => (
            <section key={heading} className="bg-white rounded-xl p-5">
              <h2 className="font-serif text-lg text-forest mb-1">{heading}</h2>
              <p className="text-sm text-ink/70 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
        <Link to="/home" className="inline-block mt-8 text-sm text-coral hover:underline">
          ← Back to home
        </Link>
      </main>
    </PageShell>
  );
}
