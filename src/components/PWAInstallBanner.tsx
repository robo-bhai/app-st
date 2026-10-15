import React, { useState, useEffect } from 'react';
import { Download, Sparkles, X, Smartphone, CheckCircle, ShieldCheck, Share, PlusSquare, ArrowUpRight } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global hook or store for PWA deferred prompt
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    listeners.forEach((cb) => cb());
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    listeners.forEach((cb) => cb());
  });
}

export const usePWAInstall = () => {
  const [canPrompt, setCanPrompt] = useState(!!globalDeferredPrompt);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standaloneCheck = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneCheck);

    const update = () => {
      setCanPrompt(!!globalDeferredPrompt);
    };
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const triggerInstall = async (onUnsupported?: () => void) => {
    if (globalDeferredPrompt) {
      try {
        await globalDeferredPrompt.prompt();
        const choice = await globalDeferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          globalDeferredPrompt = null;
          setCanPrompt(false);
          return true;
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
      }
    } else {
      if (onUnsupported) onUnsupported();
    }
    return false;
  };

  return { canPrompt, isStandalone, triggerInstall };
};

export const PWAInstallBanner: React.FC = () => {
  const { canPrompt, isStandalone, triggerInstall } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showHowToModal, setShowHowToModal] = useState(false);

  useEffect(() => {
    if (isStandalone) {
      setShowBanner(false);
      return;
    }

    const dismissed = sessionStorage.getItem('hadi88_pwa_dismissed');
    if (!dismissed) {
      setShowBanner(true);
    }
  }, [isStandalone]);

  const handleInstallClick = async () => {
    await triggerInstall(() => {
      // Browser didn't provide native beforeinstallprompt (e.g. iOS Safari, Firefox, or in-app browser)
      setShowHowToModal(true);
    });
  };

  const handleDismiss = () => {
    setShowBanner(false);
    try {
      sessionStorage.setItem('hadi88_pwa_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  if (isStandalone || !showBanner) return (
    <>
      {showHowToModal && <PWAHowToModal onClose={() => setShowHowToModal(false)} />}
    </>
  );

  return (
    <>
      {/* Top PWA Banner */}
      <aside aria-label="Install Hadi88 Apps PWA" className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-black px-3 py-2 sm:py-2.5 shadow-lg border-b border-amber-400/40 relative z-40 animate-fade-in">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-black text-amber-400 flex items-center justify-center font-display font-black text-sm shrink-0 shadow-sm">
              H
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-extrabold font-display leading-tight truncate">
                Install Hadi88 Apps as Native App
              </p>
              <p className="text-[10px] sm:text-xs text-stone-900 font-medium leading-none truncate mt-0.5">
                Full-screen experience · Fast APK downloads · 100% Virus & Play Protect Safe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 sm:px-4 py-1.5 rounded-lg bg-black hover:bg-stone-900 text-amber-300 font-extrabold text-[11px] sm:text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install PWA</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded-lg text-black/70 hover:text-black transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Manual Install Instructions Modal */}
      {showHowToModal && <PWAHowToModal onClose={() => setShowHowToModal(false)} />}
    </>
  );
};

export const PWAHowToModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-[#160f0b] border border-amber-500/35 rounded-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/15 pb-2.5">
          <h3 className="font-display font-bold text-white text-sm flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Install App on Your Phone / Desktop</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-stone-300">
          {/* Chrome / Edge / Android */}
          <div className="p-3 rounded-xl bg-[#1d140e] border border-amber-500/20 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center justify-between">
              <span>Android (Chrome / Edge / Brave):</span>
              <span className="text-[10px] text-emerald-400 font-mono">1-Click</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Browser menu <strong className="text-white">(⋮)</strong> par click karein aur <strong className="text-amber-300">"Install app"</strong> ya <strong className="text-amber-300">"Add to Home screen"</strong> select karein.
            </p>
          </div>

          {/* iOS Safari */}
          <div className="p-3 rounded-xl bg-[#1d140e] border border-amber-500/20 space-y-1.5">
            <div className="font-bold text-amber-400 flex items-center justify-between">
              <span>Apple iPhone / iPad (Safari):</span>
              <span className="text-[10px] text-amber-300 font-mono">iOS</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Safari ke bottom bar par <strong className="text-white">Share button</strong> (square with arrow) tap karein, phir neeche scroll kar ke <strong className="text-amber-300">"Add to Home Screen"</strong> par tap karein.
            </p>
          </div>

          {/* Desktop Chrome */}
          <div className="p-2.5 rounded-xl bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400">
            💻 <strong className="text-stone-300">Computer / Laptop:</strong> URL address bar ke right side par bane <strong className="text-amber-300">Install Icon ⊕</strong> par click karein.
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
        >
          Got it / Samajh Aa Gaya
        </button>
      </div>
    </div>
  );
};
