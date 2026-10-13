import confetti from 'canvas-confetti';
import { AppModel } from '../types/app';

/**
 * Triggers a realistic downloadable APK file in the user's browser,
 * increments the download counter, and fires a golden amber confetti burst.
 */
export function downloadAppApk(app: AppModel, onDownloadComplete?: (appId: string) => void) {
  // 1. Create a simulated signed Android package binary content
  const manifestContent = `
================================================================================
ANDROID APPLICATION PACKAGE (APK)
App Name:     ${app.app_name}
Package:      ${app.package_name}
Developer:    ${app.developer_name}
Category:     ${app.category}
Version:      ${app.version}
File Size:    ${app.file_size}
Architecture: arm64-v8a / armeabi-v7a
Signature:    v3 (APK Signature Scheme v3 Verified)
Target SDK:   Android 14 (API level 34)
Min SDK:      ${app.min_android_version || 'Android 9.0 (API level 28)'}
Permissions:  INTERNET, ACCESS_NETWORK_STATE, VIBRATE, WAKE_LOCK
================================================================================

This package was generated and served by the AppStore Django Engine.
To install on your Android device:
1. Enable 'Install Unknown Apps' for your file manager or browser.
2. Open this APK package to initiate Android Package Installer.

Release Notes:
${app.whats_new || 'Initial stable production release.'}
`.trim();

  const blob = new Blob([manifestContent], { type: 'application/vnd.android.package-archive' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = app.apk_file || `${app.package_name}_v${app.version}.apk`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  // 2. Fire celebratory amber/golden confetti
  try {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff']
    });
  } catch {
    // Ignore in non-canvas environments
  }

  // 3. Callback to increment count
  if (onDownloadComplete) {
    onDownloadComplete(app.id);
  }
}
