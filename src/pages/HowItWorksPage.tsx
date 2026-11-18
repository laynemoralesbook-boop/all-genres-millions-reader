import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function HowItWorksPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const readerSteps = [
    'Join the reading community.',
    'Discover books across different genres.',
    'Explore featured authors.',
    'Participate in reading challenges.',
    'Share your reading experiences and recommendations.',
  ];

  const authorSteps = [
    'Submit your book information.',
    'Select a promotional package.',
    'Complete the applicable payment process.',
    'Submit your book details and promotional materials.',
    'Wait for submission review and approval.',
    'Once approved, your book can be featured according to the selected package.',
  ];

  return (
    <div>
      {/* Header */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Platform Process
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            How It Works
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/80 max-w-2xl leading-relaxed">
            Whether you are joining as a passionate reader or submitting a published book for promotional visibility, our process is transparent, structured, and review-guided.
          </p>
        </div>
      </section>

      {/* Two Clear Sections */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Readers */}
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-[#4A1425] font-semibold">
                  Reader Pathway
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-[#4A1425]">
                  For Readers
                </h2>
                <ol className="mt-6 space-y-4">
                  {readerSteps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3.5 text-base text-[#242126]/85">
                      <span className="font-mono text-sm font-bold text-[#4A1425] tabular-nums mt-0.5">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/join')}
                className="mt-8 w-full sm:w-auto px-6 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors"
              >
                Join Our Community
              </button>
            </div>

            {/* For Authors */}
            <div className="bg-[#4A1425] text-[#F3EBDD] border border-[#C6A15B]/30 rounded-md p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <p className="text-xs tracking-[0.16em] uppercase text-[#C6A15B] font-semibold">
                  Author Promotional Pathway
                </p>
                <h2 className="mt-2 font-serif text-3xl font-bold text-[#F3EBDD]">
                  For Authors
                </h2>
                <ol className="mt-6 space-y-4">
                  {authorSteps.map((step, i) => (
                    <li key={step} className="flex items-start gap-3.5 text-base text-[#F3EBDD]/90">
                      <span className="font-mono text-sm font-bold text-[#C6A15B] tabular-nums mt-0.5">
                        {i + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/packages')}
                className="mt-8 w-full sm:w-auto px-6 py-3 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors"
              >
                Explore Promotional Packages
              </button>
            </div>
          </div>

          {/* Editorial Review Notice */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#242126] text-[#F3EBDD] rounded-md p-8 sm:p-10 border border-[#C6A15B]/25">
            <div className="lg:col-span-5 overflow-hidden rounded-md border border-[#C6A15B]/20">
              <ImageWithFallback
                src="/src/assets/images/author_desk_manuscript_1794963330081.jpg"
                alt="Author desk with printed manuscript and brass lamp"
                className="w-full h-full object-cover aspect-[4/3]"
              />
            </div>
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-[#C6A15B]">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-serif text-2xl font-bold">
                  All Submissions Are Subject to Editorial Review
                </h3>
              </div>
              <p className="text-sm sm:text-base text-[#F3EBDD]/85 leading-relaxed">
                Every author submission enters our administrative queue with a status of <strong className="text-[#C6A15B]">Pending Review</strong>. Submitting a form or completing a one-time payment never bypasses editorial verification.
              </p>
              <p className="text-sm text-[#F3EBDD]/75 leading-relaxed">
                Paid promotional placements are activated for their 12-month period only after payment verification from the payment provider and administrative approval. Refer to our Promotional Service Terms and Refund Policy for full details.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
