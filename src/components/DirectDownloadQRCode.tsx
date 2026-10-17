import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Smartphone, Download, Check, Sparkles, ImageDown, Loader2 } from 'lucide-react';
import { AppModel } from '../types/app';
import { downloadAppQrCodeCard } from '../utils/qrCardGenerator';

interface DirectDownloadQRCodeProps {
  appName: string;
  apkUrl: string;
  apkFileName: string;
  size?: number;
  app?: AppModel;
}

export const DirectDownloadQRCode: React.FC<DirectDownloadQRCodeProps> = ({
  appName,
  apkUrl,
  apkFileName,
  size = 140,
  app
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Construct direct download link
  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://hadi88apps.com';
  const downloadLink = apkUrl.startsWith('http') 
    ? apkUrl 
    : `${currentHost}/#download=${encodeURIComponent(apkFileName)}`;

  // Construct fallback AppModel if full app wasn't provided
  const appData: AppModel = app || {
    id: 'app-default',
    app_name: appName,
    package_name: apkFileName.replace('.apk', ''),
    developer_name: 'Hadi88 Verified Developer',
    category: 'Productivity',
    app_icon: '',
    description: `Official Android package for ${appName}. Download and install directly onto your device.`,
    version: '1.0.0',
    file_size: '25 MB',
    downloads_count: 50000,
    rating: 4.8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const handleDownloadQrImage = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      const success = await downloadAppQrCodeCard(appData, qrCanvasRef.current, downloadLink);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to download QR code image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-[#17100b] border border-amber-500/25 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
      {/* QR Code Container with High-Contrast Background for fast scanning */}
      <div className="relative p-2.5 bg-white rounded-xl shadow-md border-2 border-amber-400 shrink-0 group">
        <QRCodeCanvas 
          ref={qrCanvasRef}
          value={downloadLink}
          size={size}
          level="H"
          marginSize={1}
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
      <div className="flex-1 space-y-2 text-center sm:text-left w-full">
        <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300">
            <Smartphone className="w-3 h-3 text-amber-400" />
            <span>Direct Mobile Scan</span>
          </span>
          <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Scanned Clean
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-display font-bold text-white leading-tight">
          Scan to Install on Android
        </h4>

        <p className="text-[10px] sm:text-[11px] text-stone-300 leading-snug">
          Open your phone's Camera or Google Lens to download <strong className="text-amber-300">{appName}</strong> directly without cables.
        </p>

        {/* Action Button: Download QR Code Card Image */}
        <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <button
            type="button"
            onClick={handleDownloadQrImage}
            disabled={isDownloading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              downloadSuccess
                ? 'bg-emerald-500 text-black shadow-emerald-500/30'
                : isDownloading
                ? 'bg-amber-500/40 text-amber-200 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25 active:scale-95'
            }`}
            title="Download high-resolution image with QR code, app name, version, and short details"
          >
            {downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>QR Image Downloaded!</span>
              </>
            ) : isDownloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Card...</span>
              </>
            ) : (
              <>
                <ImageDown className="w-3.5 h-3.5" />
                <span>Download QR Code Image</span>
              </>
            )}
          </button>

          <span className="text-[10px] text-stone-400 hidden md:inline">
            Includes Name, Version & Specs
          </span>
        </div>

        <div className="pt-0.5 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[9px] text-stone-400 font-mono">
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
