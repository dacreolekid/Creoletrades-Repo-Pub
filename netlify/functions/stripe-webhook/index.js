/* ============================================================
   Stripe Webhook → Calendly Booking Email
   ============================================================
   Listens for checkout.session.completed events from Stripe.
   Sends the customer an email with their Calendly booking link
   based on which product they purchased (Mastery or Mastery Silver).

   Env vars required in Netlify:
     STRIPE_WEBHOOK_SECRET  — Stripe webhook signing secret
     GMAIL_USER             — Sending Gmail address (set in Netlify dashboard)
     GMAIL_APP_PASSWORD     — Google App Password (set in Netlify dashboard)
   ============================================================ */

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ── Product → Email mapping ─────────────────────────────────
const PRODUCTS = {
  mastery: {
    // Match on these keywords in the product name or description
    keywords: ['mastery', 'stacked: mastery'],
    // But exclude Mastery Silver
    exclude: ['silver'],
    subject: 'Your STACKED: Mastery Coaching Sessions — Book Now',
    calendlyLink: 'https://calendly.com/qilion24/packages/50a55290-7151-4995-a677-baba4e92e2e9',
    html: (name) => `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#070C18;color:#C8D4E8;padding:40px;border:1px solid rgba(201,168,76,0.3);">
        <div style="text-align:center;margin-bottom:30px;">
          <span style="font-size:2rem;">⚜</span>
          <h1 style="font-family:Georgia,serif;color:#F0D080;font-size:1.5rem;margin:10px 0 5px;">Welcome to STACKED: Mastery</h1>
          <p style="color:#5A7099;font-size:0.85rem;margin:0;">CreoleTrades — Where Southern Grit Meets Clarity</p>
        </div>
        <p style="line-height:1.8;">Hey ${name || 'STACKer'},</p>
        <p style="line-height:1.8;">Welcome to the inner circle. Your STACKED: Mastery subscription is confirmed and your 4 coaching sessions with Que are ready to book.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="https://calendly.com/qilion24/packages/50a55290-7151-4995-a677-baba4e92e2e9"
             style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#F0D080);color:#070C18;font-family:Georgia,serif;font-weight:700;font-size:1rem;padding:14px 32px;text-decoration:none;border-radius:4px;">
            Book Your 4 Coaching Sessions →
          </a>
        </div>
        <h2 style="color:#C9A84C;font-size:1rem;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:8px;">Next Steps</h2>
        <ol style="line-height:2;padding-left:20px;">
          <li>Click the button above to book all 4 sessions (1 per week)</li>
          <li>Join The Trading Roux Discord if you haven't already</li>
          <li>Check <strong style="color:#F0D080;">#pro-trade-plans</strong> for the latest setups</li>
          <li>Come prepared — bring charts, questions, and your trade journal</li>
        </ol>
        <h2 style="color:#C9A84C;font-size:1rem;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:8px;">What You Have Access To</h2>
        <ul style="line-height:2;padding-left:20px;">
          <li>Full STACK trade plans — nothing compressed</li>
          <li>Options guidance across all 5 zones</li>
          <li>Wolf Chart 2.1 confirmation on every plan</li>
          <li>All #pro- channels in Discord</li>
          <li>Monthly Live Q&A with Que</li>
        </ul>
        <p style="line-height:1.8;margin-top:20px;">Let's get to work. ⚜</p>
        <p style="line-height:1.8;"><strong style="color:#F0D080;">— Que, CreoleTrades</strong></p>
        <hr style="border:none;border-top:1px solid rgba(201,168,76,0.15);margin:30px 0 15px;" />
        <p style="font-size:0.72rem;color:#5A7099;text-align:center;">
          CreoleTrades does not provide financial advice. All content is for educational purposes only.<br/>
          <a href="https://creoletrades.com" style="color:#C9A84C;text-decoration:none;">creoletrades.com</a>
        </p>
      </div>
    `
  },
  masterySilver: {
    keywords: ['silver', 'mastery silver'],
    exclude: [],
    subject: 'Your STACKED: Mastery Silver Session — Book Now',
    calendlyLink: 'https://calendly.com/qilion24/60min',
    html: (name) => `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#070C18;color:#C8D4E8;padding:40px;border:1px solid rgba(201,168,76,0.3);">
        <div style="text-align:center;margin-bottom:30px;">
          <span style="font-size:2rem;">⚜</span>
          <h1 style="font-family:Georgia,serif;color:#F0D080;font-size:1.5rem;margin:10px 0 5px;">STACKED: Mastery Silver Confirmed</h1>
          <p style="color:#5A7099;font-size:0.85rem;margin:0;">CreoleTrades — Where Southern Grit Meets Clarity</p>
        </div>
        <p style="line-height:1.8;">Hey ${name || 'STACKer'},</p>
        <p style="line-height:1.8;">Your STACKED: Mastery Silver session is locked in. You've got 60 minutes of direct coaching with Que — bring your charts, your questions, and your trade journal.</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="https://calendly.com/qilion24/60min"
             style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#F0D080);color:#070C18;font-family:Georgia,serif;font-weight:700;font-size:1rem;padding:14px 32px;text-decoration:none;border-radius:4px;">
            Book Your Time Slot →
          </a>
        </div>
        <h2 style="color:#C9A84C;font-size:1rem;border-bottom:1px solid rgba(201,168,76,0.2);padding-bottom:8px;">What to Expect</h2>
        <ul style="line-height:2;padding-left:20px;">
          <li>60-minute private session with Que</li>
          <li>Temporary Mastery-level Discord access for one week</li>
          <li>You bring the topic — chart reads, trade reviews, strategy building</li>
        </ul>
        <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.2);padding:20px;margin:25px 0;border-radius:4px;">
          <p style="color:#F0D080;font-weight:700;margin:0 0 8px;">Want the Full Mastery Experience?</p>
          <p style="margin:0;line-height:1.7;">Upgrade to <strong>STACKED: Mastery</strong> for full trade plans, options guidance, 4 coaching sessions per month, and all #pro- channels.</p>
          <a href="https://mee6.xyz/en/m/tradingroux?subscribe=1471656319198171136"
             style="display:inline-block;color:#C9A84C;font-weight:700;margin-top:10px;text-decoration:underline;">
            Upgrade to Mastery →
          </a>
        </div>
        <p style="line-height:1.8;">See you on the call. ⚜</p>
        <p style="line-height:1.8;"><strong style="color:#F0D080;">— Que, CreoleTrades</strong></p>
        <hr style="border:none;border-top:1px solid rgba(201,168,76,0.15);margin:30px 0 15px;" />
        <p style="font-size:0.72rem;color:#5A7099;text-align:center;">
          CreoleTrades does not provide financial advice. All content is for educational purposes only.<br/>
          <a href="https://creoletrades.com" style="color:#C9A84C;text-decoration:none;">creoletrades.com</a>
        </p>
      </div>
    `
  }
};

