import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Download, Star, 
  ExternalLink, ShieldCheck, MessageSquarePlus 
} from 'lucide-react';
import { AppModel } from '../types/app';
import { resolveBannerImage } from '../utils/imageUtils';

interface HeroCarouselProps {
  featuredApps: AppModel[];
  onSelectApp: (app: AppModel) => void;
  onDownloadApk: (app: AppModel) => void;
  onOpenDemandModal: () => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  featuredApps,
  onSelectApp,
  onDownloadApk,
  onOpenDemandModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (isHovered || featuredApps.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, featuredApps.length]);

  if (!featuredApps || featuredApps.length === 0) return null;

  const currentApp = featuredApps[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featuredApps.length) % featuredApps.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredApps.length);
  };

  return (
    <section 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-amber-500/20 shadow-xl transition-all"
    >
      {/* Background Graphic Layer with Dark Chocolate Scrim */}
      <div className="relative min-h-[220px] sm:min-h-[360px] md:min-h-[420px] flex flex-col justify-end p-3 sm:p-6 md:p-8">
        
        {/* Banner image with responsive scrim overlays */}
        {currentApp.banner_image && (
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src={resolveBannerImage(currentApp.banner_image)}
              alt={currentApp.app_name}
              onError={(e) => {
                e.currentTarget.src = '/images/hero_app_showcase_1791093747904.jpg';
              }}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform scale-102 transition-transform duration-700 ease-out"
            />
            {/* Scrims to guarantee WCAG AA legibility across all screens */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a08] via-[#0e0a08]/85 to-[#0e0a08]/35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0e0a08] via-[#0e0a08]/75 to-transparent" />
          </div>
        )}

        {/* Content Container with small fonts and small icons */}
        <div className="relative z-10 max-w-3xl space-y-1.5 sm:space-y-3">
          
          {/* Brand Taglines Kicker (Micro font for mobile) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[9px] sm:text-xs font-semibold text-amber-400">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
            </span>
            <span className="tracking-wider uppercase text-[8px] sm:text-[10px] font-bold text-amber-300">
              Spotlight
            </span>
            <span className="text-stone-500 hidden xs:inline">·</span>
            <span className="text-stone-300 italic text-[8px] sm:text-[10px] hidden xs:inline truncate max-w-[200px] sm:max-w-none">
              "Find and ask for your dreaming apps"
            </span>
          </div>

          {/* Title (Scaled neatly for mobile screens) */}
          <h1 className="text-sm sm:text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight leading-tight truncate">
            {currentApp.app_name}
          </h1>

          {/* Description */}
          <p className="text-stone-300 text-[10px] sm:text-xs md:text-sm leading-relaxed line-clamp-2 max-w-2xl">
            {currentApp.description}
          </p>

          {/* Metadata Row: Clean small unboxed typography */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2.5 text-[9px] sm:text-xs text-stone-300 pt-0.5">
            <span className="font-semibold text-white flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 inline" />
              <span className="truncate max-w-[100px] sm:max-w-none">{currentApp.developer_name}</span>
            </span>
            <span className="text-stone-600" aria-hidden="true">·</span>
            <span className="font-bold text-amber-400 flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
              <span>{currentApp.rating}</span>
            </span>
            <span className="text-stone-600" aria-hidden="true">·</span>
            <span className="font-mono text-stone-300">
              {currentApp.downloads_count.toLocaleString()} dl
            </span>
            <span className="text-stone-600" aria-hidden="true">·</span>
            <span className="font-mono text-stone-300">{currentApp.file_size}</span>
          </div>

          {/* Action Buttons: Small touch buttons on mobile screens */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2.5">
            <button
              onClick={() => onSelectApp(currentApp)}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-[10px] sm:text-xs flex items-center gap-1 shadow-md shadow-amber-500/25 transition-all"
            >
              <span>Explore</span>
              <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </button>

            <button
              onClick={() => onDownloadApk(currentApp)}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#1c1510]/80 hover:bg-[#251b14] text-amber-300 border border-amber-500/30 hover:border-amber-400 font-semibold text-[10px] sm:text-xs flex items-center gap-1 transition-all"
            >
              <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>APK ({currentApp.file_size})</span>
            </button>

            <button
              onClick={onOpenDemandModal}
              className="px-2 sm:px-3 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-[10px] sm:text-xs flex items-center gap-1 transition-all"
            >
              <MessageSquarePlus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>Ask for App</span>
            </button>
          </div>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        <div className="relative z-10 mt-2.5 sm:mt-4 pt-1.5 sm:pt-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {featuredApps.map((app, idx) => (
              <button
                key={app.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === idx
                    ? 'w-4 sm:w-6 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : 'w-1.5 bg-stone-700 hover:bg-stone-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1 sm:p-1.5 rounded-lg bg-stone-900/70 hover:bg-amber-500 hover:text-black text-stone-300 border border-amber-500/20 transition-colors h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center"
              aria-label="Previous Featured App"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 sm:p-1.5 rounded-lg bg-stone-900/70 hover:bg-amber-500 hover:text-black text-stone-300 border border-amber-500/20 transition-colors h-6 w-6 sm:h-8 sm:w-8 flex items-center justify-center"
              aria-label="Next Featured App"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
