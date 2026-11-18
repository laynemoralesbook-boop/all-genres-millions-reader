/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/BrandLogo';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ReadingChallengePage } from './pages/ReadingChallengePage';
import { FeaturedBooksPage } from './pages/FeaturedBooksPage';
import { FeaturedAuthorsPage } from './pages/FeaturedAuthorsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AuthorPackagesPage } from './pages/AuthorPackagesPage';
import { AuthorSubmissionPage } from './pages/AuthorSubmissionPage';
import { JoinCommunityPage } from './pages/JoinCommunityPage';
import { ReaderDashboardPage } from './pages/ReaderDashboardPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LegalPage } from './pages/LegalPages';
import type { PackageTier } from './types/models';

function AppRouter() {
  const { authLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedPackage, setSelectedPackage] = useState<PackageTier>('standard');

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return <LoadingScreen />;
  }

  const renderPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectGenre={(genre) => {
            setSelectedGenre(genre);
            navigate('/books');
          }}
          onSelectPackage={(tier) => {
            setSelectedPackage(tier);
            navigate('/submit-book');
          }}
        />
      );
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (currentPath === '/reading-challenge') {
      return <ReadingChallengePage onNavigate={navigate} />;
    }

    if (currentPath === '/books') {
      return <FeaturedBooksPage initialGenre={selectedGenre} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/books/')) {
      const bookId = currentPath.replace('/books/', '').split('/')[0];
      return <FeaturedBooksPage bookId={bookId} onNavigate={navigate} />;
    }

    if (currentPath === '/authors') {
      return <FeaturedAuthorsPage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/authors/')) {
      const authorId = currentPath.replace('/authors/', '').split('/')[0];
      return <FeaturedAuthorsPage authorId={authorId} onNavigate={navigate} />;
    }

    if (currentPath === '/how-it-works') {
      return <HowItWorksPage onNavigate={navigate} />;
    }

    if (currentPath === '/packages') {
      return (
        <AuthorPackagesPage
          onNavigate={navigate}
          onSelectPackage={(tier) => {
            setSelectedPackage(tier);
            navigate('/submit-book');
          }}
        />
      );
    }

    if (currentPath === '/submit-book') {
      return <AuthorSubmissionPage initialPackage={selectedPackage} onNavigate={navigate} />;
    }

    if (currentPath === '/join') {
      return <JoinCommunityPage onNavigate={navigate} />;
    }

    if (currentPath === '/reader-dashboard') {
      return <ReaderDashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    if (currentPath === '/admin') {
      return <AdminDashboardPage />;
    }

    if (
      currentPath === '/privacy-policy' ||
      currentPath === '/terms-and-conditions' ||
      currentPath === '/promotional-terms' ||
      currentPath === '/refund-policy'
    ) {
      return (
        <LegalPage
          type={currentPath.slice(1) as
            | 'privacy-policy'
            | 'terms-and-conditions'
            | 'promotional-terms'
            | 'refund-policy'}
          onNavigate={navigate}
        />
      );
    }

    return (
      <HomePage
        onNavigate={navigate}
        onSelectGenre={(genre) => {
          setSelectedGenre(genre);
          navigate('/books');
        }}
        onSelectPackage={(tier) => {
          setSelectedPackage(tier);
          navigate('/submit-book');
        }}
      />
    );
  };

  return (
    <Layout currentPath={currentPath} onNavigate={navigate}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
