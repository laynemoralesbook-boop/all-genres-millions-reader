import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Request, type Response, type NextFunction } from 'express';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const adminAuth = getAuth();

interface AuthRequest extends Request {
  user?: DecodedIdToken;
}

const PACKAGE_AMOUNTS_USD: Record<string, number> = {
  basic: 50,
  standard: 100,
  premium: 150,
};

const PACKAGE_LABELS: Record<string, string> = {
  basic: 'BASIC — 12-Month Featured Book Listing (One-Time)',
  standard: 'STANDARD — 12-Month Featured Book & Author Profile (One-Time)',
  premium: 'PREMIUM — 12-Month Priority Spotlight & Enhanced Feature (One-Time)',
};

async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please sign in first.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired authentication session.' });
  }
}

function createVerificationDigest(payload: string): string {
  const secret =
    process.env.PAYMENT_VERIFICATION_SECRET ||
    process.env.STRIPE_SECRET_KEY ||
    process.env.PAYSTACK_SECRET_KEY ||
    'agmr-verification-fallback';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ALL GENRES MILLIONS READER' });
  });

  app.get('/api/payments/config', (_req: Request, res: Response) => {
    const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);
    const stripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY);

    res.json({
      paystackConfigured,
      stripeConfigured,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      oneTimeOnly: true,
      currency: 'USD',
    });
  });

  app.post('/api/payments/paystack/initialize', requireAuth, async (req: AuthRequest, res: Response) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      res.status(503).json({
        setupRequired: true,
        error: 'Paystack credentials are not configured. Set PAYSTACK_SECRET_KEY in server environment variables.',
      });
      return;
    }

    const { packageTier, email, submissionId, referenceCode } = req.body as {
      packageTier?: string;
      email?: string;
      submissionId?: string;
      referenceCode?: string;
    };

    const amountUsd = packageTier ? PACKAGE_AMOUNTS_USD[packageTier] : undefined;
    if (!amountUsd || !email || !submissionId || !referenceCode) {
      res.status(400).json({ error: 'Valid packageTier, email, submissionId, and referenceCode are required.' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const callbackUrl = `${baseUrl}/submit-book?provider=paystack&submissionId=${encodeURIComponent(submissionId)}&reference=${encodeURIComponent(referenceCode)}`;

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amountUsd * 100,
          reference: referenceCode,
          callback_url: callbackUrl,
          metadata: {
            submissionId,
            packageTier,
            userId: req.user?.uid,
            oneTimePayment: true,
            durationMonths: 12,
          },
        }),
      });

      const data = (await response.json()) as {
        status?: boolean;
        message?: string;
        data?: { authorization_url: string; access_code: string; reference: string };
      };

      if (!response.ok || !data.status || !data.data?.authorization_url) {
        res.status(400).json({ error: data.message || 'Unable to initialize Paystack transaction.' });
        return;
      }

      res.json({
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference: data.data.reference,
      });
    } catch (err) {
      console.error('Paystack initialize error:', err);
      res.status(502).json({ error: 'Unable to communicate with Paystack API.' });
    }
  });

  app.post('/api/payments/paystack/verify', requireAuth, async (req: AuthRequest, res: Response) => {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      res.status(503).json({
        setupRequired: true,
        error: 'Paystack credentials are not configured on the server.',
      });
      return;
    }

    const { reference, packageTier } = req.body as { reference?: string; packageTier?: string };
    const expectedUsd = packageTier ? PACKAGE_AMOUNTS_USD[packageTier] : undefined;
    if (!reference || !expectedUsd) {
      res.status(400).json({ error: 'Transaction reference and valid packageTier are required.' });
      return;
    }

    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });
      const data = (await response.json()) as {
        status?: boolean;
        message?: string;
        data?: {
          id: number;
          status: string;
          reference: string;
          amount: number;
          currency: string;
          paid_at: string;
        };
      };

      if (!response.ok || !data.status || !data.data || data.data.status !== 'success') {
        res.status(402).json({
          verified: false,
          error: data.message || 'Payment has not been confirmed by Paystack.',
        });
        return;
      }

      if (data.data.amount < expectedUsd * 100) {
        res.status(402).json({
          verified: false,
          error: 'Verified Paystack amount does not match selected promotional package.',
        });
        return;
      }

      const transactionId = String(data.data.id);
      const verificationDigest = createVerificationDigest(
        `paystack:${data.data.reference}:${transactionId}:${data.data.amount}:${req.user?.uid}`
      );

      res.json({
        verified: true,
        provider: 'paystack',
        transactionId,
        reference: data.data.reference,
        amountPaidMinor: data.data.amount,
        currency: data.data.currency,
        paidAt: data.data.paid_at,
        verificationDigest,
      });
    } catch (err) {
      console.error('Paystack verify error:', err);
      res.status(502).json({ error: 'Unable to verify transaction with Paystack.' });
    }
  });

  app.post('/api/payments/stripe/create-checkout-session', requireAuth, async (req: AuthRequest, res: Response) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      res.status(503).json({
        setupRequired: true,
        error: 'Stripe credentials are not configured. Set STRIPE_SECRET_KEY in server environment variables.',
      });
      return;
    }

    const { packageTier, email, submissionId, referenceCode } = req.body as {
      packageTier?: string;
      email?: string;
      submissionId?: string;
      referenceCode?: string;
    };

    const amountUsd = packageTier ? PACKAGE_AMOUNTS_USD[packageTier] : undefined;
    const label = packageTier ? PACKAGE_LABELS[packageTier] : undefined;
    if (!amountUsd || !label || !email || !submissionId || !referenceCode) {
      res.status(400).json({ error: 'Valid packageTier, email, submissionId, and referenceCode are required.' });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const successUrl = `${baseUrl}/submit-book?provider=stripe&session_id={CHECKOUT_SESSION_ID}&submissionId=${encodeURIComponent(submissionId)}&reference=${encodeURIComponent(referenceCode)}`;
    const cancelUrl = `${baseUrl}/submit-book?cancelled=true&submissionId=${encodeURIComponent(submissionId)}`;

    try {
      const form = new URLSearchParams();
      form.append('mode', 'payment');
      form.append('customer_email', email);
      form.append('client_reference_id', referenceCode);
      form.append('success_url', successUrl);
      form.append('cancel_url', cancelUrl);
      form.append('line_items[0][price_data][currency]', 'usd');
      form.append('line_items[0][price_data][unit_amount]', String(amountUsd * 100));
      form.append('line_items[0][price_data][product_data][name]', label);
      form.append(
        'line_items[0][price_data][product_data][description]',
        'One-time payment for a 12-month promotional period (subject to editorial review and approval).'
      );
      form.append('line_items[0][quantity]', '1');
      form.append('metadata[submissionId]', submissionId);
      form.append('metadata[packageTier]', packageTier || '');
      form.append('metadata[referenceCode]', referenceCode);
      form.append('metadata[userId]', req.user?.uid || '');

      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: form.toString(),
      });

      const data = (await response.json()) as {
        id?: string;
        url?: string;
        error?: { message?: string };
      };

      if (!response.ok || !data.url || !data.id) {
        res.status(400).json({ error: data.error?.message || 'Unable to create Stripe Checkout session.' });
        return;
      }

      res.json({
        sessionId: data.id,
        checkoutUrl: data.url,
      });
    } catch (err) {
      console.error('Stripe checkout error:', err);
      res.status(502).json({ error: 'Unable to communicate with Stripe API.' });
    }
  });

  app.post('/api/payments/stripe/verify-session', requireAuth, async (req: AuthRequest, res: Response) => {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      res.status(503).json({
        setupRequired: true,
        error: 'Stripe credentials are not configured on the server.',
      });
      return;
    }

    const { sessionId, packageTier } = req.body as { sessionId?: string; packageTier?: string };
    const expectedUsd = packageTier ? PACKAGE_AMOUNTS_USD[packageTier] : undefined;
    if (!sessionId || !expectedUsd) {
      res.status(400).json({ error: 'Stripe sessionId and valid packageTier are required.' });
      return;
    }

    try {
      const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      });
      const data = (await response.json()) as {
        id: string;
        mode: string;
        payment_status: string;
        amount_total: number;
        currency: string;
        payment_intent?: string;
        error?: { message?: string };
      };

      if (!response.ok || data.payment_status !== 'paid' || data.mode !== 'payment') {
        res.status(402).json({
          verified: false,
          error: data.error?.message || 'Stripe Checkout session is not paid.',
        });
        return;
      }

      if (data.amount_total < expectedUsd * 100) {
        res.status(402).json({
          verified: false,
          error: 'Verified Stripe amount does not match selected promotional package.',
        });
        return;
      }

      const transactionId = String(data.payment_intent || data.id);
      const verificationDigest = createVerificationDigest(
        `stripe:${data.id}:${transactionId}:${data.amount_total}:${req.user?.uid}`
      );

      res.json({
        verified: true,
        provider: 'stripe',
        transactionId,
        sessionId: data.id,
        amountPaidMinor: data.amount_total,
        currency: data.currency,
        verificationDigest,
      });
    } catch (err) {
      console.error('Stripe verify error:', err);
      res.status(502).json({ error: 'Unable to verify Stripe Checkout session.' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ALL GENRES MILLIONS READER server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
