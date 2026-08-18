# LLM Development Prompt Log

This document records the prompts used with LLMs during development of the OTP Based User Login assignment.

The LLM was used as a development assistant for requirement analysis, implementation support, debugging, and review. Architecture, technology choices, UX decisions, validation rules, testing decisions, and final implementation choices were reviewed and determined by the developer.

---

## 1. Requirement Analysis

### Prompt

> Review the provided OTP Based User Login assignment carefully. Explain the functional requirements, expected user flows, required deliverables, technical constraints, and important acceptance criteria. Do not implement anything yet.

### Developer decision

Reviewed the assignment requirements and identified the two primary flows:

* Registration
* User recognition and OTP login during checkout

Also identified the requirement for separate frontend, API, and database layers.

---


## 2. OTP Generation

### Prompt

> Implement generation of a random six-digit numeric login code. The code must always contain exactly six digits, including possible leading zeroes.

### Developer decision

Used a six-character zero-padded numeric value so codes such as `004821` remain valid six-digit codes.

---

## 3. Registration UI

### Prompt

> Build the React registration form required by the assignment. It should collect email, first name, and last name, submit the data to the Django API, and display the generated login code after successful registration.

### Developer decision

Kept registration intentionally simple because the assignment does not require email delivery or SMS delivery of the code.

---

## 4. Checkout Recognition

### Prompt

> Implement the checkout form behavior where email is validated as the user types. Once the email is complete and valid, perform a background recognition request to the Django API without requiring the user to submit the checkout form.

### Developer decision

Added client-side email validation and a short debounce before the recognition request to avoid making an API request for every keystroke.

---

## 5. Logged-in Checkout State

### Prompt

> After successful OTP verification, update the checkout UI to represent the user as logged in and display their first and last name above the checkout form. The user should then be able to continue completing the checkout form.

### Developer decision

Kept the login state local to the checkout flow because the assignment only requires recognition during checkout and does not require a persistent account session.

---

## 6. Checkout Persistence

### Prompt

> Implement checkout submission so that it records the email, phone number, and shipping address in PostgreSQL. There should be no payment processing. If useful for verification, record whether the checkout was completed after OTP login.

### Developer decision

Added checkout persistence and a `was_logged_in` field to make the behavior easier to inspect during testing.

---

## 7. Frontend API Layer

### Prompt

> Create a small frontend API abstraction so React components do not contain repeated fetch configuration. It should support registration, email recognition, OTP verification, and checkout submission.

### Developer decision

Centralized API calls in `frontend/src/api.js` and configured the API base URL through an environment variable.