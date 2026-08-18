const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || "Request failed");
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  register: (payload) =>
    request("/register/", { method: "POST", body: JSON.stringify(payload) }),

  checkEmail: (email) =>
    request(`/check-email/?email=${encodeURIComponent(email)}`),

  verifyCode: (email, code) =>
    request("/verify-code/", { method: "POST", body: JSON.stringify({ email, code }) }),

  submitCheckout: (payload) =>
    request("/checkout/", { method: "POST", body: JSON.stringify(payload) }),
};