// ── Stripe signature verification (no SDK needed) ───────────
function verifyStripeSignature(payload, sigHeader, secret) {
  const elements = sigHeader.split(',');
  const tsEl = elements.find(e => e.startsWith('t='));
  const sigEl = elements.find(e => e.startsWith('v1='));

  if (!tsEl || !sigEl) return false;

  const timestamp = tsEl.split('=')[1];
  const signature = sigEl.split('=')[1];

  // Reject if timestamp is older than 5 minutes (replay protection)
  const tolerance = 300; // seconds
  const now = Math.floor(Date.now() / 1000);
  if (now - parseInt(timestamp) > tolerance) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// ── Identify product from Stripe event ──────────────────────
function identifyProduct(event) {
  const session = event.data.object;

  // Try to get product name from line items or metadata
  const productName = (
    session.metadata?.product_name ||
    session.display_items?.[0]?.plan?.nickname ||
    session.display_items?.[0]?.custom?.name ||
    session.line_items?.data?.[0]?.description ||
    session.subscription?.plan?.nickname ||
    ''
  ).toLowerCase();

  const amount = session.amount_total || session.amount || 0;

  // Match Mastery Silver first (more specific)
  if (
    PRODUCTS.masterySilver.keywords.some(k => productName.includes(k)) ||
    amount === 9999 // $99.99 in cents
  ) {
    return 'masterySilver';
  }

  // Match Mastery
  if (
    (PRODUCTS.mastery.keywords.some(k => productName.includes(k)) &&
     !PRODUCTS.mastery.exclude.some(k => productName.includes(k))) ||
    amount === 39999 // $399.99 in cents
  ) {
    return 'mastery';
  }

  return null;
}

// ── Send email via Gmail SMTP ───────────────────────────────
async function sendBookingEmail(to, name, product) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  });

  const config = PRODUCTS[product];

  await transporter.sendMail({
    from: `"CreoleTrades" <${process.env.GMAIL_USER}>`,
    to,
    subject: config.subject,
    html: config.html(name)
  });
}

// ── Netlify Function Handler ────────────────────────────────
exports.handler = async (event) => {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Handle Netlify's base64 encoding of request body
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  const sig = event.headers['stripe-signature'];
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error('Missing stripe-signature header or STRIPE_WEBHOOK_SECRET env var');
    return { statusCode: 400, body: JSON.stringify({ error: 'missing_signature', hasSig: !!sig, hasSecret: !!secret }) };
  }

  // Verify webhook signature
  const isValid = verifyStripeSignature(rawBody, sig, secret);
  if (!isValid) {
    console.error('Invalid Stripe signature — likely signing secret mismatch between live/test mode');
    return { statusCode: 401, body: JSON.stringify({ error: 'invalid_signature' }) };
  }

  let stripeEvent;
  try {
    stripeEvent = JSON.parse(rawBody);
  } catch (e) {
    console.error('Failed to parse webhook body:', e.message);
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  console.log('Webhook received:', stripeEvent.type);

  // Only handle checkout.session.completed
  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: JSON.stringify({ received: true, skipped: stripeEvent.type }) };
  }

  const session = stripeEvent.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;
  const customerName = session.customer_details?.name || '';
  const amount = session.amount_total || session.amount || 0;

  console.log('Checkout session:', { email: customerEmail, amount, mode: session.mode });

  if (!customerEmail) {
    console.error('No customer email found in checkout session');
    return { statusCode: 200, body: JSON.stringify({ received: true, error: 'no_email', amount }) };
  }

  // Identify which product was purchased
  const product = identifyProduct(stripeEvent);

  if (!product) {
    console.log('Product not matched:', { amount, email: customerEmail });
    return { statusCode: 200, body: JSON.stringify({ received: true, skipped: 'unknown_product', amount }) };
  }

  // Send the booking email
  try {
    await sendBookingEmail(customerEmail, customerName, product);
    console.log(`Booking email sent: ${product} → ${customerEmail}`);
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, emailSent: true, product, to: customerEmail })
    };
  } catch (err) {
    console.error('Email send failed:', err.message);
    return {
      statusCode: 200, // Still return 200 so Stripe doesn't retry endlessly
      body: JSON.stringify({ received: true, emailError: err.message })
    };
  }
};
