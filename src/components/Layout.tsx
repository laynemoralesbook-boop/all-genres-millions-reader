import React, { useState } from 'react';
import { Menu, X, Shield, UserCheck, LogOut } from 'lucide-react';
import { BrandLogo, BrandEmblem } from './BrandLogo';
import { useAuth } from '../context/AuthContext';

export type AppRoute =
  | '/'
  | '/about'
  | '/reading-challenge'
  | '/books'
  | '/authors'
  | '/how-it-works'
  | '/packages'
  | '/join'
  | '/contact'
  | '/submit-book'
  | '/reader-dashboard'
  | '/admin'
  | '/privacy-policy'
  | '/terms-and-conditions'
  | '/promotional-terms'
  | '/refund-policy'
  | string;

interface LayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

const NAV_ITEMS: { label: string; path: string }[] = [
  { label: 'Home', path: '/' },
  { label: 'About Us', path: '/about' },
  { label: 'Reading Challenge', path: '/reading-challenge' },
  { label: 'Featured Books', path: '/books' },
  { label: 'Featured Authors', path: '/authors' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Author Packages', path: '/packages' },
  { label: 'Join Our Community', path: '/join' },
  { label: 'Contact Us', path: '/contact' },
];

export function Layout({ currentPath, onNavigate, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#242126] text-[#F3EBDD]">
      {/* Top Utility Bar for Member & Admin Quick Access */}
      <div className="bg-[#320C18] border-b border-[#C6A15B]/20 text-xs">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-9 flex items-center justify-between gap-4">
          <span className="text-[#F3EBDD]/75 truncate">
            Millions of Stories. Every Genre. One Reading Community.
          </span>
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('/reader-dashboard')}
                  className="inline-flex items-center gap-1.5 text-[#F3EBDD]/90 hover:text-[#C6A15B] transition-colors whitespace-nowrap"
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Reader Dashboard</span>
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNav('/admin')}
                    className="inline-flex items-center gap-1.5 text-[#C6A15B] hover:text-[#DFC389] font-medium transition-colors whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Dashboard</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="inline-flex items-center gap-1 text-[#F3EBDD]/70 hover:text-[#F3EBDD] transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void signInWithGoogle()}
                className="text-[#C6A15B] hover:text-[#DFC389] font-medium transition-colors whitespace-nowrap"
              >
                Member Sign In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header className="sticky top-0 z-40 bg-[#4A1425]/95 backdrop-blur-md border-b border-[#C6A15B]/25">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-6">
          {/* Zone 1: Custom Brand Logo */}
          <button
            type="button"
            onClick={() => handleNav('/')}
            className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A15B] rounded shrink-0"
            aria-label="ALL GENRES MILLIONS READER Home"
          >
            <span className="hidden sm:inline-flex">
              <BrandLogo variant="full" theme="dark" />
            </span>
            <span className="inline-flex sm:hidden">
              <BrandEmblem className="w-9 h-9" />
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav
            className="hidden xl:flex items-center gap-5 text-[13px] font-medium"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`relative py-1.5 whitespace-nowrap shrink-0 transition-colors duration-150 ${
                    active
                      ? 'text-[#C6A15B]'
                      : 'text-[#F3EBDD]/90 hover:text-[#C6A15B]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#C6A15B]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Prominent Primary Action + Mobile Hamburger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('/submit-book')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.06em] uppercase rounded-md hover:bg-[#DFC389] transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              FEATURE YOUR BOOK
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="xl:hidden p-2.5 rounded-md border border-[#C6A15B]/35 text-[#F3EBDD] hover:bg-[#320C18] transition-colors min-w-[44px] min-h-[44px] inline-flex items-center justify-center"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-[#320C18] border-t border-[#C6A15B]/25 px-4 py-5 space-y-2 max-h-[82vh] overflow-y-auto">
            <div className="pb-3 mb-3 border-b border-[#C6A15B]/20 flex items-center justify-between">
              <BrandLogo variant="compact" theme="dark" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className={`w-full text-left px-3.5 py-3 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#4A1425] text-[#C6A15B] border border-[#C6A15B]/35'
                        : 'text-[#F3EBDD]/90 hover:bg-[#4A1425]/60'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="pt-3 mt-3 border-t border-[#C6A15B]/20 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => handleNav('/submit-book')}
                className="w-full py-3 px-4 bg-[#C6A15B] text-[#242126] text-xs font-bold tracking-[0.08em] uppercase rounded-md hover:bg-[#DFC389] transition-colors"
              >
                FEATURE YOUR BOOK
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => handleNav('/reader-dashboard')}
                  className="w-full py-2.5 px-4 border border-[#C6A15B]/35 text-[#F3EBDD] text-sm font-medium rounded-md hover:bg-[#4A1425] transition-colors"
                >
                  Open Reader Dashboard
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNav('/admin')}
                  className="w-full py-2.5 px-4 border border-[#C6A15B]/50 text-[#C6A15B] text-sm font-medium rounded-md hover:bg-[#4A1425] transition-colors"
                >
                  Open Admin Dashboard
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1B181D] border-t border-[#C6A15B]/25 text-[#F3EBDD]">
        <div className="max-w-[1280px] mx-auto px-6 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#C6A15B]/15">
            {/* Brand Column */}
            <div className="lg:col-span-1 space-y-4">
              <BrandLogo variant="compact" theme="dark" />
              <p className="text-sm text-[#F3EBDD]/75 leading-relaxed">
                Millions of Stories. Every Genre. One Reading Community.
              </p>
              <div className="pt-2 text-xs text-[#F3EBDD]/70 space-y-1">
                <p>
                  Official Representative:{' '}
                  <span className="text-[#F3EBDD] font-medium">Joseph Goodluck</span>
                </p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:joseph.g@aurorametros.com"
                    className="text-[#C6A15B] hover:underline"
                  >
                    joseph.g@aurorametros.com
                  </a>
                </p>
              </div>
            </div>

            {/* Community Links */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#C6A15B] mb-4">
                Reading Community
              </h3>
              <ul className="space-y-2.5 text-sm text-[#F3EBDD]/80">
                <li>
                  <button type="button" onClick={() => handleNav('/')} className="hover:text-[#C6A15B] transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/about')} className="hover:text-[#C6A15B] transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/reading-challenge')} className="hover:text-[#C6A15B] transition-colors">
                    2026–2027 Reading Challenge
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/books')} className="hover:text-[#C6A15B] transition-colors">
                    Featured Books
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/authors')} className="hover:text-[#C6A15B] transition-colors">
                    Featured Authors
                  </button>
                </li>
              </ul>
            </div>

            {/* Authors & Membership */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#C6A15B] mb-4">
                Authors &amp; Participation
              </h3>
              <ul className="space-y-2.5 text-sm text-[#F3EBDD]/80">
                <li>
                  <button type="button" onClick={() => handleNav('/how-it-works')} className="hover:text-[#C6A15B] transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/packages')} className="hover:text-[#C6A15B] transition-colors">
                    Author Packages
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/submit-book')} className="hover:text-[#C6A15B] transition-colors">
                    Feature Your Book
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/join')} className="hover:text-[#C6A15B] transition-colors">
                    Join Our Community
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/contact')} className="hover:text-[#C6A15B] transition-colors">
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Trust */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#C6A15B] mb-4">
                Policies &amp; Terms
              </h3>
              <ul className="space-y-2.5 text-sm text-[#F3EBDD]/80">
                <li>
                  <button type="button" onClick={() => handleNav('/privacy-policy')} className="hover:text-[#C6A15B] transition-colors">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/terms-and-conditions')} className="hover:text-[#C6A15B] transition-colors">
                    Terms and Conditions
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/promotional-terms')} className="hover:text-[#C6A15B] transition-colors">
                    Promotional Service Terms
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => handleNav('/refund-policy')} className="hover:text-[#C6A15B] transition-colors">
                    Refund Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F3EBDD]/60">
            <p>
              &copy; {new Date().getFullYear()} ALL GENRES MILLIONS READER. All rights reserved.
            </p>
            <p>
              All promotional listings are subject to editorial review and one-time 12-month terms.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
