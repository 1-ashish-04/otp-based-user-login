import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import LoginModal from "./LoginModal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutForm() {
  const [form, setForm] = useState({ email: "", phone_number: "", shipping_address: "" });
  const [emailStatus, setEmailStatus] = useState(null); // null | 'checking' | 'valid' | 'invalid'
  const [recognized, setRecognized] = useState(null); // { first_name } | null
  const [showModal, setShowModal] = useState(false);
  const [modalDismissedFor, setModalDismissedFor] = useState(""); // email the user skipped login for
  const [loggedInUser, setLoggedInUser] = useState(null); // { first_name, last_name }
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // Real-time email validation + background recognition check (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    setRecognized(null);

    if (loggedInUser) return; // already logged in, no need to re-check

    if (!form.email) {
      setEmailStatus(null);
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setEmailStatus("invalid");
      return;
    }
    setEmailStatus("valid");

    const requestId = ++requestIdRef.current;
    const emailBeingChecked = form.email.trim().toLowerCase();

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkEmail(emailBeingChecked);
        if (requestId !== requestIdRef.current) return;

        if (res.registered && emailBeingChecked !== modalDismissedFor) {
          setRecognized(res);
          setShowModal(true);
        }
      } catch {
        // Recognition is intentionally non-blocking. Checkout can continue.
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.email]);

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    setShowModal(false);
  };

  const handleSkip = () => {
    setModalDismissedFor(form.email);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.submitCheckout({ ...form, was_logged_in: !!loggedInUser });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Couldn't submit the form.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return <p className="success-text">Order recorded. Thanks{loggedInUser ? `, ${loggedInUser.first_name}` : ""}!</p>;
  }

  return (
    <div>
      {loggedInUser && (
        <div className="banner">
          Logged in as <strong>&nbsp;{loggedInUser.first_name} {loggedInUser.last_name}</strong>
        </div>
      )}

      {showModal && recognized && (
        <LoginModal
          email={form.email}
          firstNameHint={recognized.first_name}
          onSuccess={handleLoginSuccess}
          onSkip={handleSkip}
        />
      )}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="co-email">Email address</label>
          <input
            id="co-email"
            type="email"
            required
            value={form.email}
            onChange={update("email")}
            disabled={!!loggedInUser}
          />
          {emailStatus === "invalid" && form.email && (
            <div className="email-status invalid">Enter a complete email address</div>
          )}
          {emailStatus === "valid" && !loggedInUser && (
            <div className="email-status valid">Looks good{recognized === null ? " · checking…" : ""}</div>
          )}
        </div>
        <div className="field">
          <label htmlFor="co-phone">Phone number</label>
          <input id="co-phone" type="tel" required value={form.phone_number} onChange={update("phone_number")} />
        </div>
        <div className="field">
          <label htmlFor="co-address">Shipping address</label>
          <textarea id="co-address" required value={form.shipping_address} onChange={update("shipping_address")} />
        </div>
        {error && <div className="error-text">{error}</div>}
        <button className="btn" type="submit" disabled={submitting}>
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </div>
  );
}
