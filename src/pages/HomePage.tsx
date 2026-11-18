import React, { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, ChevronUp, Compass, Feather, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchApprovedAuthors, fetchApprovedBooks } from '../lib/firestoreData';
import { AUTHOR_PACKAGES, LITERARY_GENRES, type AuthorProfile, type BookListing } from '../types/models';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectGenre: (genre: string) => void;
  onSelectPackage: (tier: 'basic' | 'standard' | 'premium') => void;
}

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do readers join ALL GENRES MILLIONS READER?',
    a: 'Readers can register for free through our Join Our Community page, choose their favorite literary genres, join the 2026–2027 Reading Challenge, and track saved books and reflections in their personal Reader Dashboard.',
  },
  {
    q: 'How are featured books and authors selected?',
    a: 'Every book and author profile displayed in our public library undergoes administrative review. Authors submit their book details, cover artwork, and selected 12-month promotional package, and listings are published only after review and approval.',
  },
  {
    q: 'Are author promotional packages one-time payments or subscriptions?',
    a: 'All author promotional packages ($50 Basic, $100 Standard, and $150 Premium) are strictly one-time payments covering a 12-month promotional period. There are no recurring monthly charges.',
  },
  {
    q: 'Does purchasing a promotional package guarantee sales, reviews, or rankings?',
    a: 'No. Promotional packages provide structured visibility on the platform for 12 months upon editorial approval. We never promise guaranteed book sales, guaranteed reader numbers, or guaranteed reviews and rankings.',
  },
  {
    q: 'How can I contact the ALL GENRES MILLIONS READER team?',
    a: 'You may reach our Official Representative, Joseph Goodluck, directly via email at joseph.g@aurorametros.com or submit an inquiry on our Contact Us page.',
  },
];

