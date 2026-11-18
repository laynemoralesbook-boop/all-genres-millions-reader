import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileCheck2,
  Lock,
  Upload,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { fetchUserPayments, fetchUserSubmissions } from '../lib/firestoreData';
import {
  compressImageFileToDataUrl,
  generateSafeId,
  generateSubmissionReference,
} from '../lib/imageUtils';
import {
  AUTHOR_PACKAGES,
  LITERARY_GENRES,
  type AuthorSubmission,
  type PackageTier,
  type PaymentRecord,
} from '../types/models';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface AuthorSubmissionPageProps {
  initialPackage?: PackageTier;
  onNavigate: (path: string) => void;
}

interface PaymentConfigResponse {
  paystackConfigured: boolean;
  stripeConfigured: boolean;
  paystackPublicKey: string;
  stripePublishableKey: string;
  oneTimeOnly: boolean;
  currency: string;
}

export function AuthorSubmissionPage({
  initialPackage = 'standard',
  onNavigate,
}: AuthorSubmissionPageProps) {
  const { user, siteSettings, signInWithGoogle, getIdToken } = useAuth();

  const [authorFullName, setAuthorFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookGenre, setBookGenre] = useState<string>(LITERARY_GENRES[0]);
  const [bookSynopsis, setBookSynopsis] = useState('');
  const [purchaseLink, setPurchaseLink] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [authorBiography, setAuthorBiography] = useState('');
  const [authorWebsite, setAuthorWebsite] = useState('');
  const [socialMediaLinks, setSocialMediaLinks] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>(initialPackage);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdSubmission, setCreatedSubmission] = useState<AuthorSubmission | null>(null);

  const [mySubmissions, setMySubmissions] = useState<AuthorSubmission[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentRecord[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfigResponse | null>(null);
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{
    type: 'success' | 'info' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    setSelectedPackage(initialPackage);
  }, [initialPackage]);

  useEffect(() => {
    if (user) {
      if (!authorFullName && user.displayName) setAuthorFullName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [user, authorFullName, email]);

  useEffect(() => {
    fetch('/api/payments/config')
      .then((res) => res.json())
      .then((data: PaymentConfigResponse) => setPaymentConfig(data))
      .catch(() => {
        setPaymentConfig({
          paystackConfigured: false,
          stripeConfigured: false,
          paystackPublicKey: '',
          stripePublishableKey: '',
          oneTimeOnly: true,
          currency: 'USD',
        });
      });
  }, []);

  useEffect(() => {
    if (!user) {
      setMySubmissions([]);
      setMyPayments([]);
      return;
    }
    let mounted = true;
    async function loadHistory() {
      if (!user) return;
      try {
        const [subs, pays] = await Promise.all([
          fetchUserSubmissions(user.uid),
          fetchUserPayments(user.uid),
        ]);
        if (mounted) {
          setMySubmissions(subs);
          setMyPayments(pays);
        }
      } catch (err) {
        console.warn('Submission history notice:', err);
      }
    }
    void loadHistory();
    return () => {
      mounted = false;
    };
  }, [user, createdSubmission]);

  // Handle verified redirect callback from Paystack / Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    const submissionId = params.get('submissionId');
    const reference = params.get('reference');
    const sessionId = params.get('session_id');
    const cancelled = params.get('cancelled');

    if (cancelled === 'true') {
      setPaymentMessage({
        type: 'info',
        text: 'Checkout was cancelled before payment completion. Your submission remains saved as Pending Review.',
      });
      return;
    }

    if (!user || !provider || !submissionId) return;
    const verifiedProvider = provider;

    const currentSubs = mySubmissions;
    const matchedSub = currentSubs.find((s) => s.id === submissionId);
    if (!matchedSub) return;

    async function verifyReturn() {
      if (!matchedSub) return;
      const token = await getIdToken();
      if (!token) return;
      setPaymentBusy(true);
      try {
        const endpoint =
          verifiedProvider === 'paystack'
            ? '/api/payments/paystack/verify'
            : '/api/payments/stripe/verify-session';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reference,
            sessionId,
            packageTier: matchedSub.selectedPackage,
          }),
        });
        const data = (await res.json()) as {
          verified?: boolean;
          transactionId?: string;
          verificationDigest?: string;
          error?: string;
        };

        if (!res.ok || !data.verified || !data.transactionId) {
          setPaymentMessage({
            type: 'error',
            text: data.error || 'Payment verification failed.',
          });
          return;
        }

        const matchedPay = myPayments.find((p) => p.submissionId === matchedSub.id);
        if (matchedPay) {
          await updateDoc(doc(db, 'payments', matchedPay.id), {
            providerTransactionId: data.transactionId,
            verificationDigest: data.verificationDigest || '',
            updatedAt: serverTimestamp(),
          });
        }
        await updateDoc(doc(db, 'submissions', matchedSub.id), {
          paymentStatus: 'pending_verification',
          updatedAt: serverTimestamp(),
        });

        setPaymentMessage({
          type: 'success',
          text: `Payment verified by ${verifiedProvider.toUpperCase()} (Transaction ID: ${data.transactionId}). Our administration will complete final review and activate your 12-month listing.`,
        });
        window.history.replaceState({}, '', '/submit-book');
      } catch (err) {
        console.error('Callback verification error:', err);
        setPaymentMessage({
          type: 'error',
          text: 'Could not verify payment callback with the server.',
        });
      } finally {
        setPaymentBusy(false);
      }
    }
    void verifyReturn();
  }, [user, mySubmissions, myPayments, getIdToken]);

  const getPackagePrice = (tier: PackageTier) => {
    if (tier === 'basic') return siteSettings.basicPriceUsd;
    if (tier === 'standard') return siteSettings.standardPriceUsd;
    return siteSettings.premiumPriceUsd;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);
    setUploadingCover(true);
    try {
      const dataUrl = await compressImageFileToDataUrl(file);
      setCoverUrl(dataUrl);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to upload cover image.');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    let currentUser = user;
    if (!currentUser) {
      currentUser = await signInWithGoogle();
      if (!currentUser) {
        setErrorMessage('Please sign in with Google to submit your book application.');
        return;
      }
    }

    if (!agreedToTerms) {
      setErrorMessage('You must agree to the website terms and promotional conditions.');
      return;
    }

    if (bookSynopsis.trim().length < 10 || authorBiography.trim().length < 10) {
      setErrorMessage('Book synopsis and author biography must each be at least 10 characters.');
      return;
    }

    setSubmitting(true);
    const submissionId = generateSafeId('sub');
    const referenceCode = generateSubmissionReference();
    const amountUsd = getPackagePrice(selectedPackage);

    const payload = {
      userId: currentUser.uid,
      referenceCode,
      authorFullName: authorFullName.trim(),
      email: email.trim(),
      country: country.trim(),
      bookTitle: bookTitle.trim(),
      bookGenre,
      bookSynopsis: bookSynopsis.trim(),
      purchaseLink: purchaseLink.trim(),
      coverUrl: coverUrl.trim(),
      authorBiography: authorBiography.trim(),
      authorWebsite: authorWebsite.trim(),
      socialMediaLinks: socialMediaLinks.trim(),
      selectedPackage,
      packageAmountUsd: amountUsd,
      additionalInfo: additionalInfo.trim(),
      agreedToTerms: true,
      status: 'pending_review' as const,
      paymentStatus: 'unpaid' as const,
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'submissions', submissionId), payload);
      setCreatedSubmission({
        id: submissionId,
        ...payload,
      });
      setPaymentMessage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `submissions/${submissionId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartPayment = async (
    submission: AuthorSubmission,
    provider: 'paystack' | 'stripe'
  ) => {
    if (!user) return;
    setPaymentMessage(null);
    setPaymentBusy(true);

    try {
      const token = await getIdToken();
      if (!token) {
        setPaymentMessage({
          type: 'error',
          text: 'Authentication session expired. Please sign in again.',
        });
        return;
      }

      const paymentId = generateSafeId('pay');
      await setDoc(doc(db, 'payments', paymentId), {
        userId: user.uid,
        submissionId: submission.id,
        referenceCode: submission.referenceCode,
        provider,
        packageTier: submission.selectedPackage,
        amountUsd: submission.packageAmountUsd,
        status: 'pending',
        providerTransactionId: '',
        verificationDigest: '',
        promoStartDate: '',
        promoEndDate: '',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const endpoint =
        provider === 'paystack'
          ? '/api/payments/paystack/initialize'
          : '/api/payments/stripe/create-checkout-session';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageTier: submission.selectedPackage,
          email: submission.email,
          submissionId: submission.id,
          referenceCode: submission.referenceCode,
        }),
      });

      const result = (await response.json()) as {
        authorizationUrl?: string;
        checkoutUrl?: string;
        error?: string;
        setupRequired?: boolean;
      };

      if (!response.ok) {
        setPaymentMessage({
          type: result.setupRequired ? 'info' : 'error',
          text:
            result.error ||
            'Payment provider is currently awaiting server credential configuration.',
        });
        return;
      }

      const redirectUrl = result.authorizationUrl || result.checkoutUrl;
      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    } catch (err) {
      console.error('Payment start error:', err);
      setPaymentMessage({
        type: 'error',
        text: 'Unable to initiate payment checkout. Please try again.',
      });
    } finally {
      setPaymentBusy(false);
    }
  };

  const activeSubmission = createdSubmission || mySubmissions[0] || null;
  const anyPaymentProviderReady = Boolean(
    paymentConfig?.paystackConfigured || paymentConfig?.stripeConfigured
  );

  return (
    <div>
      {/* Header */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Author Application &amp; One-Time Checkout
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Feature Your Book
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/85 max-w-2xl leading-relaxed">
            Submit your book details for editorial review and select a 12-month one-time promotional package. All submissions start in Pending Review and are never published automatically.
          </p>
        </div>
      </section>

      <section className="bg-[#F3EBDD] text-[#242126] py-16">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Submission Form Column */}
          <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 sm:p-10">
            {!user && (
              <div className="mb-8 p-5 bg-[#4A1425] text-[#F3EBDD] rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-serif text-xl font-bold text-[#C6A15B]">
                    Sign In to Submit &amp; Track Your Application
                  </p>
                  <p className="mt-1 text-xs text-[#F3EBDD]/80">
                    Signing in protects your submission reference and links your payment verification securely.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void signInWithGoogle()}
                  className="px-4 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors shrink-0"
                >
                  Sign In with Google
                </button>
              </div>
            )}

            {createdSubmission ? (
              <div className="space-y-6">
                <div className="p-6 bg-[#4A1425] text-[#F3EBDD] rounded-md">
                  <div className="flex items-center gap-2.5 text-[#C6A15B] mb-2">
                    <FileCheck2 className="w-6 h-6" />
                    <h2 className="font-serif text-2xl font-bold">
                      Submission Recorded — Pending Review
                    </h2>
                  </div>
                  <p className="text-sm text-[#F3EBDD]/85 leading-relaxed">
                    Thank you, {createdSubmission.authorFullName}. Your application for{' '}
                    <strong>{createdSubmission.bookTitle}</strong> has been saved to our database and our administration has been notified.
                  </p>
                  <div className="mt-4 pt-4 border-t border-[#C6A15B]/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#C6A15B] block">Submission Reference</span>
                      <span className="font-mono font-bold text-sm">{createdSubmission.referenceCode}</span>
                    </div>
                    <div>
                      <span className="text-[#C6A15B] block">Application Status</span>
                      <span className="font-semibold">Pending Review</span>
                    </div>
                    <div>
                      <span className="text-[#C6A15B] block">Selected Package</span>
                      <span className="font-semibold uppercase">
                        {createdSubmission.selectedPackage} (${createdSubmission.packageAmountUsd})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Step for the New Submission */}
                <div className="p-6 bg-white border border-[#4A1425]/20 rounded-md space-y-4">
                  <div className="flex items-center gap-2 text-[#4A1425]">
                    <CreditCard className="w-5 h-5" />
                    <h3 className="font-serif text-2xl font-bold">
                      Step 2: One-Time Package Payment (${createdSubmission.packageAmountUsd})
                    </h3>
                  </div>
                  <p className="text-sm text-[#242126]/80 leading-relaxed">
                    One-time payment for a 12-month promotional period (no recurring charges). Paid promotional features are activated only after verified payment provider confirmation and administrative approval.
                  </p>

                  {paymentMessage && (
                    <div
                      className={`p-4 rounded-md text-sm ${
                        paymentMessage.type === 'success'
                          ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                          : paymentMessage.type === 'error'
                          ? 'bg-red-50 border border-red-300 text-red-900'
                          : 'bg-[#F3EBDD] border border-[#4A1425]/25 text-[#4A1425]'
                      }`}
                    >
                      {paymentMessage.text}
                    </div>
                  )}

                  {anyPaymentProviderReady ? (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {paymentConfig?.paystackConfigured && (
                        <button
                          type="button"
                          disabled={paymentBusy}
                          onClick={() => void handleStartPayment(createdSubmission, 'paystack')}
                          className="px-5 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] disabled:opacity-50"
                        >
                          Pay ${createdSubmission.packageAmountUsd} with Paystack
                        </button>
                      )}
                      {paymentConfig?.stripeConfigured && (
                        <button
                          type="button"
                          disabled={paymentBusy}
                          onClick={() => void handleStartPayment(createdSubmission, 'stripe')}
                          className="px-5 py-3 bg-[#242126] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425] disabled:opacity-50"
                        >
                          Pay ${createdSubmission.packageAmountUsd} with Stripe
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-[#F3EBDD] border border-[#4A1425]/25 rounded-md text-sm text-[#242126]/85 space-y-2">
                      <p className="font-semibold text-[#4A1425] flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        <span>Payment Gateway Configuration Required</span>
                      </p>
                      <p>
                        Paystack and Stripe API credentials are not yet configured in the server environment. Your submission reference{' '}
                        <span className="font-mono font-semibold">{createdSubmission.referenceCode}</span> has been saved safely.
                      </p>
                      <p className="text-xs text-[#242126]/70">
                        Administrator setup: Configure <code>PAYSTACK_SECRET_KEY</code> / <code>PAYSTACK_PUBLIC_KEY</code> or <code>STRIPE_SECRET_KEY</code> / <code>STRIPE_PUBLISHABLE_KEY</code> in server environment variables to activate live checkout. You may also contact{' '}
                        <a href="mailto:joseph.g@aurorametros.com" className="text-[#4A1425] underline">
                          joseph.g@aurorametros.com
                        </a>
                        .
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedSubmission(null);
                    setBookTitle('');
                    setBookSynopsis('');
                    setPurchaseLink('');
                    setCoverUrl('');
                    setAdditionalInfo('');
                    setAgreedToTerms(false);
                  }}
                  className="text-sm font-semibold text-[#4A1425] underline"
                >
                  Submit Another Book Application
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
                <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
                  Author Book Submission Form
                </h2>

                {errorMessage && (
                  <div className="p-4 bg-red-50 border border-red-300 rounded-md text-sm text-red-900 flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Author Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={authorFullName}
                      onChange={(e) => setAuthorFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      maxLength={180}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g., United States, United Kingdom, Nigeria"
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Book Genre *
                    </label>
                    <select
                      value={bookGenre}
                      onChange={(e) => setBookGenre(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    >
                      {LITERARY_GENRES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Book Synopsis * (minimum 10 characters)
                  </label>
                  <textarea
                    required
                    rows={4}
                    minLength={10}
                    maxLength={5000}
                    value={bookSynopsis}
                    onChange={(e) => setBookSynopsis(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Amazon or Purchase Link
                    </label>
                    <input
                      type="url"
                      maxLength={500}
                      value={purchaseLink}
                      onChange={(e) => setPurchaseLink(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Book Cover Upload
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border border-dashed border-[#4A1425]/40 rounded-md text-sm text-[#4A1425] cursor-pointer hover:bg-[#F3EBDD]/50">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingCover ? 'Processing image...' : coverUrl ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => void handleCoverUpload(e)}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>

                {coverUrl && (
                  <div className="flex items-center gap-4 p-3 bg-white border border-[#4A1425]/15 rounded-md">
                    <div className="w-16 h-24 overflow-hidden rounded border border-[#4A1425]/20 shrink-0">
                      <ImageWithFallback src={coverUrl} alt="Uploaded book cover preview" />
                    </div>
                    <div className="text-xs text-[#242126]/75 space-y-1">
                      <p className="font-semibold text-[#4A1425]">Cover preview attached</p>
                      <button
                        type="button"
                        onClick={() => setCoverUrl('')}
                        className="text-red-700 underline"
                      >
                        Remove Cover
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Author Biography * (minimum 10 characters)
                  </label>
                  <textarea
                    required
                    rows={3}
                    minLength={10}
                    maxLength={4000}
                    value={authorBiography}
                    onChange={(e) => setAuthorBiography(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Author Website
                    </label>
                    <input
                      type="url"
                      maxLength={300}
                      value={authorWebsite}
                      onChange={(e) => setAuthorWebsite(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Social Media Links
                    </label>
                    <input
                      type="text"
                      maxLength={1000}
                      value={socialMediaLinks}
                      onChange={(e) => setSocialMediaLinks(e.target.value)}
                      placeholder="Instagram, X, Goodreads, etc."
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                    />
                  </div>
                </div>

                {/* Package Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-2">
                    Selected Promotional Package * (One-Time 12-Month Payment)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {AUTHOR_PACKAGES.map((pkg) => {
                      const price = getPackagePrice(pkg.id);
                      const active = selectedPackage === pkg.id;
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackage(pkg.id)}
                          className={`p-4 rounded-md border text-left transition-colors ${
                            active
                              ? 'bg-[#4A1425] text-[#F3EBDD] border-[#4A1425]'
                              : 'bg-white text-[#242126] border-[#4A1425]/25 hover:border-[#4A1425]'
                          }`}
                        >
                          <div className="flex items-baseline justify-between">
                            <span className="font-serif font-bold text-lg">{pkg.name}</span>
                            <span className="font-serif font-bold text-xl text-[#C6A15B] tabular-nums">
                              ${price}
                            </span>
                          </div>
                          <p className={`mt-1 text-[11px] ${active ? 'text-[#F3EBDD]/75' : 'text-[#242126]/65'}`}>
                            12 months · One-time
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Additional Information
                  </label>
                  <textarea
                    rows={2}
                    maxLength={2000}
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="Publication year, ISBN, or review notes for our editorial team..."
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm text-[#242126] focus:outline-none focus:border-[#4A1425]"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer text-sm text-[#242126]/85">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#4A1425]"
                  />
                  <span>
                    I confirm that I agree to the{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/terms-and-conditions')}
                      className="text-[#4A1425] underline font-medium"
                    >
                      Terms and Conditions
                    </button>
                    ,{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/promotional-terms')}
                      className="text-[#4A1425] underline font-medium"
                    >
                      Promotional Service Terms
                    </button>
                    , and{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate('/refund-policy')}
                      className="text-[#4A1425] underline font-medium"
                    >
                      Refund Policy
                    </button>
                    . I understand that all submissions are subject to review and that promotional packages do not guarantee book sales, reviews, or rankings.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#320C18] disabled:opacity-60 transition-colors"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Book for Review & Continue to Payment'}
                </button>
              </form>
            )}
          </div>

          {/* Right Sidebar: Package Summary & Author's Submission Status */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-[#242126] text-[#F3EBDD] border border-[#C6A15B]/25 rounded-md p-7 space-y-4">
              <p className="text-xs tracking-[0.16em] uppercase text-[#C6A15B] font-semibold">
                Selected Package Summary
              </p>
              <div className="flex items-baseline justify-between border-b border-[#C6A15B]/20 pb-3">
                <h3 className="font-serif text-2xl font-bold uppercase">
                  {selectedPackage}
                </h3>
                <span className="font-serif text-3xl font-bold text-[#C6A15B] tabular-nums">
                  ${getPackagePrice(selectedPackage)}
                </span>
              </div>
              <p className="text-xs text-[#C6A15B]">
                One-time payment · 12-month promotional period · No recurring billing
              </p>
              <ul className="space-y-2 text-sm text-[#F3EBDD]/85">
                {AUTHOR_PACKAGES.find((p) => p.id === selectedPackage)?.features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </div>

            {/* Payment Gateway Readiness */}
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 space-y-3">
              <h3 className="font-serif text-xl font-bold text-[#4A1425]">
                Supported Payment Gateways
              </h3>
              <p className="text-xs text-[#242126]/75 leading-relaxed">
                Payments are processed securely on the server through Paystack and Stripe one-time checkout. Secret keys are never exposed in browser code.
              </p>
              <div className="text-xs space-y-1.5 pt-1">
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-[#4A1425]">Paystack Checkout:</span>
                  <span>{paymentConfig?.paystackConfigured ? 'Ready' : 'Awaiting server credentials'}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="font-semibold text-[#4A1425]">Stripe Checkout:</span>
                  <span>{paymentConfig?.stripeConfigured ? 'Ready' : 'Awaiting server credentials'}</span>
                </p>
              </div>
            </div>

            {/* Existing Author Submissions */}
            {user && mySubmissions.length > 0 && (
              <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#4A1425]">
                  Your Submitted Applications
                </h3>
                <div className="space-y-3">
                  {mySubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-4 bg-white border border-[#4A1425]/15 rounded-md space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-serif text-base font-bold text-[#4A1425]">
                          {sub.bookTitle}
                        </p>
                        <span className="font-mono text-[#242126]/65">{sub.referenceCode}</span>
                      </div>
                      <p className="text-[#242126]/75">
                        Package: <strong className="uppercase">{sub.selectedPackage}</strong> (${sub.packageAmountUsd})
                        <span aria-hidden="true"> · </span>
                        Review: <strong className="capitalize">{sub.status.replace(/_/g, ' ')}</strong>
                        <span aria-hidden="true"> · </span>
                        Payment: <strong className="capitalize">{sub.paymentStatus.replace(/_/g, ' ')}</strong>
                      </p>
                      {sub.paymentStatus === 'unpaid' && anyPaymentProviderReady && activeSubmission?.id !== sub.id && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {paymentConfig?.paystackConfigured && (
                            <button
                              type="button"
                              onClick={() => void handleStartPayment(sub, 'paystack')}
                              className="px-3 py-1.5 bg-[#4A1425] text-[#F3EBDD] font-semibold rounded"
                            >
                              Pay via Paystack
                            </button>
                          )}
                          {paymentConfig?.stripeConfigured && (
                            <button
                              type="button"
                              onClick={() => void handleStartPayment(sub, 'stripe')}
                              className="px-3 py-1.5 bg-[#242126] text-[#F3EBDD] font-semibold rounded"
                            >
                              Pay via Stripe
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 text-xs text-[#242126]/80 space-y-2">
              <p className="font-semibold text-[#4A1425] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Editorial Review Commitment</span>
              </p>
              <p>
                Submitted books are never automatically published. After payment verification and editorial approval, approved books and author profiles go live for their 12-month promotional period.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
