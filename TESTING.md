# Testing Guide — Indigo Car Care Club

## Email Confirmations (Resend)

Emails fire only after a **successful Paystack payment** — they share the same trigger as the WhatsApp confirmation, so testing email delivery means completing a real test-mode booking.

### How to run a test booking

1. Open the site locally (or on the staging deployment)
2. Fill out the booking form with a **real email address you can check**
3. On the Paystack payment screen, use the test card:

   | Field | Value |
   |---|---|
   | Card number | 4084 084 084 084 081 |
   | Expiry | Any future date |
   | CVV | 408 |
   | PIN | 0000 |
   | OTP | 123456 |

4. On success, two things should happen simultaneously:
   - WhatsApp opens with the pre-filled booking summary (existing behaviour)
   - A POST fires to `/api/send-booking-email` — check the browser DevTools Network tab to confirm it returns `200`

5. The JSON response body shows which of the two sends succeeded:
   ```json
   {
     "clientEmail":   { "ok": true,  "id": "..." },
     "internalEmail": { "ok": true,  "id": "..." }
   }
   ```
   If either is `{ "ok": false }`, the error details are in the response and in Vercel's function logs.

### Checking delivery status

Resend logs every send attempt with full delivery status at **resend.com/emails**. Check there first if an email doesn't arrive in the inbox — it will show whether the send was accepted, bounced, or deferred, before assuming the code is broken.

### Switching from the fallback sender to the verified domain

Until `bookings@indigocarcare.com` is verified in Resend, emails are sent from the `RESEND_FROM_ADDRESS` env var, which falls back to `onboarding@resend.dev` if unset.

Once the domain is verified:

1. In **Vercel → Project Settings → Environment Variables**, set:
   ```
   RESEND_FROM_ADDRESS = bookings@indigocarcare.com
   ```
2. Redeploy (or trigger a new deployment) — no code changes needed.
