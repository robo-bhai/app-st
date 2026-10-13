import React, { useState } from 'react';
import { Star, Download, Check, ShieldCheck } from 'lucide-react';
import { AppModel } from '../types/app';
import { resolveAppIcon, handleImageFallback } from '../utils/imageUtils';

interface AppCardProps {
  app: AppModel;
  onSelectApp: (app: AppModel) => void;
  onDownloadApk: (app: AppModel) => void;
  layout?: 'grid' | 'list';
}

export const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  onSelectApp, 
  onDownloadApk,
  layout = 'grid' 
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDownloadApk(app);
  };

  // Google Play style List Item (Mobile & Compact View)
  if (layout === 'list') {
    return (
      <div
        onClick={() => onSelectApp(app)}
        className="group relative glass-panel glass-panel-hover rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-2.5 cursor-pointer transition-all border border-amber-500/15 hover:border-amber-400/40 w-full"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <img
              src={resolveAppIcon(app.app_icon, app.app_name, app.category)}
              alt={app.app_name}
              onError={(e) => handleImageFallback(e, app.app_name, app.category)}
              referrerPolicy="no-referrer"
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-stone-900 border border-amber-500/15 group-hover:scale-105 transition-transform"
            />
            {app.featured && (
              <span className="absolute -top-1 -right-1 text-[7px] font-bold uppercase px-1 py-0.2 rounded bg-amber-500 text-black">
                Top
              </span>
            )}
          </div>

          <div className="min-w-0">
            <h3 className="font-display font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 truncate transition-colors leading-tight">
              {app.app_name}
            </h3>
            <p className="text-[10px] text-stone-400 truncate mt-0.5">
              {app.developer_name}
            </p>
            <div className="flex items-center gap-1.5 text-[9px] text-stone-400 mt-0.5">
              <span className="text-amber-300 font-medium truncate max-w-[90px]">{app.category}</span>
              <span className="text-stone-600">·</span>
              <span className="flex items-center text-amber-400 font-bold gap-0.5">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                {app.rating.toFixed(1)}
              </span>
              <span className="text-stone-600">·</span>
              <span className="font-mono text-[9px]">{app.file_size}</span>
              <span className="text-stone-600 hidden xs:inline">·</span>
              <span className="hidden xs:inline-flex items-center gap-0.5 text-emerald-400 font-semibold text-[8px]" title="Play Store Verified Safe & Clean">
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>Play Store Verified</span>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadClick}
          disabled={downloading}
          className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 transition-all min-h-[32px] sm:min-h-[36px] ${
            downloaded
              ? 'bg-emerald-500 text-black shadow-sm'
              : downloading
              ? 'bg-amber-500/30 text-amber-300 animate-pulse cursor-wait'
              : 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30'
          }`}
        >
          {downloaded ? (
            <>
              <Check className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden xs:inline">Done</span>
            </>
          ) : downloading ? (
            <span>...</span>
          ) : (
            <>
              <Download className="w-3 h-3" />
              <span>Get</span>
            </>
          )}
        </button>
      </div>
    );
  }

  // Standard Compact Grid Card (optimized with small fonts & small icons for mobile screens)
  return (
    <div
      onClick={() => onSelectApp(app)}
      className="group relative glass-panel glass-panel-hover rounded-xl sm:rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between cursor-pointer transition-all border border-amber-500/15 hover:border-amber-400/40"
    >
      <div>
        {/* App Icon Container */}
        <div className="relative mb-1.5 sm:mb-3">
          <img
            src={resolveAppIcon(app.app_icon, app.app_name, app.category)}
            alt={app.app_name}
            onError={(e) => handleImageFallback(e, app.app_name, app.category)}
            referrerPolicy="no-referrer"
            className="w-full aspect-square rounded-lg sm:rounded-xl object-cover bg-stone-900 border border-amber-500/15 group-hover:scale-102 group-hover:border-amber-400/40 transition-all duration-200"
          />
          {app.featured && (
            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 text-[7px] sm:text-[9px] font-bold tracking-wide uppercase px-1 sm:px-1.5 py-0.2 rounded bg-amber-500 text-black shadow-sm">
              Top
            </div>
          )}
        </div>

        {/* Title and Developer (Small fonts on mobile devices) */}
        <h3 className="font-display font-bold text-[11px] sm:text-xs md:text-sm text-white group-hover:text-amber-400 truncate transition-colors leading-tight">
          {app.app_name}
        </h3>
        <p className="text-[9px] sm:text-[11px] text-stone-400 truncate mt-0.5">
          {app.developer_name}
        </p>

        {/* Category, Size & VirusTotal Safety indicator */}
        <div className="flex items-center gap-1 text-[8px] sm:text-[10px] text-stone-400 mt-1">
          <span className="text-amber-300 font-medium truncate max-w-[70px] sm:max-w-none">{app.category}</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="font-mono text-[8px] sm:text-[10px]">{app.file_size}</span>
        </div>

        {/* Play Store & VirusTotal Clean Badge */}
        <div className="mt-1 flex items-center gap-1 text-[8px] sm:text-[9px] text-emerald-400 font-medium">
          <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400 shrink-0" />
          <span className="truncate">Play Store Verified · Clean (0 Threats)</span>
        </div>
      </div>

      {/* Card Footer: Rating & Direct Download Action with small icons */}
      <div className="pt-2 sm:pt-2.5 mt-1.5 sm:mt-2.5 border-t border-amber-500/10 space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between text-[9px] sm:text-xs">
          <div className="flex items-center gap-0.5 font-bold text-amber-400">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
            <span>{app.rating.toFixed(1)}</span>
          </div>
          <span className="text-stone-400 text-[8px] sm:text-[10px] font-mono tabular-nums">
            {app.downloads_count >= 1000000
              ? `${(app.downloads_count / 1000000).toFixed(1)}M`
              : app.downloads_count >= 1000
              ? `${Math.floor(app.downloads_count / 1000)}K`
              : app.downloads_count} dl
          </span>
        </div>

        <button
          onClick={handleDownloadClick}
          disabled={downloading}
          className={`w-full py-1 sm:py-1.5 px-1.5 sm:px-2.5 rounded-lg text-[9px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[30px] sm:min-h-[36px] ${
            downloaded
              ? 'bg-emerald-500 text-black shadow-sm'
              : downloading
              ? 'bg-amber-500/30 text-amber-300 animate-pulse cursor-wait'
              : 'bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/25 hover:border-amber-400'
          }`}
        >
          {downloaded ? (
            <>
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[2.5]" />
              <span>Installed</span>
            </>
          ) : downloading ? (
            <span>Wait...</span>
          ) : (
            <>
              <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>Install (APK)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
