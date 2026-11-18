export const LITERARY_GENRES = [
  'Romance',
  'Mystery and Thriller',
  'Fantasy',
  'Science Fiction',
  'Historical Fiction',
  'Literary Fiction',
  'Biography and Memoir',
  'Personal Development',
  "Children's Books",
  'Poetry',
  'Nonfiction',
  'Christian Literature',
] as const;

export const ADMIN_EMAILS = [
  'laynemorales.book@gmail.com',
  'joseph.g@aurorametros.com',
];

export type PackageTier = 'basic' | 'standard' | 'premium';

export interface PackageDefinition {
  id: PackageTier;
  name: string;
  defaultPriceUsd: number;
  summary: string;
  features: string[];
}

export const AUTHOR_PACKAGES: PackageDefinition[] = [
  {
    id: 'basic',
    name: 'BASIC',
    defaultPriceUsd: 50,
    summary: 'Essential 12-month featured book visibility within our international library.',
    features: [
      '12-month featured book listing',
      'Book cover and description display',
      'Author name and book details',
      'Book purchase link',
      'Inclusion in the featured book library',
      'One-time payment (no recurring charges)',
    ],
  },
  {
    id: 'standard',
    name: 'STANDARD',
    defaultPriceUsd: 100,
    summary: 'Comprehensive 12-month visibility combining your featured book with a dedicated author profile.',
    features: [
      'Everything in Basic',
      'Featured author profile',
      'Author biography',
      'Additional book information',
      'Promotional spotlight on the website',
      'One-time payment (no recurring charges)',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    defaultPriceUsd: 150,
    summary: 'Priority editorial presentation across featured book showcases and author spotlight pages.',
    features: [
      'Everything in Standard',
      'Priority consideration for promotional placement',
      'Enhanced featured book presentation',
      'Dedicated author spotlight page',
      'Additional promotional content placement',
      'One-time payment (no recurring charges)',
    ],
  },
];

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  country: string;
  favoriteGenres: string[];
  readingInterests: string;
  readingGoalBooks: number;
  booksReadCount: number;
  challengeJoined: boolean;
  challengeNotes: string;
  savedBookIds: string[];
  role: 'reader' | 'admin';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BookListing {
  id: string;
  title: string;
  authorName: string;
  authorId: string;
  genre: string;
  description: string;
  publicationInfo: string;
  purchaseLink: string;
  coverUrl: string;
  status: 'pending' | 'approved' | 'archived';
  featuredInChallenge: boolean;
  packageTier: 'basic' | 'standard' | 'premium' | 'editorial';
  promoStartDate: string;
  promoEndDate: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthorProfile {
  id: string;
  name: string;
  genre: string;
  biography: string;
  photoUrl: string;
  website: string;
  socialLinks: string;
  purchaseLinks: string;
  status: 'pending' | 'approved' | 'archived';
  spotlightTier: 'standard' | 'premium' | 'editorial';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface AuthorSubmission {
  id: string;
  userId: string;
  referenceCode: string;
  authorFullName: string;
  email: string;
  country: string;
  bookTitle: string;
  bookGenre: string;
  bookSynopsis: string;
  purchaseLink: string;
  coverUrl: string;
  authorBiography: string;
  authorWebsite: string;
  socialMediaLinks: string;
  selectedPackage: PackageTier;
  packageAmountUsd: number;
  additionalInfo: string;
  agreedToTerms: boolean;
  status: 'pending_review' | 'under_review' | 'approved' | 'rejected';
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified' | 'refunded';
  adminNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PaymentRecord {
  id: string;
  userId: string;
  submissionId: string;
  referenceCode: string;
  provider: 'paystack' | 'stripe';
  packageTier: PackageTier;
  amountUsd: number;
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  providerTransactionId: string;
  verificationDigest: string;
  promoStartDate: string;
  promoEndDate: string;
  adminNotes: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  adminNotes: string;
  createdAt?: unknown;
}

export interface ReadingProgressItem {
  id: string;
  userId: string;
  bookId: string;
  bookTitle: string;
  status: 'want_to_read' | 'reading' | 'completed';
  progressPercent: number;
  reflection: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface SiteSettings {
  heroHeadline: string;
  heroSupportingText: string;
  challengeTitle: string;
  challengeIntro: string;
  challengeGuidelines: string;
  communityAnnouncement: string;
  basicPriceUsd: number;
  standardPriceUsd: number;
  premiumPriceUsd: number;
  updatedAt?: unknown;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroHeadline: 'MILLIONS OF STORIES. EVERY GENRE. ONE READING COMMUNITY.',
  heroSupportingText:
    'Discover books, connect with readers, explore new authors, and become part of a growing literary community that celebrates stories across every genre.',
  challengeTitle: '2026–2027 Reading Challenge',
  challengeIntro:
    'The 2026–2027 Reading Challenge invites readers across the globe to widen their literary horizons—exploring unfamiliar genres, setting thoughtful personal reading goals, and sharing honest reflections with fellow readers.',
  challengeGuidelines:
    'Set a personal reading goal in your Reader Dashboard, select titles across genres that intrigue you, read at your own pace, and record personal reflections or honest reviews based solely on your reading experience.',
  communityAnnouncement:
    'Welcome to ALL GENRES MILLIONS READER. Author book submissions for our curated 2026–2027 featured library and reading challenge are open for editorial review.',
  basicPriceUsd: 50,
  standardPriceUsd: 100,
  premiumPriceUsd: 150,
};
