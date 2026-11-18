import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, BookOpen, ExternalLink, Search, User } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { fetchApprovedBooks, fetchBookById } from '../lib/firestoreData';
import { LITERARY_GENRES, type BookListing } from '../types/models';
import { ImageWithFallback } from '../components/ImageWithFallback';
import { ensureReaderProfile } from '../context/AuthContext';

interface FeaturedBooksPageProps {
  bookId?: string;
  initialGenre?: string;
  onNavigate: (path: string) => void;
}

export function FeaturedBooksPage({ bookId, initialGenre, onNavigate }: FeaturedBooksPageProps) {
  const { user, profile, refreshProfile, signInWithGoogle } = useAuth();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>(initialGenre || 'All');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (initialGenre) {
      setGenreFilter(initialGenre);
    }
  }, [initialGenre]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (bookId) {
          const single = await fetchBookById(bookId);
          if (mounted) setSelectedBook(single);
        } else {
          setSelectedBook(null);
        }
        const list = await fetchApprovedBooks();
        if (mounted) setBooks(list);
      } catch (err) {
        console.warn('Books load notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [bookId]);

  const filteredBooks = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return books.filter((b) => {
      const matchesGenre = genreFilter === 'All' || b.genre === genreFilter;
      const matchesSearch =
        !q ||
        b.title.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q) ||
        b.genre.toLowerCase().includes(q);
      return matchesGenre && matchesSearch;
    });
  }, [books, genreFilter, searchTerm]);

  const handleToggleSave = async (targetBookId: string) => {
    setFeedback(null);
    let currentUser = user;
    if (!currentUser) {
      currentUser = await signInWithGoogle();
      if (!currentUser) return;
    }

    setSavingId(targetBookId);
    try {
      const activeProfile = profile || (await ensureReaderProfile(currentUser));
      const existingSaved = activeProfile.savedBookIds || [];
      const isSaved = existingSaved.includes(targetBookId);
      const nextSaved = isSaved
        ? existingSaved.filter((id) => id !== targetBookId)
        : [...existingSaved, targetBookId].slice(0, 50);

      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          ...activeProfile,
          savedBookIds: nextSaved,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await refreshProfile();
      setFeedback(isSaved ? 'Removed from your saved reading list.' : 'Book saved to your Reader Dashboard.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    } finally {
      setSavingId(null);
    }
  };

  if (bookId) {
    if (loading) {
      return (
        <div className="max-w-[1100px] mx-auto px-6 py-20">
          <div className="h-96 bg-[#2E2A31] rounded-md animate-pulse" />
        </div>
      );
    }

    if (!selectedBook) {
      return (
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#F3EBDD]">Book Not Found</h1>
          <p className="mt-3 text-sm text-[#F3EBDD]/75">
            This book listing may have been removed or is not currently approved for public display.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/books')}
            className="mt-6 px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md"
          >
            Back to Featured Books
          </button>
        </div>
      );
    }

    const isSaved = Boolean(profile?.savedBookIds?.includes(selectedBook.id));

    return (
      <div className="bg-[#F3EBDD] text-[#242126] py-14 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-6">
          <button
            type="button"
            onClick={() => onNavigate('/books')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A1425] hover:text-[#320C18] mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Featured Books Library</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md p-6 sm:p-10">
            <div className="md:col-span-4 aspect-[3/4] overflow-hidden rounded-md border border-[#4A1425]/20 bg-[#320C18]">
              <ImageWithFallback
                src={selectedBook.coverUrl}
                alt={`Cover of ${selectedBook.title}`}
                fallbackTitle={selectedBook.title}
                fallbackSubtitle={selectedBook.authorName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-8 space-y-5">
              <div className="text-xs font-medium text-[#4A1425]/80 flex flex-wrap items-center gap-2">
                <span>{selectedBook.genre}</span>
                {selectedBook.featuredInChallenge && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>2026–2027 Reading Challenge Selection</span>
                  </>
                )}
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1425]">
                {selectedBook.title}
              </h1>

              <p className="text-base text-[#242126]/85">
                By <span className="font-semibold text-[#4A1425]">{selectedBook.authorName}</span>
              </p>

              {selectedBook.publicationInfo && (
                <p className="text-xs text-[#242126]/70 border-y border-[#4A1425]/15 py-2.5">
                  Publication Details: {selectedBook.publicationInfo}
                </p>
              )}

              <div className="text-base text-[#242126]/85 leading-relaxed whitespace-pre-line max-w-prose">
                {selectedBook.description}
              </div>

              {feedback && (
                <p className="text-sm text-[#4A1425] font-medium">{feedback}</p>
              )}

              <div className="pt-4 flex flex-wrap items-center gap-3">
                {selectedBook.purchaseLink && (
                  <a
                    href={selectedBook.purchaseLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors inline-flex items-center gap-2"
                  >
                    <span>Purchase Book</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {selectedBook.authorId && (
                  <button
                    type="button"
                    onClick={() => onNavigate(`/authors/${selectedBook.authorId}`)}
                    className="px-5 py-3 border border-[#4A1425]/35 text-[#4A1425] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425]/5 transition-colors inline-flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span>Author Profile</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={savingId === selectedBook.id}
                  onClick={() => void handleToggleSave(selectedBook.id)}
                  className="px-5 py-3 border border-[#4A1425]/35 text-[#4A1425] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425]/5 transition-colors inline-flex items-center gap-2"
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  <span>{isSaved ? 'Saved in Dashboard' : 'Save Book'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Curated Library
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Featured Books
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/80 max-w-2xl leading-relaxed">
            Explore administrator-approved books across every literary genre. Search by title or author, filter by genre, and save titles to your Reader Dashboard.
          </p>

          {/* Search & Genre Controls */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-[#C6A15B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by book title or author name..."
                aria-label="Search books by title or author"
                className="w-full pl-10 pr-4 py-3 bg-[#242126] border border-[#C6A15B]/30 rounded-md text-sm text-[#F3EBDD] placeholder:text-[#F3EBDD]/45 focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
            <div className="md:col-span-5">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                aria-label="Filter by genre"
                className="w-full px-4 py-3 bg-[#242126] border border-[#C6A15B]/30 rounded-md text-sm text-[#F3EBDD] focus:outline-none focus:border-[#C6A15B]"
              >
                <option value="All">All Genres</option>
                {LITERARY_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Library Grid */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 min-h-[420px]">
        <div className="max-w-[1280px] mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-96 bg-[#E6DAC6] rounded-md animate-pulse" />
              ))}
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <article
                  key={book.id}
                  onClick={() => onNavigate(`/books/${book.id}`)}
                  className="cursor-pointer group bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md overflow-hidden hover:border-[#4A1425]/55 transition-colors flex flex-col"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-[#320C18]">
                    <ImageWithFallback
                      src={book.coverUrl}
                      alt={`Cover of ${book.title}`}
                      fallbackTitle={book.title}
                      fallbackSubtitle={book.authorName}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#4A1425]/75">{book.genre}</p>
                      <h2 className="mt-1.5 font-serif text-xl font-bold text-[#4A1425] line-clamp-2">
                        {book.title}
                      </h2>
                      <p className="mt-1 text-sm text-[#242126]/80">by {book.authorName}</p>
                      <p className="mt-3 text-xs text-[#242126]/70 line-clamp-3 leading-relaxed">
                        {book.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-[#4A1425]/10 flex items-center justify-between text-xs font-semibold text-[#4A1425]">
                      <span>View Book Details</span>
                      {book.purchaseLink && <span>Purchase Available</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-12 text-center max-w-2xl mx-auto">
              <BookOpen className="w-10 h-10 text-[#4A1425] mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                {books.length === 0 ? 'No Approved Books Published Yet' : 'No Matching Books Found'}
              </h2>
              <p className="mt-3 text-sm text-[#242126]/80 leading-relaxed">
                {books.length === 0
                  ? 'All books displayed in the Featured Books library are curated and approved by our administration. Authors may submit their books for editorial review.'
                  : 'Try clearing your search query or selecting a different genre filter.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {books.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setGenreFilter('All');
                    }}
                    className="px-5 py-2.5 border border-[#4A1425]/40 text-[#4A1425] text-xs font-bold uppercase tracking-wider rounded-md"
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-book')}
                  className="px-5 py-2.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors"
                >
                  Feature Your Book
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
