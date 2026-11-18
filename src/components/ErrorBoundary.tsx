import React from 'react';
import { BrandEmblem } from './BrandLogo';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected application error occurred.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#242126] text-[#F3EBDD] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-[#2E2A31] border border-[#C6A15B]/30 rounded-lg p-8 text-center">
            <div className="flex justify-center mb-4">
              <BrandEmblem className="w-14 h-14" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#F3EBDD]">
              Unable to Display This Section
            </h2>
            <p className="mt-3 text-sm text-[#F3EBDD]/80 leading-relaxed">
              We encountered an unexpected issue while loading this page. Please refresh or return to the homepage.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                className="px-5 py-2.5 bg-[#C6A15B] text-[#242126] text-sm font-semibold rounded-md hover:bg-[#DFC389] transition-colors"
              >
                Return Home
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 border border-[#C6A15B]/40 text-[#F3EBDD] text-sm font-medium rounded-md hover:bg-[#4A1425] transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
