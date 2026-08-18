import { useState } from "react";
import RegistrationForm from "./components/RegistrationForm";
import CheckoutForm from "./components/CheckoutForm";

export default function App() {
  const [tab, setTab] = useState("register");

  return (
    <div className="app-shell">
      <div className="brand">Field &amp; Ledger</div>
      <h1>{tab === "register" ? "Create your account" : "Checkout"}</h1>
      <p className="subtitle">
        {tab === "register"
          ? "Register once, get a code, and we'll recognize you at checkout."
          : "We'll check if you're already registered as you type your email."}
      </p>

      <div className="nav-tabs">
        <button className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
          Register
        </button>
        <button className={tab === "checkout" ? "active" : ""} onClick={() => setTab("checkout")}>
          Checkout
        </button>
      </div>

      {tab === "register" ? <RegistrationForm /> : <CheckoutForm />}
    </div>
  );
}
