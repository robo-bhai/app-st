import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Download, Check, Sparkles } from 'lucide-react';

interface DirectDownloadQRCodeProps {
  appName: string;
  apkUrl: string;
  apkFileName: string;
  size?: number;
}

export const DirectDownloadQRCode: React.FC<DirectDownloadQRCodeProps> = ({
  appName,
  apkUrl,
  apkFileName,
  size = 140
}) => {
  // Construct direct download link
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://hadi88apps.com';
  // Link to download or deep link
  const downloadLink = apkUrl.startsWith('http') 
    ? apkUrl 
    : `${currentHost}/#download=${encodeURIComponent(apkFileName)}`;

  return (
    <div className="p-3.5 rounded-2xl bg-[#17100b] border border-amber-500/25 flex flex-col sm:flex-row items-center gap-3.5 shadow-xl">
      {/* QR Code Container with High-Contrast Background for fast scanning */}
      <div className="relative p-2.5 bg-white rounded-xl shadow-md border-2 border-amber-400 shrink-0 group">
        <QRCodeSVG 
          value={downloadLink}
          size={size}
          level="M"
          includeMargin={false}
          imageSettings={{
            src: "https://api.dicebear.com/7.x/identicon/svg?seed=Hadi88AppStore&backgroundColor=f59e0b",
            x: undefined,
            y: undefined,
            height: 24,
            width: 24,
            excavate: true,
          }}
        />
        <div className="absolute inset-0 rounded-xl border border-amber-500/20 pointer-events-none" />
      </div>

      {/* Instructions & Details */}
      <div className="flex-1 space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
          <Smartphone className="w-3 h-3 text-amber-400" />
          <span>Direct Mobile Scan</span>
        </div>

        <h4 className="text-xs sm:text-sm font-display font-bold text-white leading-tight">
          Scan to Install on Android
        </h4>

        <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
          Open your phone's Camera or Google Lens and scan this QR code to download <strong className="text-amber-300">{apkFileName}</strong> instantly without typing links.
        </p>

        <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[9px] text-stone-400 font-mono">
          <span className="flex items-center gap-1 text-emerald-400">
            <Check className="w-3 h-3" /> No Login Required
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-amber-400">
            <Sparkles className="w-3 h-3" /> High-Speed Direct CDN
          </span>
        </div>
      </div>
    </div>
  );
};
