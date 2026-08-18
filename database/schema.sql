-- Schema for OTP-based User Login / Checkout demo
-- Mirrors Django models in backend/accounts/models.py
-- Run this on a fresh Postgres/Supabase database, OR just let
-- `python manage.py migrate` create it for you automatically.

CREATE TABLE IF NOT EXISTS accounts_registereduser (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    login_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts_checkoutsubmission (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(254) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    shipping_address TEXT NOT NULL,
    was_logged_in BOOLEAN NOT NULL DEFAULT FALSE,
    matched_user_id BIGINT NULL REFERENCES accounts_registereduser(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkout_email ON accounts_checkoutsubmission(email);
CREATE INDEX IF NOT EXISTS idx_checkout_matched_user ON accounts_checkoutsubmission(matched_user_id);
