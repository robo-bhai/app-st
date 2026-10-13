/**
 * Safe Image & Icon Utilities for Hadi88 Apps
 * Ensures 100% reliable icon and banner rendering without broken images.
 */

// Category gradient color palettes
const CATEGORY_PALETTES: Record<string, { from: string; to: string; text: string }> = {
  Games: { from: '#d97706', to: '#b45309', text: '#fef3c7' },
  Productivity: { from: '#f59e0b', to: '#78350f', text: '#fffbeb' },
  Tools: { from: '#059669', to: '#064e3b', text: '#ecfdf5' },
  Social: { from: '#ec4899', to: '#831843', text: '#fdf2f8' },
  Entertainment: { from: '#8b5cf6', to: '#4c1d95', text: '#f5f3ff' },
  Finance: { from: '#10b981', to: '#047857', text: '#d1fae5' },
  Photography: { from: '#06b6d4', to: '#164e63', text: '#cffafe' },
  'Health & Fitness': { from: '#f97316', to: '#7c2d12', text: '#ffedd5' },
};

/**
 * Returns a high-res SVG Data URI for any app icon
 * Guaranteed to never fail, works 100% offline without external network dependencies.
 */
export function getAppIconSvg(appName: string, category: string = 'Tools'): string {
  const palette = CATEGORY_PALETTES[category] || { from: '#d97706', to: '#451a03', text: '#fef3c7' };
  const initials = appName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || appName.slice(0, 2).toUpperCase() || 'H';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
    <defs>
      <linearGradient id="grad-${encodeURIComponent(appName)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${palette.from}" />
        <stop offset="100%" stop-color="${palette.to}" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.35"/>
      </filter>
    </defs>
    <rect width="128" height="128" rx="28" fill="url(#grad-${encodeURIComponent(appName)})" />
    <rect x="4" y="4" width="120" height="120" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
    <circle cx="64" cy="64" r="42" fill="rgba(0,0,0,0.22)" filter="url(#shadow)" />
    <text x="64" y="73" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="900" fill="${palette.text}" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">
      ${initials}
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Normalizes app icon URL, ensuring local and relative paths resolve cleanly.
 */
export function resolveAppIcon(iconUrl: string | undefined, appName: string, category: string = 'Tools'): string {
  if (!iconUrl || iconUrl.trim() === '') {
    return getAppIconSvg(appName, category);
  }

  // If path starts with /src/assets/images, redirect to /images/
  if (iconUrl.startsWith('/src/assets/images/')) {
    return iconUrl.replace('/src/assets/images/', '/images/');
  }

  return iconUrl;
}

/**
 * Safe Image Error Handler: Replaces broken image with inline SVG immediately
 */
export function handleImageFallback(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  appName: string,
  category: string = 'Tools'
) {
  const target = event.currentTarget;
  const fallback = getAppIconSvg(appName, category);
  if (target.src !== fallback) {
    target.src = fallback;
  }
}

/**
 * Resolves banner image or fallback gradient banner
 */
export function resolveBannerImage(bannerUrl: string | undefined): string {
  if (!bannerUrl) return '/images/hero_app_showcase_1791093747904.jpg';
  if (bannerUrl.startsWith('/src/assets/images/')) {
    return bannerUrl.replace('/src/assets/images/', '/images/');
  }
  return bannerUrl;
}
