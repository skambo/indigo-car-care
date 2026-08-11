export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name,
    email,
    phone,
    service,
    addon,
    date,
    timeSlot,
    city,
    location,
    vehicle,
    notes,
    paystackRef,
    depositAmount,
  } = req.body || {};

  const RESEND_API_KEY   = process.env.RESEND_API_KEY;
  const FROM_ADDRESS     = process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev';
  const JOE_EMAIL        = 'jkcartage2015@gmail.com';
  const RESEND_ENDPOINT  = 'https://api.resend.com/emails';

  const results = { clientEmail: null, internalEmail: null };

  // ── CLIENT CONFIRMATION ─────────────────────────────────────────────────────
  const clientHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmed — Indigo Car Care Club</title>
</head>
<body style="margin:0;padding:0;background:#111111;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1a1a1a;border:1px solid #2a2a2a;">

          <!-- Header -->
          <tr>
            <td style="background:#CC0000;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Indigo Car Care Club</p>
              <h1 style="margin:8px 0 0;font-size:28px;font-weight:900;letter-spacing:0.05em;color:#ffffff;text-transform:uppercase;">Booking Confirmed</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 32px 24px;">

              <p style="margin:0 0 20px;font-size:15px;color:#cccccc;line-height:1.6;">
                Hi <strong style="color:#ffffff;">${esc(name)}</strong>, your booking is confirmed and your deposit has been received. We'll also reach out on WhatsApp to confirm your arrival time.
              </p>

              <!-- Reference badge -->
              <div style="background:#111111;border:1px solid #2a2a2a;padding:10px 16px;margin-bottom:24px;font-family:monospace;font-size:12px;letter-spacing:0.12em;color:#16a34a;text-transform:uppercase;">
                Ref: ${esc(paystackRef)}
              </div>

              <!-- Summary table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;width:40%;">Service</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;font-weight:600;">${esc(service)}</td>
                </tr>
                ${addon ? `<tr style="border-bottom:1px solid #2a2a2a;">
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Add-on</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;">${esc(addon)}</td>
                </tr>` : ''}
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Date</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;">${esc(date)}</td>
                </tr>
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Time Slot</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;">${esc(timeSlot)}</td>
                </tr>
                <tr style="border-bottom:1px solid #2a2a2a;">
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Location</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;">${esc(city)} — ${esc(location)}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">Vehicle</td>
                  <td style="padding:10px 0;font-size:14px;color:#ffffff;">${esc(vehicle)}</td>
                </tr>
              </table>

              <!-- Deposit -->
              <div style="background:#0d1f12;border:1px solid #1a3d22;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#16a34a;font-weight:600;">✓ Deposit Paid: ${esc(depositAmount || 'KES 2,000')}. Deducted from your total on the day.</p>
              </div>

              <!-- What happens next -->
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#666666;">What Happens Next</p>
              <ol style="margin:0 0 24px;padding-left:20px;color:#cccccc;font-size:14px;line-height:1.8;">
                <li>We'll confirm your slot on WhatsApp</li>
                <li>Our team arrives at your location — you don't lift a finger</li>
                <li>Balance is settled after the service is complete</li>
              </ol>

              <!-- Cancellation -->
              <p style="margin:0 0 24px;font-size:12px;color:#888888;line-height:1.6;border-left:2px solid #CC0000;padding-left:12px;">
                <strong style="color:#aaaaaa;">Cancellation Policy:</strong> 48+ hours notice = full refund. Less than 48 hours = deposit forfeited.
              </p>

              <!-- Contact -->
              <p style="margin:0;font-size:13px;color:#888888;line-height:1.8;">
                Questions? Call or WhatsApp: <a href="tel:+254112657174" style="color:#CC0000;text-decoration:none;">+254 112 657 174</a><br>
                Email: <a href="mailto:info@indigocarcare.co.ke" style="color:#CC0000;text-decoration:none;">info@indigocarcare.co.ke</a>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #2a2a2a;text-align:center;">
              <p style="margin:0;font-size:11px;color:#444444;letter-spacing:0.08em;">INDIGO CAR CARE CLUB · YOUR RIDE, YOUR PRIDE</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  // ── INTERNAL NOTIFICATION ───────────────────────────────────────────────────
  const internalText = `New Booking — Indigo Car Care Club

Name:           ${name}
Phone/WhatsApp: ${phone}
Email:          ${email}

Service:        ${service}
Add-on:         ${addon || 'None'}
Date:           ${date}
Time Slot:      ${timeSlot}
City:           ${city}
Location:       ${location}
Vehicle:        ${vehicle}
Notes:          ${notes || '—'}

Deposit Paid:   ${depositAmount || 'KES 2,000'}
Paystack Ref:   ${paystackRef}
`;

  // ── SEND CLIENT EMAIL ───────────────────────────────────────────────────────
  try {
    const clientRes = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_ADDRESS,
        to:      [email],
        subject: 'Your Indigo Car Care Club booking is confirmed',
        html:    clientHtml,
      }),
    });
    const clientData = await clientRes.json();
    if (!clientRes.ok) {
      console.error('Resend client email failed:', clientData);
      results.clientEmail = { ok: false, error: clientData };
    } else {
      results.clientEmail = { ok: true, id: clientData.id };
    }
  } catch (err) {
    console.error('Resend client email exception:', err);
    results.clientEmail = { ok: false, error: err.message };
  }

  // ── SEND INTERNAL EMAIL ─────────────────────────────────────────────────────
  try {
    const internalRes = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_ADDRESS,
        to:      [JOE_EMAIL],
        subject: `New Booking: ${name} — ${service}`,
        text:    internalText,
      }),
    });
    const internalData = await internalRes.json();
    if (!internalRes.ok) {
      console.error('Resend internal email failed:', internalData);
      results.internalEmail = { ok: false, error: internalData };
    } else {
      results.internalEmail = { ok: true, id: internalData.id };
    }
  } catch (err) {
    console.error('Resend internal email exception:', err);
    results.internalEmail = { ok: false, error: err.message };
  }

  // Always 200 — a failed email must never break the booking
  return res.status(200).json(results);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
