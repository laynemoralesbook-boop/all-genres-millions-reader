import React, { useEffect, useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApprovedBooks } from '../lib/firestoreData';
import type { BookListing } from '../types/models';
import { ImageWithFallback } from '../components/ImageWithFallback';

const CHALLENGE_FAQS = [
  {
    q: 'Who can join the 2026–2027 Reading Challenge?',
    a: 'Any registered reader in the ALL GENRES MILLIONS READER community can participate. Registration is free and gives you access to a personal Reader Dashboard where you can track your reading goal and reflections.',
  },
  {
    q: 'Do I have to read from a single genre?',
    a: 'No. The challenge actively encourages exploring unfamiliar genres alongside your favorites—across fiction, nonfiction, memoir, poetry, and more.',
  },
  {
    q: 'How can authors have their books considered for challenge features?',
    a: 'Authors can submit their book through our Feature Your Book workflow. Approved books may also be designated by administrators as featured challenge selections.',
  },
];

export function ReadingChallengePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { siteSettings } = useAuth();
  const [challengeBooks, setChallengeBooks] = useState<BookListing[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const books = await fetchApprovedBooks();
        if (mounted) {
          setChallengeBooks(books.filter((b) => b.featuredInChallenge));
        }
      } catch (err) {
        console.warn('Challenge books load notice:', err);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const goals = [
    'Discover new books across unfamiliar and favorite categories',
    'Explore different genres throughout the year',
    'Set personal reading goals tailored to your own pace',
    'Read selected titles featured within the community',
    'Share thoughtful reflections and recommendations',
    'Participate in meaningful literary discussions',
    'Write honest reviews based purely on your reading experiences',
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-3">
              Community Reading Initiative
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD] [text-wrap:balance]">
              {siteSettings.challengeTitle}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#F3EBDD]/85 leading-relaxed">
              {siteSettings.challengeIntro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/join')}
                className="px-6 py-3.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors"
              >
                Register as a Reader
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/submit-book')}
                className="px-6 py-3.5 border border-[#C6A15B]/55 text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425] transition-colors"
              >
                Author Participation
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 overflow-hidden rounded-md border border-[#C6A15B]/25">
            <ImageWithFallback
              src="/src/assets/images/reading_challenge_study_1794963328598.jpg"
              alt="Reading journal and clothbound books for the 2026-2027 Reading Challenge"
              className="w-full h-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* What the Challenge Encourages & Guidelines */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 lg:py-20 border-b border-[#4A1425]/15">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-6">
            <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
              What This Challenge Encourages
            </h2>
            <ul className="mt-6 space-y-3.5 text-sm sm:text-base text-[#242126]/85">
              {goals.map((g, i) => (
                <li key={g} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#4A1425] font-semibold mt-1 tabular-nums">
                    {String(i + 1).padStart(2, '0')}.
                  </span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6 space-y-8">
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-8">
              <div className="flex items-center gap-2.5 text-[#4A1425] mb-3">
                <Compass className="w-5 h-5" />
                <h2 className="font-serif text-2xl font-bold">Reading Guidelines</h2>
              </div>
              <p className="text-sm sm:text-base text-[#242126]/85 leading-relaxed whitespace-pre-line">
                {siteSettings.challengeGuidelines}
              </p>
            </div>

            <div className="bg-[#4A1425] text-[#F3EBDD] rounded-md p-8">
              <h3 className="font-serif text-2xl font-bold text-[#C6A15B]">
                Author Participation Information
              </h3>
              <p className="mt-3 text-sm text-[#F3EBDD]/85 leading-relaxed">
                Authors who wish to introduce their books to challenge participants may submit their work through our promotional review process. Approved books may be featured in our curated library and considered for challenge spotlight placement.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/packages')}
                className="mt-5 px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors"
              >
                View Author Packages
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Challenge Books */}
      <section className="bg-[#242126] text-[#F3EBDD] py-16 lg:py-20 border-b border-[#C6A15B]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-[#F3EBDD] mb-8">
            Featured Challenge Books
          </h2>
          {challengeBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {challengeBooks.map((book) => (
                <article
                  key={book.id}
                  onClick={() => onNavigate(`/books/${book.id}`)}
                  className="cursor-pointer bg-[#2E2A31] border border-[#C6A15B]/20 rounded-md overflow-hidden hover:border-[#C6A15B]/60 transition-colors"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#320C18]">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={book.title}
                      fallbackTitle={book.title}
                      fallbackSubtitle={book.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-[#C6A15B]">{book.genre}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-[#F3EBDD]">{book.title}</h3>
                    <p className="mt-1 text-sm text-[#F3EBDD]/75">by {book.authorName}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[#2E2A31] border border-[#C6A15B]/20 rounded-md p-8 text-center max-w-2xl mx-auto">
              <BookOpen className="w-8 h-8 text-[#C6A15B] mx-auto mb-3" />
              <p className="text-sm text-[#F3EBDD]/80 leading-relaxed">
                Challenge book selections are published here by our editorial team once books are approved for the 2026–2027 Reading Challenge.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Challenge FAQ */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16">
        <div className="max-w-[900px] mx-auto px-6">
          <h2 className="font-serif text-3xl font-bold text-[#4A1425] mb-6">
            Reading Challenge FAQ
          </h2>
          <div className="divide-y divide-[#4A1425]/15 border-y border-[#4A1425]/15">
            {CHALLENGE_FAQS.map((item, idx) => {
              const open = openFaq === idx;
              return (
                <div key={item.q} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left"
                  >
                    <span className="font-serif text-xl font-semibold text-[#4A1425]">
                      {item.q}
                    </span>
                    {open ? <ChevronUp className="w-5 h-5 text-[#4A1425]" /> : <ChevronDown className="w-5 h-5 text-[#4A1425]" />}
                  </button>
                  {open && (
                    <p className="mt-3 text-sm text-[#242126]/80 leading-relaxed">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
