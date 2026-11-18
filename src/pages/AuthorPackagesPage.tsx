import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AUTHOR_PACKAGES, type PackageTier } from '../types/models';

interface AuthorPackagesPageProps {
  onSelectPackage: (tier: PackageTier) => void;
  onNavigate: (path: string) => void;
}

export function AuthorPackagesPage({ onSelectPackage, onNavigate }: AuthorPackagesPageProps) {
  const { siteSettings } = useAuth();

  const getPrice = (tier: PackageTier) => {
    if (tier === 'basic') return siteSettings.basicPriceUsd;
    if (tier === 'standard') return siteSettings.standardPriceUsd;
    return siteSettings.premiumPriceUsd;
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Author Promotional Services
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Author Promotional Packages
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#F3EBDD]/85 max-w-2xl leading-relaxed">
            All prices are one-time payments for a 12-month promotional period. There are no recurring monthly charges or automatic renewals.
          </p>
        </div>
      </section>

      {/* Three Package Cards */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {AUTHOR_PACKAGES.map((pkg) => {
              const price = getPrice(pkg.id);
              const isHighlighted = pkg.id === 'standard';
              return (
                <div
                  key={pkg.id}
                  className={`rounded-md p-8 flex flex-col justify-between border ${
                    isHighlighted
                      ? 'bg-[#4A1425] text-[#F3EBDD] border-[#C6A15B]'
                      : 'bg-[#FAF6EE] text-[#242126] border-[#4A1425]/20'
                  }`}
                >
                  <div>
                    <div
                      className={`flex items-baseline justify-between pb-5 border-b ${
                        isHighlighted ? 'border-[#C6A15B]/30' : 'border-[#4A1425]/15'
                      }`}
                    >
                      <h2
                        className={`font-serif text-3xl font-bold ${
                          isHighlighted ? 'text-[#F3EBDD]' : 'text-[#4A1425]'
                        }`}
                      >
                        {pkg.name}
                      </h2>
                      <span
                        className={`font-serif text-4xl font-bold tabular-nums ${
                          isHighlighted ? 'text-[#C6A15B]' : 'text-[#4A1425]'
                        }`}
                      >
                        ${price}
                      </span>
                    </div>

                    <p
                      className={`mt-3 text-xs font-semibold tracking-wide ${
                        isHighlighted ? 'text-[#C6A15B]' : 'text-[#4A1425]/80'
                      }`}
                    >
                      One-Time Payment · 12-Month Promotional Period
                    </p>

                    <p
                      className={`mt-4 text-sm leading-relaxed ${
                        isHighlighted ? 'text-[#F3EBDD]/85' : 'text-[#242126]/80'
                      }`}
                    >
                      {pkg.summary}
                    </p>

                    <ul
                      className={`mt-6 space-y-3 text-sm ${
                        isHighlighted ? 'text-[#F3EBDD]/90' : 'text-[#242126]/85'
                      }`}
                    >
                      {pkg.features.map((feat) => (
                        <li key={feat} className="leading-snug">
                          • {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectPackage(pkg.id)}
                    className={`mt-8 w-full py-3.5 px-5 text-xs font-bold tracking-[0.08em] uppercase rounded-md transition-colors ${
                      isHighlighted
                        ? 'bg-[#C6A15B] text-[#242126] hover:bg-[#DFC389]'
                        : 'bg-[#4A1425] text-[#F3EBDD] hover:bg-[#320C18]'
                    }`}
                  >
                    SELECT THIS PACKAGE
                  </button>
                </div>
              );
            })}
          </div>

          {/* Transparent Terms & Ethical Commitments */}
          <div className="mt-12 bg-[#242126] text-[#F3EBDD] border border-[#C6A15B]/25 rounded-md p-8">
            <div className="flex items-center gap-2.5 text-[#C6A15B] mb-3">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif text-2xl font-bold">
                Transparent Terms &amp; Promotional Conditions
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#F3EBDD]/80 leading-relaxed">
              <ul className="space-y-2">
                <li>• Every package covers a fixed 12-month promotional period via a single one-time payment.</li>
                <li>• All submissions undergo editorial review before any promotional feature is published.</li>
                <li>• Pending submissions are never presented publicly as approved features.</li>
              </ul>
              <ul className="space-y-2">
                <li>• We do not promise guaranteed book sales, bestseller rankings, or guaranteed reviews.</li>
                <li>• We do not claim a guaranteed number of readers or impressions.</li>
                <li>
                  • Review our{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/promotional-terms')}
                    className="text-[#C6A15B] underline"
                  >
                    Promotional Service Terms
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onNavigate('/refund-policy')}
                    className="text-[#C6A15B] underline"
                  >
                    Refund Policy
                  </button>{' '}
                  before submitting.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
