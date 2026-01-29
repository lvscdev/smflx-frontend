# SMFLX Front-Office Error Handling (Stage 3)

This document describes the **user-visible error behavior** in the SMFLX front-office after removing all **demo-safe fallbacks**.

## Core principle
- If an API call is required for the next step in the flow, **the flow does not advance** until the call succeeds.
- Failures are surfaced to the user with a clear message and the user can retry.

## API client behavior
All API calls go through `src/lib/api/client.ts` (`apiRequest`).

### Error type
- On non-2xx responses, the client throws `ApiError`:
  - `name = "ApiError"`
  - `status`: HTTP status code (e.g., 401, 404, 500)
  - `code`: optional backend error code
  - `message`: prefers `json.message` (or `json.error`), else `Request failed (STATUS)`
  - `details`: raw decoded response body (when available)

### Auth token
- If `auth` is not set to `false`, `apiRequest` attaches:
  - `Authorization: Bearer <smflx_token>` (read from `localStorage`)

## Front-office surfaces and behaviors

### 1) Email verification
**Components**
- `src/components/front-office/ui/EmailVerification.tsx`
- `src/components/front-office/ui/ReturningUserLogin.tsx`

**APIs**
- `generateOtp(email)`
- `validateOtp({ email, otp, otpReference })`

**User-visible errors**
- OTP request fails: show error message; user remains on email step.
- OTP validation fails: show error message; user remains on OTP input step.

**Likely causes**
- 400: invalid email/otp
- 429: too many requests
- 5xx: backend issue

---

### 2) Profile save
**Component**
- `src/components/front-office/ui/ProfileForm.tsx`

**API**
- `updateMe(payload)`

**Behavior**
- If `updateMe` fails, the user **cannot proceed** to Event Selection.
- Error is shown inline on the form.

**Common issues**
- 401/403: missing or expired `smflx_token`
- 400: payload validation

---

### 3) Event selection
**Component**
- `src/components/front-office/ui/EventSelection.tsx`

**API**
- `listActiveEvents()`

**Behavior**
- No mock/demo events are shown.
- If the API fails: show an error message and a retry button.
- If the API returns an empty list: show “No active events found.”

---

### 4) Event registration persistence (required before continuing)
**Component**
- `src/app/(front-office)/page.tsx`

**API**
- `createUserRegistration({ userId, eventId, participationMode, accommodationType })`

**Behavior**
- When the user completes **EventRegistration**, the app:
  1. Updates local state.
  2. Calls `createUserRegistration`.
  3. **Only on success** does the flow continue:
     - Camper → Accommodation
     - Physical/Online → Dashboard
- If the API fails, the user stays on the Event Registration step and a banner is shown.

---

### 5) Dashboard hydration + dependents
**Component**
- `src/components/front-office/ui/Dashboard.tsx`

**APIs**
- `getUserDashboard()`
- `addDependent({ eventId, name, age, gender })`

**Behavior**
- If dashboard hydration fails, an error banner is shown on the dashboard.
- Dependents save is optimistic, but **reverts** on API failure and surfaces the error.

---

### 5b) Dashboard route initial load
**Route**
- `src/app/(front-office)/dashboard/page.tsx`

**APIs**
- `getMe()`
- `listMyRegistrations()` (best-effort)
- `getUserDashboard()` (best-effort)

**Behavior**
- Shows a loading state while fetching.
- If the required call (`getMe`) fails, the page shows an error screen with a Retry button.
- If optional calls fail, the dashboard still renders with available data.

**Logout behavior**
- Removes `smflx_token` from localStorage and redirects to `/`.

---

### 6) Payments: redirect-only, same-tab
**Components**
- `src/components/front-office/ui/Payment.tsx`
- `src/components/front-office/ui/DependentsPaymentModal.tsx`

**APIs**
- `initiateRegistrationPayment({ userId, eventId, registrationId?, amount, currency })`
- `initiateDependentsPayment({ userId, eventId, dependentIds, amount, currency })`

**Behavior**
- No local “payment simulation” success states exist.
- On success, the app redirects in the **same tab** using `window.location.href = checkoutUrl`.
- If the checkout initiation fails (or checkoutUrl is missing), an inline error message is shown.

**Configuration**
- Primary payment initiation path is controlled by:
  - `NEXT_PUBLIC_PAYMENT_INIT_PATH` (defaults to `/payments/initiate`)
- Dependents payment initiation path is controlled by:
  - `NEXT_PUBLIC_DEPENDENTS_PAYMENT_INIT_PATH` (defaults to `/payments/dependents/initiate`)

---

### 7) Payments: return handling (success/cancel)

**Routes**
- Success return URL: `/payment/success`
- Cancel/fail return URL: `/payment/cancel`

**What they do**
- These routes redirect back to the main flow page (`/`) with a query flag:
  - `/?payment=success...`
  - `/?payment=cancel...`
- The main flow page (`src/app/(front-office)/page.tsx`) then:
  1) Restores `smflx_pending_payment_ctx` (profile/registration/accommodation) from localStorage.
  2) On success:
     - (Optional) calls `verifyPayment(...)` if `NEXT_PUBLIC_PAYMENT_VERIFY_PATH` is configured.
     - Sends the user to **Dashboard**.
  3) On cancel/fail:
     - Returns the user to the **Payment** step with an inline error message.

**Optional API**
- `verifyPayment(...)` is a no-op unless you set:
  - `NEXT_PUBLIC_PAYMENT_VERIFY_PATH` (e.g. `/payments/verify`)

**Common failure modes**
- Missing `checkoutUrl` on initiation → user stays on payment with error.
- Verify endpoint returns `paid=false` / failure → user stays on payment with error.
- Payment provider returns without params → still resumes from stored context.

## Debug checklist
1. **CORS note (dev):** the backend currently does not return CORS headers.
   - In the browser we therefore call the same-origin proxy at `/api/*`.
   - The proxy then forwards to the backend base URL.
2. Confirm the backend base URL is correct:
   - Optional: set `SMFLX_BACKEND_BASE_URL` (server-only) to override the proxy target.
   - Or set `NEXT_PUBLIC_API_BASE_URL` if you intentionally want to change the base URL.
3. Confirm `smflx_token` exists in localStorage after OTP validation.
4. Check browser Network tab for:
   - status codes (401, 403, 429, 5xx)
   - response body `message`
5. If payments fail:
   - confirm backend returns `{ checkoutUrl }`
   - confirm the environment variable paths match the deployed backend routes.


## Dependents: remove dependent
- Endpoint: `DELETE /user-dashboard/remove-dependent/{id}`
- When it fails: UI reverts the optimistic removal and surfaces an error message on the dashboard.


## Payments: accommodation initialize (camper)
- Endpoint: `POST /accommodation/initialize`
- Required request fields: `amount`, `userId`, `eventId`, `reference`
- Expected response: `data.checkoutUrl` (or `checkoutUrl` depending on API wrapper normalization).
- When initiation fails or `checkoutUrl` is missing: Payment step shows an inline error and does not advance.
