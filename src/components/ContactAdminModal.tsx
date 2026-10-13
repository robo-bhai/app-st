import React, { useState } from 'react';
import { 
  X, Send, Sparkles, ShieldAlert, CheckCircle2, 
  Smartphone, MessageSquare 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppCategory, AppDemandRequest } from '../types/app';

interface ContactAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDemand: (demand: AppDemandRequest) => void;
}

const CATEGORIES: AppCategory[] = [
  'Games',
  'Productivity',
  'Tools',
  'Social',
  'Entertainment',
  'Finance',
  'Photography',
  'Health & Fitness'
];

export const ContactAdminModal: React.FC<ContactAdminModalProps> = ({
  isOpen,
  onClose,
  onSubmitDemand,
}) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState<'Email' | 'WhatsApp' | 'Telegram'>('Email');
  const [contactHandle, setContactHandle] = useState('');
  const [appTitle, setAppTitle] = useState('');
  const [platform, setPlatform] = useState<'Android' | 'iOS' | 'Cross-Platform' | 'Web App'>('Android');
  const [category, setCategory] = useState<AppCategory>('Productivity');
  const [requirements, setRequirements] = useState('');
  const [timeline, setTimeline] = useState('2-4 Weeks');
  const [budget, setBudget] = useState('$1,000 - $3,000');
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !email.trim() || !appTitle.trim() || !requirements.trim()) {
      setErrorMsg('Please fill in all required fields (Name, Email, App Title, and Requirements).');
      return;
    }
    if (!agreedToPolicy) {
      setErrorMsg('You must review and agree to our Legal Compliance & Safety Policy.');
      return;
    }

    const demand: AppDemandRequest = {
      id: `demand-${Date.now()}`,
      userName: userName.trim(),
      email: email.trim(),
      contactMethod,
      contactHandle: contactHandle.trim() || email.trim(),
      appTitle: appTitle.trim(),
      platform,
      category,
      requirements: requirements.trim(),
      timeline,
      budget,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    onSubmitDemand(demand);
    setSubmitted(true);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#fbbf24', '#f59e0b', '#d97706', '#10b981']
      });
    } catch {
      // Ignore
    }

    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#140e0b] border border-amber-500/25 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Modal Header (Compact for mobile devices) */}
        <div className="sticky top-0 z-20 bg-[#140e0b]/95 backdrop-blur-md px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-amber-500/15 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Hadi88 Apps · Custom Software Engineering</span>
            </div>
            <h2 className="text-sm sm:text-xl font-display font-extrabold text-white">
              Ask for Your Dreaming App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg glass-panel text-stone-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-3.5 sm:p-6 space-y-3.5 overflow-y-auto">
          
          {/* Brand Taglines Banner */}
          <div className="glass-panel rounded-xl p-2.5 sm:p-3 text-center border border-amber-500/15 space-y-0.5">
            <p className="text-[11px] sm:text-xs text-amber-300 font-bold">
              "Find and ask for your dreaming apps"
            </p>
            <p className="text-[10px] sm:text-xs text-stone-300 font-medium">
              "We are building app on your demand"
            </p>
          </div>

          {/* CRITICAL POLICY WARNING NOTICE (Explicit User Requirement) */}
          <div className="rounded-xl bg-red-950/30 border border-red-500/40 p-2.5 sm:p-3 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-red-300 uppercase tracking-wide text-[10px] sm:text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span>Strict Policy & Safety Warning</span>
            </div>
            <p className="text-red-200/90 text-[10px] sm:text-xs leading-relaxed font-medium">
              <strong>We do not build any illegal, pirated, or theft category applications.</strong>
              {' '}In such cases, we will <strong>never reply to spam emails, fraudulent messages, or illicit solicitations</strong>. Our discussion and decision is final.
            </p>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3 glass-panel rounded-2xl border border-emerald-500/30">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">App Demand Submitted!</h3>
              <p className="text-xs text-stone-300 max-w-sm mx-auto px-4">
                Thank you, <strong className="text-amber-300">{userName}</strong>! Your requirements for{' '}
                <strong className="text-white">"{appTitle}"</strong> have been securely dispatched to the Hadi88 Apps lead developers.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {errorMsg && (
                <div className="p-2 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-[11px] font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Asad Mehmood"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Preferred Contact Channel
                  </label>
                  <select
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value as 'Email' | 'WhatsApp' | 'Telegram')}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Email">Email</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Telegram">Telegram</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    WhatsApp / Phone / Telegram Handle
                  </label>
                  <input
                    type="text"
                    value={contactHandle}
                    onChange={(e) => setContactHandle(e.target.value)}
                    placeholder="+92 300 0000000 or @handle"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
                  />
                </div>
              </div>

              {/* Section 2: App Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-500/10">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Dreaming App Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={appTitle}
                    onChange={(e) => setAppTitle(e.target.value)}
                    placeholder="e.g. Smart Fleet GPS"
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Target Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as 'Android' | 'iOS' | 'Cross-Platform' | 'Web App')}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="Android">Android (APK)</option>
                    <option value="iOS">iOS (Apple)</option>
                    <option value="Cross-Platform">Cross-Platform</option>
                    <option value="Web App">Web App / PWA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as AppCategory)}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                  Detailed App Requirements & Workflows *
                </label>
                <textarea
                  required
                  rows={2}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Describe core functionalities, APIs, offline needs, user roles, design style..."
                  className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-stone-500"
                />
              </div>

              {/* Timeline & Budget */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Target Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="1-2 Weeks">1-2 Weeks (Urgent)</option>
                    <option value="2-4 Weeks">2-4 Weeks</option>
                    <option value="1-2 Months">1-2 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-stone-300 mb-0.5">
                    Estimated Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    <option value="$500 - $1,000">$500 - $1,000</option>
                    <option value="$1,000 - $3,000">$1,000 - $3,000</option>
                    <option value="$3,000 - $5,000">$3,000 - $5,000</option>
                    <option value="$5,000+">$5,000+</option>
                  </select>
                </div>
              </div>

              {/* Policy Checkbox */}
              <div className="p-2.5 rounded-xl bg-[#1b140f] border border-amber-500/20 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="policy-consent"
                  checked={agreedToPolicy}
                  onChange={(e) => setAgreedToPolicy(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 rounded text-amber-500 focus:ring-amber-400 bg-stone-900 border-amber-500/30"
                />
                <label htmlFor="policy-consent" className="text-[10px] sm:text-xs text-stone-300 leading-tight cursor-pointer">
                  I confirm that my proposed app contains <strong>no illegal, pirated, modded, or theft</strong> material, and I understand Hadi88 Apps strictly rejects spam and illicit requests.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-amber-500/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg glass-panel text-xs text-stone-300 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3 h-3 stroke-[2.5]" />
                  <span>Send Requirement</span>
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
