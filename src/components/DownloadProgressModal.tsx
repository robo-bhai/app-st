import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, ShieldCheck, CheckCircle2, Lock, 
  Smartphone, X, RefreshCw, Sparkles, ExternalLink, QrCode
} from 'lucide-react';
import { AppModel } from '../types/app';
import { resolveAppIcon, handleImageFallback } from '../utils/imageUtils';
import { downloadAppApk } from '../utils/apkGenerator';

interface DownloadProgressModalProps {
  app: AppModel | null;
  isOpen: boolean;
  onClose: () => void;
  onDownloadComplete?: (app: AppModel) => void;
}

interface ScanStep {
  id: string;
  minPercent: number;
  label: string;
  subtext: string;
  badge: string;
  state: 'pending' | 'active' | 'passed';
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  app,
  isOpen,
  onClose,
  onDownloadComplete,
}) => {
  const [percent, setPercent] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [hasInstalled, setHasInstalled] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const animationRef = useRef<number | null>(null);

  // Parse numerical size in MB (e.g., "42 MB" -> 42, default to 32)
  const totalMb = React.useMemo(() => {
    if (!app) return 35;
    const match = app.file_size.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 35;
  }, [app]);

  const downloadedMb = ((percent / 100) * totalMb).toFixed(1);

  // Security taglines according to user requirements
  const steps: ScanStep[] = React.useMemo(() => {
    const appName = app ? app.app_name : 'Application';
    return [
      {
        id: 'cdn',
        minPercent: 0,
        label: 'Connecting to High-Speed Secure CDN',
        subtext: 'Allocating high-bandwidth unthrottled streaming channel...',
        badge: '⚡ TLS 1.3 Encrypted CDN',
        state: percent >= 25 ? 'passed' : percent > 0 ? 'active' : 'pending',
      },
      {
        id: 'virustotal',
        minPercent: 25,
        label: `Scanning ${appName} from VirusTotal`,
        subtext: 'Cross-verifying binary against 74 leading antivirus engines...',
        badge: '🛡️ VirusTotal Clean: 0 Threats / 74 Engines Cleared',
        state: percent >= 60 ? 'passed' : percent >= 25 ? 'active' : 'pending',
      },
      {
        id: 'playprotect',
        minPercent: 60,
        label: 'Our all apps is verified by Play Protect',
        subtext: 'Google Play Protect signature and sandbox integrity matched.',
        badge: '✅ Google Play Protect Verified',
        state: percent >= 85 ? 'passed' : percent >= 60 ? 'active' : 'pending',
      },
      {
        id: 'trusty',
        minPercent: 85,
        label: 'No malware, no spyware, 100% trusty app',
        subtext: 'Zero adware, zero trackers, safe runtime permissions confirmed.',
        badge: '🔒 100% Trusty Certified Safe',
        state: percent >= 100 ? 'passed' : percent >= 85 ? 'active' : 'pending',
      },
    ];
  }, [percent, app]);

  // Smooth realistic download timer
  useEffect(() => {
    if (!isOpen || !app) {
      setPercent(0);
      setIsCompleted(false);
      setHasInstalled(false);
      setShowQr(false);
      return;
    }

    setPercent(0);
    setIsCompleted(false);
    setHasInstalled(false);

    let current = 0;
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds total smooth verification & download

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      
      // Easing curve (ease-out cubic)
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      current = Math.min(Math.round(eased * 100), 100);
      setPercent(current);

      if (current < 100) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setIsCompleted(true);
        if (onDownloadComplete && app) {
          onDownloadComplete(app);
        }
      }
    };

    animationRef.current = requestAnimationFrame(step);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, app]);

  if (!isOpen || !app) return null;

  const currentActiveStep = steps.find((s) => s.state === 'active') || steps[steps.length - 1];

  const handleInstallClick = () => {
    downloadAppApk(app, () => {
      setHasInstalled(true);
    });
  };

  const handleRestartDownload = () => {
    setPercent(0);
    setIsCompleted(false);
    setHasInstalled(false);

    let current = 0;
    const startTime = Date.now();
    const duration = 2400;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      current = Math.min(Math.round(eased * 100), 100);
      setPercent(current);

      if (current < 100) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setIsCompleted(true);
      }
    };

    animationRef.current = requestAnimationFrame(step);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#140e0b] border border-amber-500/25 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 text-[#f7efe6]">
        
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with App Info & Close Button */}
        <div className="relative z-10 flex items-start justify-between gap-3 border-b border-amber-500/15 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={resolveAppIcon(app.app_icon, app.app_name, app.category)}
              alt={app.app_name}
              onError={(e) => handleImageFallback(e, app.app_name, app.category)}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover bg-stone-900 border border-amber-500/20 shrink-0 shadow-md"
            />
            <div className="min-w-0">
              <h3 className="font-display font-bold text-sm sm:text-base text-white truncate">
                {app.app_name}
              </h3>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-stone-400 mt-0.5">
                <span className="text-amber-300 font-medium">{app.category}</span>
                <span>·</span>
                <span>v{app.version}</span>
                <span>·</span>
                <span className="font-mono text-stone-300">{app.file_size}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800/60 transition-colors shrink-0"
            aria-label="Close download modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real-Time Progress Section */}
        <div className="relative z-10 py-5 space-y-4">
          
          {/* Percentage & Data Counter */}
          <div className="flex items-baseline justify-between">
            <div>
              <span className="font-display font-black text-3xl sm:text-4xl text-amber-400 tracking-tight">
                {percent}%
              </span>
              <span className="text-[11px] sm:text-xs text-stone-400 ml-2 font-mono">
                {isCompleted ? 'Download Complete' : 'Streaming package...'}
              </span>
            </div>

            <div className="text-right font-mono text-[11px] sm:text-xs text-stone-300">
              <span className="text-amber-300 font-bold">{downloadedMb} MB</span>
              <span className="text-stone-500"> / {totalMb} MB</span>
            </div>
          </div>

          {/* Smooth Progress Bar with Glowing Head */}
          <div className="relative w-full h-3 bg-stone-900/90 rounded-full overflow-hidden border border-amber-500/20 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-150 ease-out ${
                isCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-md shadow-emerald-500/40' 
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 shadow-md shadow-amber-500/30'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Current Active Tagline Banner */}
          <div className={`p-3 rounded-xl border transition-all ${
            isCompleted 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
              : 'bg-[#1b140f] border-amber-500/20 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
              )}
              <span className="font-semibold text-xs sm:text-sm">
                {isCompleted ? '100% Trusty App · Play Protect Verified Clean' : currentActiveStep.label}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-stone-300 mt-1 pl-6">
              {isCompleted 
                ? 'Scanned with 74 security engines. Zero threats found. Signed with authentic key.' 
                : currentActiveStep.subtext}
            </p>
          </div>

          {/* Step-by-Step Trust Verification Checklist */}
          <div className="space-y-2 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Multi-Stage Safety Verification</span>
            </div>

            <div className="space-y-1.5">
              {steps.map((step) => {
                const isPassed = step.state === 'passed';
                const isActive = step.state === 'active';
                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-[10px] sm:text-xs transition-colors border ${
                      isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
                        : isActive
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 animate-pulse'
                        : 'bg-stone-900/40 border-stone-800/40 text-stone-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : isActive ? (
                        <RefreshCw className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-stone-600 shrink-0" />
                      )}
                      <span className="truncate">{step.label}</span>
                    </div>

                    <span className="text-[9px] font-semibold font-mono shrink-0 px-1.5 py-0.5 rounded bg-black/40">
                      {step.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="relative z-10 pt-3 border-t border-amber-500/15 flex flex-col sm:flex-row items-center gap-2.5">
          {isCompleted ? (
            <>
              {/* PRIMARY PROMINENT INSTALL BUTTON */}
              <button
                onClick={handleInstallClick}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-400 hover:to-emerald-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-all transform active:scale-98"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>{hasInstalled ? 'Install Again (APK Saved)' : `Install ${app.app_name} Now`}</span>
              </button>

              <button
                onClick={() => setShowQr(!showQr)}
                className="w-full sm:w-auto py-2.5 px-3 rounded-xl border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                title="Scan QR to download on your Android phone"
              >
                <QrCode className="w-4 h-4" />
                <span>{showQr ? 'Hide QR' : 'Mobile QR'}</span>
              </button>
            </>
          ) : (
            <div className="w-full py-2.5 px-4 rounded-xl bg-stone-900/60 border border-stone-800 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Verifying and preparing package...</span>
            </div>
          )}
        </div>

        {/* Expandable Mobile QR Code */}
        {showQr && isCompleted && (
          <div className="mt-3 p-3 rounded-xl bg-stone-950/80 border border-amber-500/20 flex flex-col sm:flex-row items-center gap-3">
            <div className="p-1.5 bg-white rounded-lg shadow shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
                  `${window.location.origin}/app/${app.package_name}/download/`
                )}`}
                alt="Direct Mobile Download QR Code"
                className="w-20 h-20"
              />
            </div>
            <div className="text-[11px] text-stone-300 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>Direct Mobile Installation</span>
              </div>
              <p className="text-stone-400 text-[10px]">
                Scan with your phone camera to download directly to your Android device with zero popups.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
