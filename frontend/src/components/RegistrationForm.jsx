import { useState } from "react";
import { api } from "../api";

// Same intent as backend's EmailField/NAME_RE — catch obvious mistakes before hitting the API.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const NAME_RE = /^[A-Za-z][A-Za-z\s'-]{0,149}$/;

export default function RegistrationForm() {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "" });
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const touch = (key) => () => setTouched((t) => ({ ...t, [key]: true }));

  const emailValid = EMAIL_RE.test(form.email);
  const firstNameValid = NAME_RE.test(form.first_name.trim());
  const lastNameValid = NAME_RE.test(form.last_name.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, first_name: true, last_name: true });
    if (!emailValid || !firstNameValid || !lastNameValid) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.register(form);
      setCode(res.login_code);
    } catch (err) {
      setError(
        err.data?.email?.[0] ||
        err.data?.first_name?.[0] ||
        err.data?.last_name?.[0] ||
        err.message ||
        "Registration failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (code) {
    return (
      <div>
        <p className="success-text">You're registered, {form.first_name}. Save this code — you'll need it to log in at checkout.</p>
        <div className="code-display">
          <div className="label">Your login code</div>
          <div className="code-digits">{code}</div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="reg-email">Email address</label>
        <input
          id="reg-email"
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          onBlur={touch("email")}
        />
        {touched.email && form.email && !emailValid && (
          <div className="email-status invalid">Enter a complete email address</div>
        )}
      </div>
      <div className="field">
        <label htmlFor="reg-first">First name</label>
        <input
          id="reg-first"
          type="text"
          required
          pattern={NAME_RE.source}
          title="Letters, spaces, hyphens, or apostrophes only"
          value={form.first_name}
          onChange={update("first_name")}
          onBlur={touch("first_name")}
        />
        {touched.first_name && form.first_name && !firstNameValid && (
          <div className="email-status invalid">Letters only, please</div>
        )}
      </div>
      <div className="field">
        <label htmlFor="reg-last">Last name</label>
        <input
          id="reg-last"
          type="text"
          required
          pattern={NAME_RE.source}
          title="Letters, spaces, hyphens, or apostrophes only"
          value={form.last_name}
          onChange={update("last_name")}
          onBlur={touch("last_name")}
        />
        {touched.last_name && form.last_name && !lastNameValid && (
          <div className="email-status invalid">Letters only, please</div>
        )}
      </div>
      {error && <div className="error-text">{error}</div>}
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Registering…" : "Register"}
      </button>
    </form>
  );
}