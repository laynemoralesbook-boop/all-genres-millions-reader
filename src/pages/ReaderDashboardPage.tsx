import React, { useEffect, useState } from 'react';
import { BookOpen, CheckCircle2, Compass, Plus, Trash2 } from 'lucide-react';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { ensureReaderProfile, useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { fetchApprovedBooks, fetchUserReadingProgress, fetchUserSubmissions } from '../lib/firestoreData';
import { generateSafeId } from '../lib/imageUtils';
import {
  LITERARY_GENRES,
  type AuthorSubmission,
  type BookListing,
  type ReadingProgressItem,
} from '../types/models';

export function ReaderDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, profile, siteSettings, signInWithGoogle, refreshProfile } = useAuth();
  const [books, setBooks] = useState<BookListing[]>([]);
  const [progressItems, setProgressItems] = useState<ReadingProgressItem[]>([]);
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [readingInterests, setReadingInterests] = useState('');
  const [readingGoalBooks, setReadingGoalBooks] = useState(12);
  const [booksReadCount, setBooksReadCount] = useState(0);
  const [challengeJoined, setChallengeJoined] = useState(false);
  const [challengeNotes, setChallengeNotes] = useState('');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const [newLogTitle, setNewLogTitle] = useState('');
  const [newLogStatus, setNewLogStatus] = useState<'want_to_read' | 'reading' | 'completed'>('reading');
  const [newLogPercent, setNewLogPercent] = useState(25);
  const [newLogReflection, setNewLogReflection] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName);
      setCountry(profile.country);
      setFavoriteGenres(profile.favoriteGenres || []);
      setReadingInterests(profile.readingInterests || '');
      setReadingGoalBooks(profile.readingGoalBooks ?? 12);
      setBooksReadCount(profile.booksReadCount ?? 0);
      setChallengeJoined(profile.challengeJoined ?? false);
      setChallengeNotes(profile.challengeNotes || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const [approvedBooks, userProgress, userSubs] = await Promise.all([
          fetchApprovedBooks(),
          fetchUserReadingProgress(user.uid),
          fetchUserSubmissions(user.uid),
        ]);
        if (mounted) {
          setBooks(approvedBooks);
          setProgressItems(userProgress);
          setSubmissions(userSubs);
        }
      } catch (err) {
        console.warn('Reader dashboard load notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="bg-[#F3EBDD] text-[#242126] py-24 px-6">
        <div className="max-w-lg mx-auto bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-10 text-center space-y-5">
          <h1 className="font-serif text-3xl font-bold text-[#4A1425]">
            Reader Dashboard Access
          </h1>
          <p className="text-sm text-[#242126]/80 leading-relaxed">
            Please sign in with your Google account to access your reader profile, saved books, reading progress, and community announcements.
          </p>
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="px-6 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18]"
          >
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  const savedBooks = books.filter((b) => profile?.savedBookIds?.includes(b.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveFeedback(null);
    await ensureReaderProfile(user, {
      fullName: fullName.trim() || user.displayName || 'Reader',
      country: country.trim(),
      favoriteGenres,
      readingInterests: readingInterests.trim(),
      readingGoalBooks: Number(readingGoalBooks) || 0,
      booksReadCount: Number(booksReadCount) || 0,
      challengeJoined,
      challengeNotes: challengeNotes.trim(),
    });
    await refreshProfile();
    setSaveFeedback('Reader profile and reading challenge preferences updated.');
  };

  const handleAddProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogTitle.trim()) return;
    const progressId = generateSafeId('prog');
    const payload = {
      userId: user.uid,
      bookId: 'custom_reading_entry',
      bookTitle: newLogTitle.trim(),
      status: newLogStatus,
      progressPercent: Number(newLogPercent) || 0,
      reflection: newLogReflection.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, 'reading_progress', progressId), payload);
      setProgressItems((prev) => [{ id: progressId, ...payload }, ...prev]);
      setNewLogTitle('');
      setNewLogReflection('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reading_progress/${progressId}`);
    }
  };

  const handleDeleteProgress = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reading_progress', id));
      setProgressItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reading_progress/${id}`);
    }
  };

  return (
    <div className="bg-[#F3EBDD] text-[#242126] py-14">
      <div className="max-w-[1280px] mx-auto px-6 space-y-10">
        {/* Header */}
        <div className="bg-[#4A1425] text-[#F3EBDD] rounded-md p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold">
              Reader Dashboard
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-bold">
              Welcome, {profile?.fullName || user.displayName || 'Reader'}
            </h1>
            <p className="mt-1 text-sm text-[#F3EBDD]/75">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/books')}
              className="px-4 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#DFC389]"
            >
              Discover Books
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/reading-challenge')}
              className="px-4 py-2.5 border border-[#C6A15B]/50 text-[#F3EBDD] text-xs font-semibold uppercase tracking-wider rounded-md"
            >
              2026–2027 Challenge
            </button>
          </div>
        </div>

        {/* Community Announcements */}
        {siteSettings.communityAnnouncement && (
          <div className="bg-[#242126] text-[#F3EBDD] border border-[#C6A15B]/30 rounded-md p-6">
            <p className="text-xs tracking-[0.16em] uppercase text-[#C6A15B] font-semibold mb-1.5">
              Community Announcement
            </p>
            <p className="text-sm leading-relaxed text-[#F3EBDD]/90">
              {siteSettings.communityAnnouncement}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Profile & Reading Challenge Preferences */}
          <form
            onSubmit={(e) => void handleSaveProfile(e)}
            className="lg:col-span-6 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-7 space-y-5"
          >
            <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
              Profile &amp; Favorite Genres
            </h2>

            {saveFeedback && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4A1425] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#4A1425] mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A1425] mb-2">
                Favorite Genres
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LITERARY_GENRES.map((genre) => {
                  const selected = favoriteGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() =>
                        setFavoriteGenres((prev) =>
                          prev.includes(genre)
                            ? prev.filter((g) => g !== genre)
                            : [...prev, genre].slice(0, 12)
                        )
                      }
                      className={`px-2.5 py-1.5 rounded text-xs text-left border ${
                        selected
                          ? 'bg-[#4A1425] text-[#F3EBDD] border-[#4A1425]'
                          : 'bg-white text-[#242126] border-[#4A1425]/20'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                Reading Interests
              </label>
              <textarea
                rows={2}
                value={readingInterests}
                onChange={(e) => setReadingInterests(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
              />
            </div>

            <div className="pt-3 border-t border-[#4A1425]/15 space-y-4">
              <div className="flex items-center gap-2 text-[#4A1425]">
                <Compass className="w-4 h-4" />
                <h3 className="font-serif text-xl font-bold">Reading Challenge Tracker</h3>
              </div>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={challengeJoined}
                  onChange={(e) => setChallengeJoined(e.target.checked)}
                  className="h-4 w-4 accent-[#4A1425]"
                />
                <span>Participating in the 2026–2027 Reading Challenge</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Personal Goal (Books)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={readingGoalBooks}
                    onChange={(e) => setReadingGoalBooks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Books Completed
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10000}
                    value={booksReadCount}
                    onChange={(e) => setBooksReadCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                  Challenge Reflections
                </label>
                <textarea
                  rows={2}
                  value={challengeNotes}
                  onChange={(e) => setChallengeNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18]"
            >
              Save Profile &amp; Challenge Settings
            </button>
          </form>

          {/* Saved Books & Reading Progress */}
          <div className="lg:col-span-6 space-y-8">
            {/* Saved Books */}
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-7 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                Saved Books ({savedBooks.length})
              </h2>
              {loading ? (
                <p className="text-sm text-[#242126]/65">Loading saved books...</p>
              ) : savedBooks.length > 0 ? (
                <div className="space-y-3">
                  {savedBooks.map((book) => (
                    <div
                      key={book.id}
                      onClick={() => onNavigate(`/books/${book.id}`)}
                      className="cursor-pointer p-3.5 bg-white border border-[#4A1425]/15 rounded-md flex items-center justify-between gap-3 hover:border-[#4A1425]/50"
                    >
                      <div>
                        <p className="font-serif text-lg font-bold text-[#4A1425]">{book.title}</p>
                        <p className="text-xs text-[#242126]/75">
                          {book.authorName} · {book.genre}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-[#4A1425]">View</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 bg-white border border-[#4A1425]/15 rounded-md text-center">
                  <BookOpen className="w-6 h-6 text-[#4A1425]/60 mx-auto mb-2" />
                  <p className="text-xs text-[#242126]/75">
                    You have not saved any featured books yet. Browse our Featured Books library to bookmark titles.
                  </p>
                </div>
              )}
            </div>

            {/* Reading Progress Log */}
            <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-7 space-y-5">
              <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                Reading Progress Log
              </h2>

              <form onSubmit={(e) => void handleAddProgress(e)} className="space-y-3 p-4 bg-white border border-[#4A1425]/15 rounded-md">
                <p className="text-xs font-semibold text-[#4A1425] uppercase tracking-wider">
                  Add Reading Entry
                </p>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={newLogTitle}
                  onChange={(e) => setNewLogTitle(e.target.value)}
                  placeholder="Book title you are reading..."
                  className="w-full px-3 py-2 border border-[#4A1425]/25 rounded text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newLogStatus}
                    onChange={(e) =>
                      setNewLogStatus(e.target.value as 'want_to_read' | 'reading' | 'completed')
                    }
                    className="px-3 py-2 border border-[#4A1425]/25 rounded text-sm"
                  >
                    <option value="want_to_read">Want to Read</option>
                    <option value="reading">Currently Reading</option>
                    <option value="completed">Completed</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newLogPercent}
                    onChange={(e) => setNewLogPercent(Number(e.target.value))}
                    placeholder="Progress %"
                    className="px-3 py-2 border border-[#4A1425]/25 rounded text-sm tabular-nums"
                  />
                </div>
                <textarea
                  rows={2}
                  value={newLogReflection}
                  onChange={(e) => setNewLogReflection(e.target.value)}
                  placeholder="Personal reading notes or honest reflection..."
                  className="w-full px-3 py-2 border border-[#4A1425]/25 rounded text-sm"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Entry</span>
                </button>
              </form>

              {progressItems.length > 0 && (
                <div className="space-y-3">
                  {progressItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-[#4A1425]/15 rounded-md flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="font-serif text-lg font-bold text-[#4A1425]">
                          {item.bookTitle}
                        </p>
                        <p className="text-xs text-[#242126]/70 capitalize">
                          {item.status.replace(/_/g, ' ')} · <span className="tabular-nums">{item.progressPercent}%</span>
                        </p>
                        {item.reflection && (
                          <p className="mt-2 text-xs text-[#242126]/85 leading-relaxed">
                            {item.reflection}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProgress(item.id)}
                        aria-label={`Remove ${item.bookTitle}`}
                        className="text-red-700 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {submissions.length > 0 && (
              <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6">
                <h3 className="font-serif text-xl font-bold text-[#4A1425] mb-3">
                  Your Author Submissions ({submissions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate('/submit-book')}
                  className="text-xs font-semibold text-[#4A1425] underline"
                >
                  Manage Submissions &amp; Payment Status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
