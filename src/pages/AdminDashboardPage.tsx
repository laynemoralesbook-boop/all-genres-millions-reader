import React, { useCallback, useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  CreditCard,
  FileText,
  Mail,
  Plus,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { deleteDoc, doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  deleteAuthorAdmin,
  deleteBookAdmin,
  fetchAllAuthorsAdmin,
  fetchAllBooksAdmin,
  fetchAllMessagesAdmin,
  fetchAllPaymentsAdmin,
  fetchAllReadersAdmin,
  fetchAllSubmissionsAdmin,
  saveAuthorAdmin,
  saveBookAdmin,
  saveSiteSettingsAdmin,
} from '../lib/firestoreData';
import { compressImageFileToDataUrl, generateSafeId } from '../lib/imageUtils';
import {
  LITERARY_GENRES,
  type AuthorProfile,
  type AuthorSubmission,
  type BookListing,
  type ContactMessage,
  type PaymentRecord,
  type SiteSettings,
  type UserProfile,
} from '../types/models';

type AdminTab =
  | 'overview'
  | 'books'
  | 'authors'
  | 'submissions'
  | 'payments'
  | 'readers'
  | 'messages'
  | 'website';

export function AdminDashboardPage() {
  const { user, isAdmin, authLoading, siteSettings, signInWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [books, setBooks] = useState<BookListing[]>([]);
  const [authors, setAuthors] = useState<AuthorProfile[]>([]);
  const [submissions, setSubmissions] = useState<AuthorSubmission[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [readers, setReaders] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Book Editor State
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthorName, setBookAuthorName] = useState('');
  const [bookAuthorId, setBookAuthorId] = useState('');
  const [bookGenre, setBookGenre] = useState<string>(LITERARY_GENRES[0]);
  const [bookDesc, setBookDesc] = useState('');
  const [bookPubInfo, setBookPubInfo] = useState('');
  const [bookPurchaseLink, setBookPurchaseLink] = useState('');
  const [bookCoverUrl, setBookCoverUrl] = useState('');
  const [bookStatus, setBookStatus] = useState<'pending' | 'approved' | 'archived'>('approved');
  const [bookInChallenge, setBookInChallenge] = useState(false);
  const [bookTier, setBookTier] = useState<'basic' | 'standard' | 'premium' | 'editorial'>('basic');
  const [bookPromoStart, setBookPromoStart] = useState('');
  const [bookPromoEnd, setBookPromoEnd] = useState('');

  // Author Editor State
  const [editingAuthorId, setEditingAuthorId] = useState<string | null>(null);
  const [authorName, setAuthorName] = useState('');
  const [authorGenre, setAuthorGenre] = useState<string>(LITERARY_GENRES[0]);
  const [authorBio, setAuthorBio] = useState('');
  const [authorPhotoUrl, setAuthorPhotoUrl] = useState('');
  const [authorWebsite, setAuthorWebsite] = useState('');
  const [authorSocials, setAuthorSocials] = useState('');
  const [authorPurchaseLinks, setAuthorPurchaseLinks] = useState('');
  const [authorStatus, setAuthorStatus] = useState<'pending' | 'approved' | 'archived'>('approved');
  const [authorTier, setAuthorTier] = useState<'standard' | 'premium' | 'editorial'>('standard');

  // Website Management Form State
  const [webSettings, setWebSettings] = useState<Omit<SiteSettings, 'updatedAt'>>({
    heroHeadline: siteSettings.heroHeadline,
    heroSupportingText: siteSettings.heroSupportingText,
    challengeTitle: siteSettings.challengeTitle,
    challengeIntro: siteSettings.challengeIntro,
    challengeGuidelines: siteSettings.challengeGuidelines,
    communityAnnouncement: siteSettings.communityAnnouncement,
    basicPriceUsd: siteSettings.basicPriceUsd,
    standardPriceUsd: siteSettings.standardPriceUsd,
    premiumPriceUsd: siteSettings.premiumPriceUsd,
  });

  useEffect(() => {
    setWebSettings({
      heroHeadline: siteSettings.heroHeadline,
      heroSupportingText: siteSettings.heroSupportingText,
      challengeTitle: siteSettings.challengeTitle,
      challengeIntro: siteSettings.challengeIntro,
      challengeGuidelines: siteSettings.challengeGuidelines,
      communityAnnouncement: siteSettings.communityAnnouncement,
      basicPriceUsd: siteSettings.basicPriceUsd,
      standardPriceUsd: siteSettings.standardPriceUsd,
      premiumPriceUsd: siteSettings.premiumPriceUsd,
    });
  }, [siteSettings]);

  const loadAllAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [b, a, s, p, r, m] = await Promise.all([
        fetchAllBooksAdmin(),
        fetchAllAuthorsAdmin(),
        fetchAllSubmissionsAdmin(),
        fetchAllPaymentsAdmin(),
        fetchAllReadersAdmin(),
        fetchAllMessagesAdmin(),
      ]);
      setBooks(b);
      setAuthors(a);
      setSubmissions(s);
      setPayments(p);
      setReaders(r);
      setMessages(m);
    } catch (err) {
      console.error('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadAllAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin, loadAllAdminData]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  if (authLoading) {
    return (
      <div className="py-24 text-center text-sm text-[#F3EBDD]/75">
        Verifying administrator credentials...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#F3EBDD] text-[#242126] py-24 px-6">
        <div className="max-w-lg mx-auto bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-10 text-center space-y-5">
          <Shield className="w-10 h-10 text-[#4A1425] mx-auto" />
          <h1 className="font-serif text-3xl font-bold text-[#4A1425]">
            Administrator Sign In
          </h1>
          <p className="text-sm text-[#242126]/80">
            Access to the ALL GENRES MILLIONS READER Administration Dashboard requires an authorized administrator account.
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

  if (!isAdmin) {
    return (
      <div className="bg-[#F3EBDD] text-[#242126] py-24 px-6">
        <div className="max-w-lg mx-auto bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-10 text-center space-y-4">
          <Shield className="w-10 h-10 text-[#4A1425] mx-auto" />
          <h1 className="font-serif text-3xl font-bold text-[#4A1425]">
            Authorized Access Only
          </h1>
          <p className="text-sm text-[#242126]/80">
            Your signed-in account ({user.email}) does not hold administrator permissions.
          </p>
        </div>
      </div>
    );
  }

  // Book Handlers
  const resetBookForm = () => {
    setEditingBookId(null);
    setBookTitle('');
    setBookAuthorName('');
    setBookAuthorId('');
    setBookGenre(LITERARY_GENRES[0]);
    setBookDesc('');
    setBookPubInfo('');
    setBookPurchaseLink('');
    setBookCoverUrl('');
    setBookStatus('approved');
    setBookInChallenge(false);
    setBookTier('basic');
    setBookPromoStart('');
    setBookPromoEnd('');
  };

  const handleEditBook = (b: BookListing) => {
    setEditingBookId(b.id);
    setBookTitle(b.title);
    setBookAuthorName(b.authorName);
    setBookAuthorId(b.authorId);
    setBookGenre(b.genre);
    setBookDesc(b.description);
    setBookPubInfo(b.publicationInfo);
    setBookPurchaseLink(b.purchaseLink);
    setBookCoverUrl(b.coverUrl);
    setBookStatus(b.status);
    setBookInChallenge(b.featuredInChallenge);
    setBookTier(b.packageTier);
    setBookPromoStart(b.promoStartDate);
    setBookPromoEnd(b.promoEndDate);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingBookId || generateSafeId('book');
    await saveBookAdmin(
      id,
      {
        title: bookTitle.trim(),
        authorName: bookAuthorName.trim(),
        authorId: bookAuthorId.trim(),
        genre: bookGenre,
        description: bookDesc.trim(),
        publicationInfo: bookPubInfo.trim(),
        purchaseLink: bookPurchaseLink.trim(),
        coverUrl: bookCoverUrl.trim(),
        status: bookStatus,
        featuredInChallenge: bookInChallenge,
        packageTier: bookTier,
        promoStartDate: bookPromoStart.trim(),
        promoEndDate: bookPromoEnd.trim(),
      },
      !editingBookId
    );
    resetBookForm();
    await loadAllAdminData();
    showToast('Book listing saved.');
  };

  // Author Handlers
  const resetAuthorForm = () => {
    setEditingAuthorId(null);
    setAuthorName('');
    setAuthorGenre(LITERARY_GENRES[0]);
    setAuthorBio('');
    setAuthorPhotoUrl('');
    setAuthorWebsite('');
    setAuthorSocials('');
    setAuthorPurchaseLinks('');
    setAuthorStatus('approved');
    setAuthorTier('standard');
  };

  const handleEditAuthor = (a: AuthorProfile) => {
    setEditingAuthorId(a.id);
    setAuthorName(a.name);
    setAuthorGenre(a.genre);
    setAuthorBio(a.biography);
    setAuthorPhotoUrl(a.photoUrl);
    setAuthorWebsite(a.website);
    setAuthorSocials(a.socialLinks);
    setAuthorPurchaseLinks(a.purchaseLinks);
    setAuthorStatus(a.status);
    setAuthorTier(a.spotlightTier);
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingAuthorId || generateSafeId('auth');
    await saveAuthorAdmin(
      id,
      {
        name: authorName.trim(),
        genre: authorGenre,
        biography: authorBio.trim(),
        photoUrl: authorPhotoUrl.trim(),
        website: authorWebsite.trim(),
        socialLinks: authorSocials.trim(),
        purchaseLinks: authorPurchaseLinks.trim(),
        status: authorStatus,
        spotlightTier: authorTier,
      },
      !editingAuthorId
    );
    resetAuthorForm();
    await loadAllAdminData();
    showToast('Author profile saved.');
  };

  // Submission Review & Publish Handlers
  const handleUpdateSubmission = async (
    sub: AuthorSubmission,
    nextStatus: AuthorSubmission['status'],
    adminNotes: string,
    alsoPublishBook = false
  ) => {
    try {
      await updateDoc(doc(db, 'submissions', sub.id), {
        status: nextStatus,
        adminNotes,
        updatedAt: serverTimestamp(),
      });

      if (alsoPublishBook && nextStatus === 'approved') {
        const start = new Date();
        const end = new Date();
        end.setFullYear(end.getFullYear() + 1);
        const startStr = start.toISOString().slice(0, 10);
        const endStr = end.toISOString().slice(0, 10);

        let createdAuthorId = '';
        if (sub.selectedPackage === 'standard' || sub.selectedPackage === 'premium') {
          createdAuthorId = generateSafeId('auth');
          await saveAuthorAdmin(
            createdAuthorId,
            {
              name: sub.authorFullName,
              genre: sub.bookGenre,
              biography: sub.authorBiography,
              photoUrl: '',
              website: sub.authorWebsite,
              socialLinks: sub.socialMediaLinks,
              purchaseLinks: sub.purchaseLink,
              status: 'approved',
              spotlightTier: sub.selectedPackage,
            },
            true
          );
        }

        const bookId = generateSafeId('book');
        await saveBookAdmin(
          bookId,
          {
            title: sub.bookTitle,
            authorName: sub.authorFullName,
            authorId: createdAuthorId,
            genre: sub.bookGenre,
            description: sub.bookSynopsis,
            publicationInfo: sub.additionalInfo,
            purchaseLink: sub.purchaseLink,
            coverUrl: sub.coverUrl,
            status: 'approved',
            featuredInChallenge: false,
            packageTier: sub.selectedPackage,
            promoStartDate: startStr,
            promoEndDate: endStr,
          },
          true
        );
      }

      await loadAllAdminData();
      showToast(
        alsoPublishBook
          ? 'Submission approved and published to library.'
          : 'Submission status updated.'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${sub.id}`);
    }
  };

  const handleVerifyPayment = async (
    pay: PaymentRecord,
    nextStatus: PaymentRecord['status']
  ) => {
    const start = new Date();
    const end = new Date();
    end.setFullYear(end.getFullYear() + 1);
    const startStr = nextStatus === 'verified' ? start.toISOString().slice(0, 10) : pay.promoStartDate;
    const endStr = nextStatus === 'verified' ? end.toISOString().slice(0, 10) : pay.promoEndDate;

    try {
      await updateDoc(doc(db, 'payments', pay.id), {
        status: nextStatus,
        promoStartDate: startStr,
        promoEndDate: endStr,
        updatedAt: serverTimestamp(),
      });
      if (nextStatus === 'verified' || nextStatus === 'refunded') {
        await updateDoc(doc(db, 'submissions', pay.submissionId), {
          paymentStatus: nextStatus === 'verified' ? 'verified' : 'refunded',
          updatedAt: serverTimestamp(),
        });
      }
      await loadAllAdminData();
      showToast(`Payment marked as ${nextStatus}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `payments/${pay.id}`);
    }
  };

  const handleSaveWebsiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSiteSettingsAdmin({
      ...webSettings,
      basicPriceUsd: Number(webSettings.basicPriceUsd) || 50,
      standardPriceUsd: Number(webSettings.standardPriceUsd) || 100,
      premiumPriceUsd: Number(webSettings.premiumPriceUsd) || 150,
    });
    showToast('Website content, reading challenge, and pricing updated.');
  };

  const pendingSubsCount = submissions.filter((s) => s.status === 'pending_review').length;
  const approvedSubsCount = submissions.filter((s) => s.status === 'approved').length;
  const activeBooksCount = books.filter((b) => b.status === 'approved').length;

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
    { id: 'books', label: 'Books', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'authors', label: 'Authors', icon: <Users className="w-4 h-4" /> },
    { id: 'submissions', label: 'Submissions', icon: <FileText className="w-4 h-4" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'readers', label: 'Readers', icon: <Users className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <Mail className="w-4 h-4" /> },
    { id: 'website', label: 'Website', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-[#F3EBDD] text-[#242126] min-h-screen py-10">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Admin Header */}
        <div className="bg-[#4A1425] text-[#F3EBDD] rounded-md p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold">
              Administration Console
            </p>
            <h1 className="font-serif text-3xl font-bold mt-1">
              ALL GENRES MILLIONS READER — Admin Dashboard
            </h1>
            <p className="text-xs text-[#F3EBDD]/75 mt-1">
              Signed in as {user.email}
            </p>
          </div>
          {toast && (
            <div className="px-4 py-2 bg-[#C6A15B] text-[#242126] text-xs font-bold rounded-md">
              {toast}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#4A1425]/20 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#4A1425] text-[#F3EBDD]'
                  : 'bg-[#FAF6EE] text-[#4A1425] border border-[#4A1425]/20 hover:border-[#4A1425]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-[#4A1425]">
            Loading database records...
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { label: 'Total Reader Registrations', value: readers.length },
                  { label: 'Total Author Submissions', value: submissions.length },
                  { label: 'Pending Submissions', value: pendingSubsCount },
                  { label: 'Approved Submissions', value: approvedSubsCount },
                  { label: 'Payment Records', value: payments.length },
                  { label: 'Active Featured Books', value: activeBooksCount },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4A1425]/75">
                      {stat.label}
                    </p>
                    <p className="mt-3 font-serif text-4xl font-bold text-[#4A1425] tabular-nums">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* BOOK MANAGEMENT TAB */}
            {activeTab === 'books' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={(e) => void handleSaveBook(e)}
                  className="lg:col-span-5 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                      {editingBookId ? 'Edit Book Listing' : 'Add Featured Book'}
                    </h2>
                    {editingBookId && (
                      <button type="button" onClick={resetBookForm} className="text-xs text-[#4A1425] underline">
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Book Title *"
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Author Name *"
                    value={bookAuthorName}
                    onChange={(e) => setBookAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <select
                    value={bookGenre}
                    onChange={(e) => setBookGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  >
                    {LITERARY_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    rows={3}
                    placeholder="Book Description *"
                    value={bookDesc}
                    onChange={(e) => setBookDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Publication Information (Publisher / Year / ISBN)"
                    value={bookPubInfo}
                    onChange={(e) => setBookPubInfo(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Purchase Link (https://...)"
                    value={bookPurchaseLink}
                    onChange={(e) => setBookPurchaseLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />

                  <div className="space-y-2">
                    <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-[#4A1425]/40 rounded text-xs text-[#4A1425] cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Book Cover</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) setBookCoverUrl(await compressImageFileToDataUrl(f));
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Or paste Cover Image URL"
                      value={bookCoverUrl.startsWith('data:') ? '(Uploaded Cover Attached)' : bookCoverUrl}
                      onChange={(e) => setBookCoverUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={bookStatus}
                      onChange={(e) =>
                        setBookStatus(e.target.value as 'pending' | 'approved' | 'archived')
                      }
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                    >
                      <option value="approved">Approved (Public)</option>
                      <option value="pending">Pending</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={bookTier}
                      onChange={(e) =>
                        setBookTier(
                          e.target.value as 'basic' | 'standard' | 'premium' | 'editorial'
                        )
                      }
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                    >
                      <option value="basic">Basic Package</option>
                      <option value="standard">Standard Package</option>
                      <option value="premium">Premium Package</option>
                      <option value="editorial">Editorial Feature</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={bookPromoStart}
                      onChange={(e) => setBookPromoStart(e.target.value)}
                      aria-label="Promotional Start Date"
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-xs"
                    />
                    <input
                      type="date"
                      value={bookPromoEnd}
                      onChange={(e) => setBookPromoEnd(e.target.value)}
                      aria-label="Promotional End Date"
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-xs"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookInChallenge}
                      onChange={(e) => setBookInChallenge(e.target.checked)}
                      className="accent-[#4A1425]"
                    />
                    <span>Feature in 2026–2027 Reading Challenge</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingBookId ? 'Update Book' : 'Publish Book Listing'}</span>
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                    All Book Listings ({books.length})
                  </h2>
                  {books.length === 0 ? (
                    <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm text-[#242126]/75">
                      No books in database yet. Add a book on the left or approve an author submission.
                    </div>
                  ) : (
                    books.map((b) => (
                      <div
                        key={b.id}
                        className="p-4 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-serif text-xl font-bold text-[#4A1425]">{b.title}</p>
                          <p className="text-xs text-[#242126]/75">
                            {b.authorName} · {b.genre} · Status:{' '}
                            <strong className="uppercase">{b.status}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditBook(b)}
                            className="px-3 py-1.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-semibold rounded"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteBookAdmin(b.id);
                              await loadAllAdminData();
                              showToast('Book removed.');
                            }}
                            className="p-1.5 text-red-700 hover:text-red-900"
                            aria-label={`Delete ${b.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* AUTHOR MANAGEMENT TAB */}
            {activeTab === 'authors' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={(e) => void handleSaveAuthor(e)}
                  className="lg:col-span-5 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                      {editingAuthorId ? 'Edit Author Profile' : 'Add Featured Author'}
                    </h2>
                    {editingAuthorId && (
                      <button type="button" onClick={resetAuthorForm} className="text-xs text-[#4A1425] underline">
                        Cancel
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Author Full Name *"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <select
                    value={authorGenre}
                    onChange={(e) => setAuthorGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  >
                    {LITERARY_GENRES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  <textarea
                    required
                    rows={4}
                    placeholder="Author Biography *"
                    value={authorBio}
                    onChange={(e) => setAuthorBio(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="url"
                    placeholder="Official Website (https://...)"
                    value={authorWebsite}
                    onChange={(e) => setAuthorWebsite(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Social Media Links"
                    value={authorSocials}
                    onChange={(e) => setAuthorSocials(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Book Purchase Links"
                    value={authorPurchaseLinks}
                    onChange={(e) => setAuthorPurchaseLinks(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />

                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-dashed border-[#4A1425]/40 rounded text-xs text-[#4A1425] cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Author Photograph</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (f) setAuthorPhotoUrl(await compressImageFileToDataUrl(f, 600, 750));
                      }}
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={authorStatus}
                      onChange={(e) =>
                        setAuthorStatus(e.target.value as 'pending' | 'approved' | 'archived')
                      }
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={authorTier}
                      onChange={(e) =>
                        setAuthorTier(e.target.value as 'standard' | 'premium' | 'editorial')
                      }
                      className="px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="editorial">Editorial</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md"
                  >
                    {editingAuthorId ? 'Update Author Profile' : 'Save Author Profile'}
                  </button>
                </form>

                <div className="lg:col-span-7 space-y-3">
                  <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                    Author Profiles ({authors.length})
                  </h2>
                  {authors.length === 0 ? (
                    <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm text-[#242126]/75">
                      No author profiles created yet.
                    </div>
                  ) : (
                    authors.map((a) => (
                      <div
                        key={a.id}
                        className="p-4 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-serif text-xl font-bold text-[#4A1425]">{a.name}</p>
                          <p className="text-xs text-[#242126]/75">
                            {a.genre} · Status: <strong className="uppercase">{a.status}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleEditAuthor(a)}
                            className="px-3 py-1.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-semibold rounded"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await deleteAuthorAdmin(a.id);
                              await loadAllAdminData();
                              showToast('Author removed.');
                            }}
                            className="p-1.5 text-red-700"
                            aria-label={`Delete ${a.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* SUBMISSION MANAGEMENT TAB */}
            {activeTab === 'submissions' && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Author Submissions ({submissions.length})
                </h2>
                {submissions.length === 0 ? (
                  <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm">
                    No author submissions received yet.
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <SubmissionAdminCard
                      key={sub.id}
                      sub={sub}
                      onUpdate={handleUpdateSubmission}
                    />
                  ))
                )}
              </div>
            )}

            {/* PAYMENT MANAGEMENT TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Payment Records ({payments.length})
                </h2>
                {payments.length === 0 ? (
                  <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm">
                    No payment records recorded yet.
                  </div>
                ) : (
                  payments.map((pay) => (
                    <div
                      key={pay.id}
                      className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 text-xs">
                        <p className="font-serif text-lg font-bold text-[#4A1425]">
                          {pay.referenceCode} — ${pay.amountUsd} ({pay.provider.toUpperCase()})
                        </p>
                        <p>
                          Package: <strong className="uppercase">{pay.packageTier}</strong> · Status:{' '}
                          <strong className="uppercase">{pay.status}</strong>
                        </p>
                        {pay.providerTransactionId && (
                          <p className="font-mono">
                            Provider Tx ID: {pay.providerTransactionId}
                          </p>
                        )}
                        {pay.promoStartDate && (
                          <p>
                            Promotional Window: {pay.promoStartDate} to {pay.promoEndDate}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void handleVerifyPayment(pay, 'verified')}
                          className="px-3 py-1.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-semibold rounded"
                        >
                          Verify &amp; Activate 12-Month Dates
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleVerifyPayment(pay, 'refunded')}
                          className="px-3 py-1.5 border border-[#4A1425]/35 text-[#4A1425] text-xs font-semibold rounded"
                        >
                          Mark Refunded
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* READER MANAGEMENT TAB */}
            {activeTab === 'readers' && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Registered Readers ({readers.length})
                </h2>
                {readers.length === 0 ? (
                  <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm">
                    No registered readers yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {readers.map((r) => (
                      <div
                        key={r.uid}
                        className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-serif text-xl font-bold text-[#4A1425]">{r.fullName}</p>
                          <span className="uppercase font-semibold text-[#4A1425]/70">{r.role}</span>
                        </div>
                        <p>{r.email} · {r.country || 'Country unspecified'}</p>
                        <p>
                          Favorite Genres: {r.favoriteGenres?.length ? r.favoriteGenres.join(', ') : 'None selected'}
                        </p>
                        {r.readingInterests && <p>Interests: {r.readingInterests}</p>}
                        <p className="tabular-nums">
                          Challenge Goal: {r.booksReadCount} / {r.readingGoalBooks} books
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CONTACT MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Contact Inquiries ({messages.length})
                </h2>
                {messages.length === 0 ? (
                  <div className="p-8 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md text-sm">
                    No contact messages yet.
                  </div>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-5 space-y-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-serif text-xl font-bold text-[#4A1425]">
                          {m.subject}
                        </p>
                        <span className="text-xs uppercase font-semibold text-[#4A1425]/75">
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#242126]/75">
                        From: {m.name} ({m.email})
                      </p>
                      <p className="text-sm text-[#242126]/90 whitespace-pre-line">{m.message}</p>
                      <div className="pt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            await updateDoc(doc(db, 'contact_messages', m.id), { status: 'replied' });
                            await loadAllAdminData();
                          }}
                          className="px-3 py-1 bg-[#4A1425] text-[#F3EBDD] text-xs rounded"
                        >
                          Mark Replied
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await deleteDoc(doc(db, 'contact_messages', m.id));
                            await loadAllAdminData();
                          }}
                          className="px-3 py-1 border border-red-400 text-red-700 text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* WEBSITE MANAGEMENT TAB */}
            {activeTab === 'website' && (
              <form
                onSubmit={(e) => void handleSaveWebsiteSettings(e)}
                className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-8 space-y-5 max-w-3xl"
              >
                <h2 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Website Content, Challenge &amp; Pricing Settings
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Homepage Hero Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={webSettings.heroHeadline}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, heroHeadline: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Homepage Supporting Text
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={webSettings.heroSupportingText}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, heroSupportingText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Reading Challenge Title
                  </label>
                  <input
                    type="text"
                    required
                    value={webSettings.challengeTitle}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, challengeTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Reading Challenge Introduction
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={webSettings.challengeIntro}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, challengeIntro: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Reading Challenge Guidelines
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={webSettings.challengeGuidelines}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, challengeGuidelines: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                    Community Announcement Banner
                  </label>
                  <textarea
                    rows={2}
                    value={webSettings.communityAnnouncement}
                    onChange={(e) =>
                      setWebSettings({ ...webSettings, communityAnnouncement: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                      Basic Price (USD)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={webSettings.basicPriceUsd}
                      onChange={(e) =>
                        setWebSettings({ ...webSettings, basicPriceUsd: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                      Standard Price (USD)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={webSettings.standardPriceUsd}
                      onChange={(e) =>
                        setWebSettings({
                          ...webSettings,
                          standardPriceUsd: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] mb-1">
                      Premium Price (USD)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={webSettings.premiumPriceUsd}
                      onChange={(e) =>
                        setWebSettings({
                          ...webSettings,
                          premiumPriceUsd: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-sm tabular-nums"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Save Website Configuration
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function SubmissionAdminCard({
  sub,
  onUpdate,
}: {
  sub: AuthorSubmission;
  onUpdate: (
    sub: AuthorSubmission,
    nextStatus: AuthorSubmission['status'],
    adminNotes: string,
    alsoPublishBook?: boolean
  ) => Promise<void>;
}) {
  const [notes, setNotes] = useState(sub.adminNotes || '');

  return (
    <div className="bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-xs text-[#4A1425]/70">{sub.referenceCode}</p>
          <h3 className="font-serif text-2xl font-bold text-[#4A1425]">{sub.bookTitle}</h3>
          <p className="text-xs text-[#242126]/80">
            By <strong>{sub.authorFullName}</strong> ({sub.email}) · {sub.country} · {sub.bookGenre}
          </p>
          <p className="text-xs text-[#242126]/80">
            Package: <strong className="uppercase">{sub.selectedPackage}</strong> (${sub.packageAmountUsd}) ·
            Review Status: <strong className="capitalize">{sub.status.replace(/_/g, ' ')}</strong> ·
            Payment: <strong className="capitalize">{sub.paymentStatus.replace(/_/g, ' ')}</strong>
          </p>
        </div>
      </div>

      <p className="text-xs text-[#242126]/85 leading-relaxed">{sub.bookSynopsis}</p>

      <div>
        <label className="block text-xs font-semibold text-[#4A1425] mb-1">
          Administrative Notes
        </label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal editorial or payment verification notes..."
          className="w-full px-3 py-2 bg-white border border-[#4A1425]/25 rounded text-xs"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void onUpdate(sub, 'approved', notes, true)}
          className="px-4 py-2 bg-[#4A1425] text-[#F3EBDD] text-xs font-semibold rounded inline-flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Approve &amp; Publish to Library</span>
        </button>
        <button
          type="button"
          onClick={() => void onUpdate(sub, 'under_review', notes, false)}
          className="px-4 py-2 border border-[#4A1425]/35 text-[#4A1425] text-xs font-semibold rounded"
        >
          Mark Under Review
        </button>
        <button
          type="button"
          onClick={() => void onUpdate(sub, 'rejected', notes, false)}
          className="px-4 py-2 border border-red-400 text-red-700 text-xs font-semibold rounded inline-flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