export function HomePage({ onNavigate, onSelectGenre, onSelectPackage }: HomePageProps) {
  const { siteSettings } = useAuth();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [approvedBooks, approvedAuthors] = await Promise.all([
          fetchApprovedBooks(),
          fetchApprovedAuthors(),
        ]);
        if (mounted) {
          setBooks(approvedBooks.slice(0, 4));
          setAuthors(approvedAuthors.slice(0, 3));
        }
      } catch (err) {
        console.warn('Home catalog notice:', err);
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const getPrice = (tier: 'basic' | 'standard' | 'premium') => {
    if (tier === 'basic') return siteSettings.basicPriceUsd;
    if (tier === 'standard') return siteSettings.standardPriceUsd;
    return siteSettings.premiumPriceUsd;
  };

  return (
    <div>
      {/* 1. Hero Section */}
      <section className="relative bg-[#320C18] overflow-hidden border-b border-[#C6A15B]/25">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="/src/assets/images/hero_literary_salon_1794963329014.jpg"
            alt="International literary library salon with warm golden reading lamps and hardcover books"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#242126]/95 via-[#320C18]/85 to-[#242126]/55" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-xs tracking-[0.2em] uppercase text-[#C6A15B] font-semibold mb-4">
              International Reading Community · All Literary Genres
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[58px] font-bold leading-[1.08] tracking-tight text-[#F3EBDD] [text-wrap:balance]">
              {siteSettings.heroHeadline}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-[#F3EBDD]/85 leading-relaxed max-w-2xl">
              {siteSettings.heroSupportingText}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/join')}
                className="px-6 py-3.5 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#DFC389] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <span>JOIN OUR COMMUNITY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/submit-book')}
                className="px-6 py-3.5 border border-[#C6A15B]/60 bg-[#4A1425]/70 text-[#F3EBDD] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#4A1425] hover:border-[#C6A15B] transition-colors whitespace-nowrap"
              >
                FEATURE YOUR BOOK
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Community Announcement Banner (Admin Editable) */}
      {siteSettings.communityAnnouncement && (
        <section className="bg-[#4A1425] border-b border-[#C6A15B]/25">
          <div className="max-w-[1280px] mx-auto px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <p className="text-[#F3EBDD]/90 leading-snug">
              <span className="text-[#C6A15B] font-semibold mr-2">Community Notice:</span>
              {siteSettings.communityAnnouncement}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/reading-challenge')}
              className="text-xs font-semibold text-[#C6A15B] hover:text-[#DFC389] underline underline-offset-4 whitespace-nowrap self-start sm:self-auto"
            >
              Explore Reading Challenge
            </button>
          </div>
        </section>
      )}

      {/* 2. Discover a World of Stories (Warm Cream Content Section) */}
      <section className="bg-[#F3EBDD] text-[#242126] py-20 border-b border-[#4A1425]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.18em] uppercase text-[#4A1425] font-semibold mb-2">
              Twelve Celebrated Literary Traditions
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1425] [text-wrap:balance]">
              Discover a World of Stories
            </h2>
            <p className="mt-4 text-base text-[#242126]/80 leading-relaxed">
              ALL GENRES MILLIONS READER welcomes readers and writers from every corner of storytelling—from intimate poetry and literary fiction to speculative worlds, historical chronicles, and inspiring nonfiction.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {LITERARY_GENRES.map((genre, index) => (
              <button
                key={genre}
                type="button"
                onClick={() => onSelectGenre(genre)}
                className="group text-left p-5 bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md hover:border-[#4A1425]/45 hover:bg-white transition-all duration-150"
              >
                <span className="text-xs font-mono tabular-nums text-[#4A1425]/60">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 font-serif text-xl font-semibold text-[#4A1425] group-hover:text-[#320C18]">
                  {genre}
                </h3>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#4A1425]/75 group-hover:text-[#4A1425]">
                  Browse Genre <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Current Reading Challenge */}
      <section className="bg-[#242126] text-[#F3EBDD] py-20 border-b border-[#C6A15B]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 overflow-hidden rounded-md border border-[#C6A15B]/25">
              <ImageWithFallback
                src="/src/assets/images/reading_challenge_study_1794963328598.jpg"
                alt="Reading journal, brass bookmark, and stacked clothbound books in golden window light"
                className="w-full h-full min-h-[300px] object-cover"
              />
            </div>
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-3">
                Annual Community Initiative
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3EBDD] [text-wrap:balance]">
                {siteSettings.challengeTitle}
              </h2>
              <p className="mt-4 text-base text-[#F3EBDD]/80 leading-relaxed">
                {siteSettings.challengeIntro}
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-[#F3EBDD]/85">
                <li className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Explore diverse genres and set personal reading goals at your own pace.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Feather className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Share thoughtful reflections, recommendations, and honest reader reviews.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <BookOpen className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                  <span>Track selected titles inside your personal Reader Dashboard.</span>
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/reading-challenge')}
                  className="px-5 py-3 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.06em] uppercase rounded-md hover:bg-[#DFC389] transition-colors"
                >
                  View Challenge Guidelines
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/join')}
                  className="px-5 py-3 border border-[#C6A15B]/45 text-[#F3EBDD] text-xs font-semibold tracking-[0.06em] uppercase rounded-md hover:bg-[#4A1425] transition-colors"
                >
                  Register as a Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Books */}
      <section className="bg-[#2E2A31] text-[#F3EBDD] py-20 border-b border-[#C6A15B]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
                Curated Literary Catalogue
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
                Featured Books
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="text-sm font-medium text-[#C6A15B] hover:text-[#DFC389] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Explore Full Library</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {loadingCatalog ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-96 rounded-md bg-[#242126] border border-[#C6A15B]/15 animate-pulse" />
              ))}
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {books.map((book) => (
                <article
                  key={book.id}
                  onClick={() => onNavigate(`/books/${book.id}`)}
                  className="cursor-pointer group bg-[#242126] border border-[#C6A15B]/20 rounded-md overflow-hidden hover:border-[#C6A15B]/60 transition-colors flex flex-col"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#320C18]">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={`Cover of ${book.title} by ${book.authorName}`}
                      fallbackTitle={book.title}
                      fallbackSubtitle={book.authorName}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs text-[#C6A15B] tracking-wide">
                      {book.genre}
                    </p>
                    <h3 className="mt-1.5 font-serif text-xl font-bold text-[#F3EBDD] line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-sm text-[#F3EBDD]/75">
                      by {book.authorName}
                    </p>
                    <p className="mt-3 text-xs text-[#F3EBDD]/65 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[#242126] border border-[#C6A15B]/25 rounded-md p-10 text-center max-w-3xl mx-auto">
              <BookOpen className="w-10 h-10 text-[#C6A15B] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-2xl font-bold text-[#F3EBDD]">
                Curated Featured Books Library
              </h3>
              <p className="mt-3 text-sm text-[#F3EBDD]/75 leading-relaxed max-w-xl mx-auto">
                Only administrator-approved books submitted by authors or curated by our editorial board appear in the library. Submissions are currently open for upcoming featured placements.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-book')}
                  className="px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors"
                >
                  Submit a Book for Review
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="px-5 py-2.5 border border-[#C6A15B]/40 text-[#F3EBDD] text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-[#4A1425] transition-colors"
                >
                  Open Book Library
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Featured Authors */}
      <section className="bg-[#F3EBDD] text-[#242126] py-20 border-b border-[#4A1425]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.18em] uppercase text-[#4A1425] font-semibold mb-2">
                Voices Across Genres
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1425]">
                Featured Authors
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/authors')}
              className="text-sm font-semibold text-[#4A1425] hover:text-[#320C18] inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>View Author Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {authors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {authors.map((author) => (
                <article
                  key={author.id}
                  onClick={() => onNavigate(`/authors/${author.id}`)}
                  className="cursor-pointer bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md overflow-hidden hover:border-[#4A1425]/50 transition-colors flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#4A1425]">
                    <ImageWithFallback
                      src={author.photoUrl}
                      alt={`Portrait of author ${author.name}`}
                      fallbackTitle={author.name}
                      fallbackSubtitle={author.genre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs font-medium text-[#4A1425]/75">{author.genre}</p>
                    <h3 className="mt-1 font-serif text-2xl font-bold text-[#4A1425]">
                      {author.name}
                    </h3>
                    <p className="mt-3 text-sm text-[#242126]/80 line-clamp-3 leading-relaxed">
                      {author.biography}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-10 text-center max-w-3xl mx-auto">
              <Users className="w-10 h-10 text-[#4A1425] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="font-serif text-2xl font-bold text-[#4A1425]">
                Author Spotlight Directory
              </h3>
              <p className="mt-3 text-sm text-[#242126]/80 leading-relaxed max-w-xl mx-auto">
                Featured author profiles—including biographies, official websites, and book links—are published here after editorial review and Standard or Premium package approval.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/packages')}
                className="mt-6 px-5 py-2.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors"
              >
                Explore Author Packages
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 6. How the Community Works */}
      <section className="bg-[#242126] text-[#F3EBDD] py-20 border-b border-[#C6A15B]/15">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
              Two Pathways, One Literary Home
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
              How the Community Works
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#2E2A31] border border-[#C6A15B]/20 rounded-md p-8">
              <h3 className="font-serif text-2xl font-bold text-[#C6A15B]">For Readers</h3>
              <ol className="mt-5 space-y-3.5 text-sm text-[#F3EBDD]/85">
                <li>01. Join the reading community for free and select your favorite genres.</li>
                <li>02. Discover curated books across twelve diverse literary categories.</li>
                <li>03. Explore featured author biographies and official links.</li>
                <li>04. Participate in the 2026–2027 Reading Challenge at your own pace.</li>
                <li>05. Track saved books and share personal reading reflections.</li>
              </ol>
              <button
                type="button"
                onClick={() => onNavigate('/join')}
                className="mt-7 px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389] transition-colors"
              >
                Join as a Reader
              </button>
            </div>

            <div className="bg-[#320C18] border border-[#C6A15B]/25 rounded-md p-8">
              <h3 className="font-serif text-2xl font-bold text-[#C6A15B]">For Authors</h3>
              <ol className="mt-5 space-y-3.5 text-sm text-[#F3EBDD]/85">
                <li>01. Prepare your book details, synopsis, cover artwork, and purchase link.</li>
                <li>02. Select a one-time 12-month promotional package ($50, $100, or $150).</li>
                <li>03. Complete the verified one-time payment checkout process.</li>
                <li>04. Receive your submission reference while our editorial team reviews your work.</li>
                <li>05. Upon approval, your featured listing goes live for 12 months.</li>
              </ol>
              <button
                type="button"
                onClick={() => onNavigate('/how-it-works')}
                className="mt-7 px-5 py-2.5 border border-[#C6A15B]/55 text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425] transition-colors"
              >
                Read Submission Process
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Author Promotion Opportunities */}
      <section className="bg-[#4A1425] text-[#F3EBDD] py-20 border-b border-[#C6A15B]/20">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="max-w-3xl mb-12">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
              12-Month One-Time Promotional Packages
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#F3EBDD]">
              Author Promotion Opportunities
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#F3EBDD]/80 leading-relaxed">
              Every package is a single one-time payment for a 12-month promotional period—no recurring monthly charges. All submissions are subject to review and approval before publication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AUTHOR_PACKAGES.map((pkg) => {
              const price = getPrice(pkg.id);
              const isFeatured = pkg.id === 'standard';
              return (
                <div
                  key={pkg.id}
                  className={`rounded-md p-7 flex flex-col justify-between border ${
                    isFeatured
                      ? 'bg-[#242126] border-[#C6A15B]'
                      : 'bg-[#320C18] border-[#C6A15B]/25'
                  }`}
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-[#C6A15B]/20">
                      <h3 className="font-serif text-2xl font-bold text-[#F3EBDD]">
                        {pkg.name}
                      </h3>
                      <span className="font-serif text-3xl font-bold text-[#C6A15B] tabular-nums">
                        ${price}
                      </span>
                    </div>
                    <p className="mt-3 text-xs text-[#C6A15B]">
                      One-time payment · 12-month promotional period
                    </p>
                    <ul className="mt-5 space-y-2.5 text-sm text-[#F3EBDD]/85">
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
                    className="mt-8 w-full py-3 px-4 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#DFC389] transition-colors"
                  >
                    SELECT THIS PACKAGE
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Reader Registration CTA + 9. FAQ */}
      <section className="bg-[#F3EBDD] text-[#242126] py-20">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Reader Registration Invitation */}
          <div className="lg:col-span-5 bg-[#4A1425] text-[#F3EBDD] p-8 sm:p-10 rounded-md">
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold">
              Reader Membership
            </p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-[#F3EBDD]">
              Create Your Reader Profile
            </h2>
            <p className="mt-4 text-sm text-[#F3EBDD]/85 leading-relaxed">
              Save your favorite genres, bookmark featured books, join the 2026–2027 Reading Challenge, and record your reading journey in a dedicated dashboard.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/join')}
              className="mt-7 w-full py-3.5 px-5 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#DFC389] transition-colors"
            >
              JOIN OUR COMMUNITY
            </button>
          </div>

          {/* FAQ Accordion */}
          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.18em] uppercase text-[#4A1425] font-semibold mb-2">
              Questions &amp; Answers
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1425] mb-6">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-[#4A1425]/15 border-y border-[#4A1425]/15">
              {FAQS.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={item.q} className="py-4">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between gap-4 text-left py-1"
                      aria-expanded={isOpen}
                    >
                      <span className="font-serif text-xl font-semibold text-[#4A1425]">
                        {item.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#4A1425] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#4A1425] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-sm text-[#242126]/80 leading-relaxed pr-8">
                        {item.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
