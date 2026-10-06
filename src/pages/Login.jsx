import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { EMAIL_PATTERN } from "../lib/utils";
import GoogleButton from "../components/GoogleButton";
import { authStyles as styles, divider, dividerLine } from "./authStyles";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useApp();
  const from = location.state?.from || "/home";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = {};
    if (!EMAIL_PATTERN.test(form.email)) found.email = "Enter a valid email address.";
    if (!form.password) found.password = "Enter your password.";
    if (Object.keys(found).length) {
      setErrors(found);
      return;
    }
    const result = login(form.email, form.password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(from, { replace: true });
  };

  const fillDemo = () => setForm({ email: "sarah.jenkins@example.com", password: "password123" });

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <Link to="/home" style={styles.brand}>
          StayEase
        </Link>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Log in to manage your stays</p>

        <div style={styles.hint}>
          Demo account: <strong>sarah.jenkins@example.com</strong> / <strong>password123</strong>{" "}
          <button
            type="button"
            onClick={fillDemo}
            style={{ ...styles.link, background: "none", border: 0, cursor: "pointer", padding: 0 }}
          >
            Fill in
          </button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && (
            <div style={styles.banner} role="alert">
              {formError}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.email && <small style={styles.error}>{errors.email}</small>}
          </div>

          <div style={styles.fieldGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.password && <small style={styles.error}>{errors.password}</small>}
          </div>

          <button type="submit" style={styles.button}>
            Log in
          </button>
        </form>

        <div style={divider}>
          <span style={dividerLine} />
          <span>or</span>
          <span style={dividerLine} />
        </div>
        <GoogleButton onSuccess={() => navigate(from, { replace: true })} text="signin_with" />

        <p style={styles.footer}>
          New to StayEase?{" "}
          <Link to="/signup" state={{ from }} style={styles.link}>
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
