import React, { useState } from 'react';
import { CheckCircle2, Mail, UserCheck } from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { generateSafeId } from '../lib/imageUtils';

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (message.trim().length < 5) {
      setErrorMsg('Please enter a message of at least 5 characters.');
      return;
    }

    setSending(true);
    const id = generateSafeId('msg');
    try {
      await setDoc(doc(db, 'contact_messages', id), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'new',
        adminNotes: '',
        createdAt: serverTimestamp(),
      });
      setSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `contact_messages/${id}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <section className="bg-[#320C18] border-b border-[#C6A15B]/25 py-16">
        <div className="max-w-[1280px] mx-auto px-6">
          <p className="text-xs tracking-[0.18em] uppercase text-[#C6A15B] font-semibold mb-2">
            Official Correspondence
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#F3EBDD]">
            Contact Us
          </h1>
          <p className="mt-4 text-base text-[#F3EBDD]/80 max-w-2xl leading-relaxed">
            Reach out with questions about our reading community, the 2026–2027 Reading Challenge, or author promotional submissions.
          </p>
        </div>
      </section>

      <section className="bg-[#F3EBDD] text-[#242126] py-16">
        <div className="max-w-[1160px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Official Representative Card */}
          <div className="lg:col-span-5 bg-[#4A1425] text-[#F3EBDD] rounded-md p-8 space-y-6">
            <div>
              <p className="text-xs tracking-[0.16em] uppercase text-[#C6A15B] font-semibold">
                Literary Organization
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold">
                All Genres Millions Reader
              </h2>
            </div>

            <div className="space-y-4 pt-4 border-t border-[#C6A15B]/25 text-sm">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#C6A15B] uppercase tracking-wider">
                    Official Representative
                  </p>
                  <p className="font-semibold text-base mt-0.5">Joseph Goodluck</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#C6A15B] uppercase tracking-wider">
                    Official Email
                  </p>
                  <a
                    href="mailto:joseph.g@aurorametros.com"
                    className="text-base font-semibold text-[#F3EBDD] hover:text-[#C6A15B] underline underline-offset-4 mt-0.5 inline-block"
                  >
                    joseph.g@aurorametros.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-[#FAF6EE] border border-[#4A1425]/20 rounded-md p-8">
            {sent ? (
              <div className="py-10 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-[#4A1425] mx-auto" />
                <h3 className="font-serif text-2xl font-bold text-[#4A1425]">
                  Message Received
                </h3>
                <p className="text-sm text-[#242126]/80 max-w-md mx-auto">
                  Thank you for contacting ALL GENRES MILLIONS READER. Your inquiry has been logged for our administration.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-5 py-2.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
                <h2 className="font-serif text-3xl font-bold text-[#4A1425]">
                  Send a Message
                </h2>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-300 text-red-900 rounded text-sm">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                      Email *
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

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A1425] uppercase tracking-wider mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    minLength={5}
                    maxLength={4000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#4A1425]/25 rounded-md text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="px-6 py-3.5 bg-[#4A1425] text-[#F3EBDD] text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#320C18] disabled:opacity-60 transition-colors"
                >
                  {sending ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
