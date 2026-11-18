import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

export function AboutPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div>
      {/* Editorial Header */}
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16 lg:py-20">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-3">
            Who We Are
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD] [text-wrap:balance] max-w-3xl">
            About All Genres Millions Reader
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#F3EBDD]/80 max-w-2xl leading-relaxed">
            All Genres Millions Reader is a literary community created to bring readers and authors together across cultures, traditions, and storytelling forms.
          </p>
        </div>
      </section>

      {/* Main Editorial Narrative & Visual */}
      <section className="bg-[#F3EBDD] text-[#242126] py-16 lg:py-24">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-md border border-[#4A1425]/20">
              <ImageWithFallback
                src="/src/assets/images/about_reading_circle_1794963329072.jpg"
                alt="Readers gathered in a warm literary salon discussing books"
                className="w-full h-full object-cover aspect-[16/10]"
              />
            </div>
            <p className="mt-3 text-xs text-[#242126]/65 italic font-serif">
              An international gathering celebrating books across every genre.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-6 max-w-prose">
            <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
              Our Mission
            </h2>
            <p className="text-base text-[#242126]/85 leading-relaxed">
              Our mission is to make discovering books easier, encourage meaningful literary conversations, introduce readers to new authors, and create opportunities for books to gain sustained visibility.
            </p>
            <p className="text-base text-[#242126]/85 leading-relaxed">
              Readers can explore different genres—from Romance, Mystery and Thriller, Fantasy, and Science Fiction to Historical Fiction, Biography, Poetry, and Christian Literature—discover featured books, participate in reading activities, and share their personal impressions.
            </p>
            <p className="text-base text-[#242126]/85 leading-relaxed">
              Authors can submit their published works for editorial consideration and explore structured 12-month promotional opportunities designed to place their books before curious, attentive readers.
            </p>

            <div className="pt-6 border-t border-[#4A1425]/20">
              <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
                Our Vision
              </h2>
              <p className="mt-3 text-base text-[#242126]/85 leading-relaxed">
                To build a welcoming literary community where stories from every genre can find readers and authors have opportunities to introduce their work to new audiences.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigate('/join')}
                className="px-5 py-3 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] transition-colors inline-flex items-center gap-2"
              >
                <span>Join Our Community</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/packages')}
                className="px-5 py-3 border border-[#4A1425]/40 text-[#4A1425] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#4A1425]/5 transition-colors"
              >
                Author Packages
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
