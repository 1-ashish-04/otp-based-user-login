import { useState } from "react";
import { api } from "../api";

export default function LoginModal({ email, firstNameHint, onSuccess, onSkip }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setChecking(true);
    try {
      const res = await api.verifyCode(email, code);
      if (res.success) {
        onSuccess({ first_name: res.first_name, last_name: res.last_name });
      }
    } catch (err) {
      setError(err.data?.detail || "That code doesn't match. Try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Welcome back{firstNameHint ? `, ${firstNameHint}` : ""}</h2>
        <p>We recognized {email}. Enter your 6-digit login code to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            className="code-input"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            autoFocus
          />
          {error && <div className="error-text">{error}</div>}
          <div className="modal-actions">
            <button className="btn" type="submit" disabled={checking || code.length !== 6}>
              {checking ? "Checking…" : "Log in"}
            </button>
            <button className="btn btn-ghost" type="button" onClick={onSkip}>
              Skip and continue as guest
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
