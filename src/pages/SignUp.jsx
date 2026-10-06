import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { EMAIL_PATTERN } from "../lib/utils";
import GoogleButton from "../components/GoogleButton";
import { authStyles as styles, divider, dividerLine } from "./authStyles";

export default function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useApp();
  const from = location.state?.from || "/home";

  const [form, setForm] = useState({ fullName: "", email: "", password: "", agreed: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setFormError("");
  };

  const validate = () => {
    const found = {};
    if (!form.fullName.trim()) found.fullName = "Enter your full name.";
    if (!EMAIL_PATTERN.test(form.email)) found.email = "Enter a valid email address.";
    if (form.password.length < 8) found.password = "Use at least 8 characters.";
    if (!form.agreed) found.agreed = "Agree to the Terms of Service and Privacy Policy to continue.";
    return found;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setLoading(true);
    const result = signup(form);
    setLoading(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <Link to="/home" style={styles.brand}>
          StayEase
        </Link>
        <h1 style={styles.title}>Create an account</h1>
        <p style={styles.subtitle}>Join us to discover unforgettable getaways</p>

        <form style={styles.form} onSubmit={handleSubmit} noValidate>
          {formError && (
            <div style={styles.banner} role="alert">
              {formError}
            </div>
          )}

          <div style={styles.fieldGroup}>
            <label htmlFor="fullName" style={styles.label}>
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.fullName && <small style={styles.error}>{errors.fullName}</small>}
          </div>

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
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
            />
            {errors.password && <small style={styles.error}>{errors.password}</small>}
          </div>

          <div>
            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                name="agreed"
                checked={form.agreed}
                onChange={handleChange}
                style={styles.checkbox}
              />
              <span>
                I agree to StayEase's{" "}
                <Link to="/terms" style={styles.link}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" style={styles.link}>
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreed && <small style={styles.error}>{errors.agreed}</small>}
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>

        </form>

        <div style={divider}>
          <span style={dividerLine} />
          <span>or</span>
          <span style={dividerLine} />
        </div>
        <GoogleButton onSuccess={() => navigate(from, { replace: true })} text="signup_with" />

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" state={{ from }} style={styles.link}>
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
