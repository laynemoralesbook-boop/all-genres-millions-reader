import React, { useEffect, useState } from 'react';
import { CheckCircle2, UserPlus } from 'lucide-react';
import { ensureReaderProfile, useAuth } from '../context/AuthContext';
import { LITERARY_GENRES } from '../types/models';

export function JoinCommunityPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, profile, refreshProfile, signInWithGoogle } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([]);
  const [readingInterests, setReadingInterests] = useState('');
  const [readingGoalBooks, setReadingGoalBooks] = useState(12);
  const [challengeJoined, setChallengeJoined] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setEmail(profile.email || '');
      setCountry(profile.country || '');
      setFavoriteGenres(profile.favoriteGenres || []);
      setReadingInterests(profile.readingInterests || '');
      setReadingGoalBooks(profile.readingGoalBooks ?? 12);
      setChallengeJoined(profile.challengeJoined ?? true);
    } else if (user) {
      if (!fullName && user.displayName) setFullName(user.displayName);
      if (!email && user.email) setEmail(user.email);
    }
  }, [profile, user, fullName, email]);

  const toggleGenre = (genre: string) => {
    setFavoriteGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre].slice(0, 12)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    try {
      let currentUser = user;
      if (!currentUser) {
        currentUser = await signInWithGoogle();
        if (!currentUser) {
          setErrorMsg('Google authentication is required to create your secure reader account.');
          setSaving(false);
          return;
        }
      }

      await ensureReaderProfile(currentUser, {
        fullName: fullName.trim() || currentUser.displayName || 'Reader',
        email: email.trim() || currentUser.email || '',
        country: country.trim(),
        favoriteGenres,
        readingInterests: readingInterests.trim(),
        readingGoalBooks: Number(readingGoalBooks) || 12,
        challengeJoined,
      });

      await refreshProfile();
      setSavedSuccess(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save reader registration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Reader Membership
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Join Our Community
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/85 max-w-2xl leading-relaxed">
            Create your ALL GENRES MILLIONS READER profile to bookmark featured books, track your 2026–2027 Reading Challenge progress, and receive community announcements.
          </p>
        </div>
      </section>

      <section className="bg-[#F3EBDD] text-[#242126] py-16">
        <div className="max-w-[960px] mx-auto px-6">
          {savedSuccess ? (
            <div className="bg-[#FAF6EE] border border-[#4A1425]/25 rounded-md p-10 text-center space-y-5">
              <CheckCircle2 className="w-12 h-12 text-[#4A1425] mx-auto" />
              <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
                Welcome to ALL GENRES MILLIONS READER
              </h2>
              <p className="text-base text-[#242126]/80 max-w-lg mx-auto">
                Your reader profile has been saved securely. You can now manage your favorite genres, saved books, and 2026–2027 Reading Challenge progress inside your Reader Dashboard.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/reader-dashboard')}
                  className="px-6 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors"
                >
                  Open Reader Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/books')}
                  className="px-6 py-3 border border-[#4A1425]/35 text-[#4A1425] text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Browse Featured Books
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 sm:p-10 space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#4A1425]/15">
                <div>
                  <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
                    Reader Registration
                  </h2>
                  <p className="text-xs text-[#242126]/70 mt-1">
                    {user
                      ? `Signed in securely as ${user.email}`
                      : 'Sign in with Google or submit below to authenticate and create your profile.'}
                  </p>
                </div>
                {!user ? (
                  <button
                    type="button"
                    onClick={() => void signInWithGoogle()}
                    className="px-4 py-2.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] inline-flex items-center gap-2 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign In with Google</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate('/reader-dashboard')}
                    className="text-xs font-semibold text-[#4A1425] underline shrink-0"
                  >
                    Go to Reader Dashboard
                  </button>
                )}
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-md text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
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
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Personal Reading Goal (Books)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={readingGoalBooks}
                    onChange={(e) => setReadingGoalBooks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-2">
                  Favorite Genres
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {LITERARY_GENRES.map((genre) => {
                    const selected = favoriteGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        className={`px-3 py-2 rounded-md text-xs font-medium text-left border transition-colors ${
                          selected
                            ? 'bg-[#4A1425] text-[#F3EBDD] border-[#4A1425]'
                            : 'bg-white text-[#242126] border-[#4A1425]/20 hover:border-[#4A1425]'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                  Reading Interests
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={readingInterests}
                  onChange={(e) => setReadingInterests(e.target.value)}
                  placeholder="Share the themes, authors, or types of stories you enjoy discovering..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
                />
              </div>

              <label className="flex items-center gap-3 text-sm text-[#242126]/85 cursor-pointer">
                <input
                  type="checkbox"
                  checked={challengeJoined}
                  onChange={(e) => setChallengeJoined(e.target.checked)}
                  className="h-4 w-4 accent-[#4A1425]"
                />
                <span>Include my profile in the 2026–2027 Reading Challenge</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 px-6 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#320C18] disabled:opacity-60 transition-colors"
              >
                {saving ? 'Saving Profile...' : profile ? 'Update Reader Profile' : 'Complete Reader Registration'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
