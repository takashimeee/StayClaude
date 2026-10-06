import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useApp } from "../context/AppContext";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Decode the payload of the Google ID token (a JWT).
function decodeJwt(token) {
  const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export default function GoogleButton({ onSuccess, text = "continue_with" }) {
  const { loginWithGoogle } = useApp();
  const [error, setError] = useState("");

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div
        style={{
          background: "#fff8e6",
          color: "#7a5b00",
          borderRadius: 10,
          padding: "0.7rem 0.9rem",
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}
      >
        Google login isn't set up yet. Add <code>VITE_GOOGLE_CLIENT_ID=your-client-id</code> to a{" "}
        <code>.env</code> file and restart the dev server.
      </div>
    );
  }

  const handleSuccess = (response) => {
    try {
      const profile = decodeJwt(response.credential);
      if (!profile.email || profile.email_verified === false) {
        setError("Your Google email isn't verified.");
        return;
      }
      loginWithGoogle({ email: profile.email, name: profile.name || profile.email.split("@")[0] });
      onSuccess();
    } catch {
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => setError("Google sign-in failed. Please try again.")}
        text={text}
        shape="pill"
        width="320"
      />
      {error && (
        <small role="alert" style={{ color: "#b42318" }}>
          {error}
        </small>
      )}
    </div>
  );
}
