import { useState } from "react";
import { api } from "../api";

export default function RegistrationForm() {
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "" });
  const [code, setCode] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await api.register(form);
      setCode(res.login_code);
    } catch (err) {
      setError(err.data?.email?.[0] || err.message || "Registration failed.");
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
        <input id="reg-email" type="email" required value={form.email} onChange={update("email")} />
      </div>
      <div className="field">
        <label htmlFor="reg-first">First name</label>
        <input id="reg-first" type="text" required value={form.first_name} onChange={update("first_name")} />
      </div>
      <div className="field">
        <label htmlFor="reg-last">Last name</label>
        <input id="reg-last" type="text" required value={form.last_name} onChange={update("last_name")} />
      </div>
      {error && <div className="error-text">{error}</div>}
      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? "Registering…" : "Register"}
      </button>
    </form>
  );
}
