import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, Globe, Search, Users } from 'lucide-react';
import { fetchApprovedAuthors, fetchApprovedBooks, fetchAuthorById } from '../lib/firestoreData';
import { LITERARY_GENRES, type AuthorProfile, type BookListing } from '../types/models';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface FeaturedAuthorsPageProps {
  authorId?: string;
  onNavigate: (path: string) => void;
}

export function FeaturedAuthorsPage({ authorId, onNavigate }: FeaturedAuthorsPageProps) {
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [books, setBooks] = useState<BookListing[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('All');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (authorId) {
          const single = await fetchAuthorById(authorId);
          if (mounted) setSelectedAuthor(single);
        } else {
          setSelectedAuthor(null);
        }
        const [authorList, bookList] = await Promise.all([
          fetchApprovedAuthors(),
          fetchApprovedBooks(),
        ]);
        if (mounted) {
          setAuthors(authorList);
          setBooks(bookList);
        }
      } catch (err) {
        console.warn('Authors load notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [authorId]);

  const filteredAuthors = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return authors.filter((a) => {
      const matchesGenre = genreFilter === 'All' || a.genre === genreFilter;
      const matchesSearch =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.biography.toLowerCase().includes(q) ||
        a.genre.toLowerCase().includes(q);
      return matchesGenre && matchesSearch;
    });
  }, [authors, genreFilter, searchTerm]);

  if (authorId) {
    if (loading) {
      return (
        <div className="max-w-[1100px] mx-auto px-6 py-20">
          <div className="h-96 bg-[#2E2A31] rounded-md animate-pulse" />
        </div>
      );
    }

    if (!selectedAuthor) {
      return (
        <div className="max-w-[900px] mx-auto px-6 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#F3EBDD]">Author Profile Not Found</h1>
          <p className="mt-3 text-sm text-[#F3EBDD]/75">
            This author profile is unavailable or awaiting administrative approval.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/authors')}
            className="mt-6 px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md"
          >
            Back to Featured Authors
          </button>
        </div>
      );
    }

    const authorBooks = books.filter(
      (b) =>
        b.authorId === selectedAuthor.id ||
        b.authorName.toLowerCase() === selectedAuthor.name.toLowerCase()
    );

    return (
      <div className="bg-[#F3EBDD] text-[#242126] py-14 lg:py-20">
        <div className="max-w-[1120px] mx-auto px-6 space-y-12">
          <button
            type="button"
            onClick={() => onNavigate('/authors')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#4A1425] hover:text-[#320C18]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Featured Authors</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md p-6 sm:p-10">
            <div className="md:col-span-4 aspect-[4/5] overflow-hidden rounded-md border border-[#4A1425]/20 bg-[#4A1425]">
              <ImageWithFallback
                src={selectedAuthor.photoUrl}
                alt={`Author portrait of ${selectedAuthor.name}`}
                fallbackTitle={selectedAuthor.name}
                fallbackSubtitle={selectedAuthor.genre}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-8 space-y-5">
              <p className="text-xs font-medium text-[#4A1425]/80">
                {selectedAuthor.genre}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#4A1425]">
                {selectedAuthor.name}
              </h1>
              <div className="text-base text-[#242126]/85 leading-relaxed whitespace-pre-line max-w-prose">
                {selectedAuthor.biography}
              </div>

              <div className="pt-4 border-t border-[#4A1425]/15 space-y-2 text-sm">
                {selectedAuthor.website && (
                  <p>
                    <span className="font-semibold text-[#4A1425] mr-2">Official Website:</span>
                    <a
                      href={selectedAuthor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4A1425] underline inline-flex items-center gap-1"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>{selectedAuthor.website}</span>
                    </a>
                  </p>
                )}
                {selectedAuthor.socialLinks && (
                  <p className="text-[#242126]/80">
                    <span className="font-semibold text-[#4A1425] mr-2">Social Media:</span>
                    {selectedAuthor.socialLinks}
                  </p>
                )}
                {selectedAuthor.purchaseLinks && (
                  <p className="text-[#242126]/80">
                    <span className="font-semibold text-[#4A1425] mr-2">Book Purchase Links:</span>
                    {selectedAuthor.purchaseLinks}
                  </p>
                )}
              </div>
            </div>
          </div>

          {authorBooks.length > 0 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#4A1425] mb-6">
                Featured Books by {selectedAuthor.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {authorBooks.map((book) => (
                  <article
                    key={book.id}
                    onClick={() => onNavigate(`/books/${book.id}`)}
                    className="cursor-pointer bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md overflow-hidden hover:border-[#4A1425]/50 transition-colors"
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
                    <div className="p-4">
                      <h3 className="font-serif text-xl font-bold text-[#4A1425]">{book.title}</h3>
                      <p className="mt-1 text-xs text-[#242126]/70">{book.genre}</p>
                      {book.purchaseLink && (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#4A1425]">
                          View Book <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
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
            Author Directory
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Featured Authors
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/80 max-w-2xl leading-relaxed">
            Meet the approved authors featured in ALL GENRES MILLIONS READER. Explore author biographies, featured books, official websites, and purchase links.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-7 relative">
              <Search className="w-4 h-4 text-[#C6A15B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search featured authors..."
                aria-label="Search featured authors"
                className="w-full pl-10 pr-4 py-3 bg-[#242126] border border-[#C6A15B]/30 rounded-md text-sm text-[#F3EBDD] placeholder:text-[#F3EBDD]/45 focus:outline-none focus:border-[#C6A15B]"
              />
            </div>
            <div className="md:col-span-5">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                aria-label="Filter authors by genre"
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

      {/* Author Grid */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 min-h-[420px]">
        <div className="max-w-[1280px] mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-80 bg-[#E6DAC6] rounded-md animate-pulse" />
              ))}
            </div>
          ) : filteredAuthors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredAuthors.map((author) => (
                <article
                  key={author.id}
                  onClick={() => onNavigate(`/authors/${author.id}`)}
                  className="cursor-pointer bg-[#FAF6EE] border border-[#4A1425]/15 rounded-md overflow-hidden hover:border-[#4A1425]/55 transition-colors flex flex-col"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#4A1425]">
                    <ImageWithFallback
                      src={author.photoUrl}
                      alt={`Portrait of ${author.name}`}
                      fallbackTitle={author.name}
                      fallbackSubtitle={author.genre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium text-[#4A1425]/75">{author.genre}</p>
                      <h2 className="mt-1 font-serif text-2xl font-bold text-[#4A1425]">
                        {author.name}
                      </h2>
                      <p className="mt-3 text-sm text-[#242126]/80 line-clamp-3 leading-relaxed">
                        {author.biography}
                      </p>
                    </div>
                    <p className="mt-4 pt-3 border-t border-[#4A1425]/10 text-xs font-semibold text-[#4A1425]">
                      View Author Profile
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-12 text-center max-w-2xl mx-auto">
              <Users className="w-10 h-10 text-[#4A1425] mx-auto mb-4" strokeWidth={1.5} />
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                No Featured Authors Published Yet
              </h2>
              <p className="mt-3 text-sm text-[#242126]/80 leading-relaxed">
                Author spotlight profiles appear here after editorial review and Standard or Premium package approval.
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
    </div>
  );
}
