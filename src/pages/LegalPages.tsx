import React from 'react';

export type LegalPageType =
  | 'privacy-policy'
  | 'terms-and-conditions'
  | 'promotional-terms'
  | 'refund-policy';

export function LegalPage({
  type,
  onNavigate,
}: {
  type: LegalPageType;
  onNavigate: (path: string) => void;
}) {
  const titles: Record<LegalPageType, string> = {
    'privacy-policy': 'Privacy Policy',
    'terms-and-conditions': 'Terms and Conditions',
    'promotional-terms': 'Promotional Service Terms',
    'refund-policy': 'Refund Policy',
  };

  return (
    <div>
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[960px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Policies &amp; Governance
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            {titles[type]}
          </h1>
          <p className="mt-3 text-sm text-[#F3EBDD]/75">
            ALL GENRES MILLIONS READER · Official Representative: Joseph Goodluck ·{' '}
            <a href="mailto:joseph.g@aurorametros.com" className="text-[#C6A15B] underline">
              joseph.g@aurorametros.com
            </a>
          </p>
        </div>
      </section>

      <section className="bg-[#F3EBDD] text-[#242126] py-16">
        <div className="max-w-[960px] mx-auto px-6 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-8 sm:p-12 space-y-6 text-sm sm:text-base leading-relaxed text-[#242126]/85">
          {type === 'privacy-policy' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                1. Information We Collect
              </h2>
              <p>
                ALL GENRES MILLIONS READER collects information voluntarily provided when readers register for community accounts (full name, email address, country, favorite genres, reading interests), when authors submit book promotional applications, and when visitors submit messages via our Contact Us page.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                2. Protection of Private Information
              </h2>
              <p>
                Private reader details, contact inquiries, payment records, and author application correspondence are restricted to authorized platform administrators and the respective account owner. We never display private reader or author contact records publicly.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                3. Payment Processing Security
              </h2>
              <p>
                One-time promotional package payments are handled through verified third-party payment gateways (Paystack or Stripe). ALL GENRES MILLIONS READER does not store raw payment card numbers on its servers.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                4. Contact &amp; Data Requests
              </h2>
              <p>
                To request updates or deletion of your account information, email{' '}
                <a href="mailto:joseph.g@aurorametros.com" className="text-[#4A1425] underline">
                  joseph.g@aurorametros.com
                </a>
                .
              </p>
            </>
          )}

          {type === 'terms-and-conditions' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                1. Community Participation
              </h2>
              <p>
                By accessing ALL GENRES MILLIONS READER, readers and authors agree to engage respectfully across reading discussions, reflections, and book discovery activities.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                2. Accuracy of Submitted Materials
              </h2>
              <p>
                Authors submitting books for listing confirm that they hold the necessary publishing or promotional rights to the title, synopsis, cover artwork, biography, and external links submitted.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                3. Editorial Discretion
              </h2>
              <p>
                ALL GENRES MILLIONS READER reserves the right to review, approve, decline, or remove listings that conflict with community standards or contain inaccurate information.
              </p>
            </>
          )}

          {type === 'promotional-terms' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                1. Service Scope &amp; 12-Month Promotional Period
              </h2>
              <p>
                Author Promotional Packages (BASIC $50, STANDARD $100, and PREMIUM $150) provide a single, fixed 12-month promotional placement period on the ALL GENRES MILLIONS READER website according to the features described for each tier.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                2. One-Time Payment — No Recurring Subscriptions
              </h2>
              <p>
                All promotional package fees are one-time payments. We do not enroll authors in recurring monthly billing or automatic annual renewals.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                3. Review &amp; Activation Requirements
              </h2>
              <p>
                Every author submission starts with a status of Pending Review. Paid promotional features are activated only after both verified payment confirmation from the payment provider and administrative approval.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                4. No Sales, Review, or Ranking Guarantees
              </h2>
              <p>
                ALL GENRES MILLIONS READER provides curated editorial visibility. We do not guarantee book sales, bestseller rankings, specific reader counts, or book reviews. Reader reviews and reflections remain honest personal impressions.
              </p>
            </>
          )}

          {type === 'refund-policy' && (
            <>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                1. Submissions Declined During Editorial Review
              </h2>
              <p>
                If an author submits a promotional package payment and the book application is declined during administrative review prior to publication, the author is eligible for a full refund of the one-time promotional fee.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                2. Cancellation Prior to Publication
              </h2>
              <p>
                Authors may request cancellation and refund before their promotional feature is approved and published live on the website by contacting{' '}
                <a href="mailto:joseph.g@aurorametros.com" className="text-[#4A1425] underline">
                  joseph.g@aurorametros.com
                </a>{' '}
                with their submission reference code.
              </p>
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                3. Active 12-Month Promotional Listings
              </h2>
              <p>
                Once a listing has been verified, approved, and published live on ALL GENRES MILLIONS READER for its 12-month term, the one-time promotional fee is generally non-refundable except where required by applicable consumer law or in the event of an unresolved technical failure on our platform.
              </p>
            </>
          )}

          <div className="pt-6 border-t border-[#4A1425]/15 flex flex-wrap gap-4 text-xs font-semibold text-[#4A1425]">
            <button type="button" onClick={() => onNavigate('/packages')} className="underline">
              Author Packages
            </button>
            <button type="button" onClick={() => onNavigate('/submit-book')} className="underline">
              Submit a Book
            </button>
            <button type="button" onClick={() => onNavigate('/contact')} className="underline">
              Contact Official Representative
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
