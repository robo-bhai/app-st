import { AppModel } from '../types/app';

/**
 * Helper to safely slugify app name for filename
 */
function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_').toLowerCase();
}

/**
 * Helper to wrap text cleanly in canvas
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number = 3
): number {
  const words = text.split(/\s+/);
  let line = '';
  let linesDrawn = 0;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      if (linesDrawn === maxLines - 1 && n < words.length - 1) {
        ctx.fillText(line.trim() + '...', x, y);
        return y + lineHeight;
      }
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
      linesDrawn++;
      if (linesDrawn >= maxLines) break;
    } else {
      line = testLine;
    }
  }
  if (line.trim() && linesDrawn < maxLines) {
    ctx.fillText(line.trim(), x, y);
    y += lineHeight;
  }
  return y;
}

/**
 * Draw a rounded rectangle on Canvas
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Loads image safely with CORS handling; returns null if it cannot be drawn
 */
async function loadSafeImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Generates and downloads a high-resolution, beautifully styled QR Code card image
 * containing App Name, Version, QR Code, and short details.
 */
export async function downloadAppQrCodeCard(
  app: AppModel,
  qrSourceCanvas?: HTMLCanvasElement | null,
  directDownloadUrl?: string
): Promise<boolean> {
  try {
    // 1. Setup Canvas dimensions (Retina ready: 760 x 1020)
    const width = 760;
    const height = 1040;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 2. Background Gradient (Sleek Obsidian & Warm Amber Undertones)
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1c130c');
    bgGradient.addColorStop(0.35, '#120d09');
    bgGradient.addColorStop(1, '#080605');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Golden Glow behind QR Code
    const glowGradient = ctx.createRadialGradient(width / 2, 530, 40, width / 2, 530, 260);
    glowGradient.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
    glowGradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = glowGradient;
    ctx.fillRect(0, 300, width, 480);

    // Outer Card Border with Golden Metallic Stroke
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    drawRoundedRect(ctx, 16, 16, width - 32, height - 32, 28);
    ctx.stroke();

    // Inner subtle border line
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    drawRoundedRect(ctx, 24, 24, width - 48, height - 48, 22);
    ctx.stroke();

    // 3. TOP BRANDING HEADER
    // Store Badge Pill
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    drawRoundedRect(ctx, width / 2 - 130, 44, 260, 34, 17);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, width / 2 - 130, 44, 260, 34, 17);
    ctx.stroke();

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★  HADI88 APPS STORE  ★', width / 2, 66);

    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('VERIFIED ANDROID PACKAGE · VIRUSTOTAL 0/74 CLEAN', width / 2, 102);

    // 4. APP INFO HEADER SECTION
    const headerY = 126;
    const iconSize = 96;
    const iconX = 48;
    const iconY = headerY;

    // Load App Icon safely (or draw fallback monogram)
    let iconImg: HTMLImageElement | null = null;
    const iconUrl = app.icon_link || app.app_icon;
    if (iconUrl) {
      iconImg = await loadSafeImage(iconUrl);
    }

    if (iconImg) {
      ctx.save();
      drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 20);
      ctx.clip();
      ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);
      ctx.restore();
    } else {
      // Fallback Icon Box
      const iconGrad = ctx.createLinearGradient(iconX, iconY, iconX + iconSize, iconY + iconSize);
      iconGrad.addColorStop(0, '#f59e0b');
      iconGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = iconGrad;
      drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 20);
      ctx.fill();

      // App initial monogram
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 44px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((app.app_name[0] || 'A').toUpperCase(), iconX + iconSize / 2, iconY + 66);
    }

    // Icon Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, 20);
    ctx.stroke();

    // App Text Details (Right of Icon)
    const textStartX = iconX + iconSize + 20;
    const textMaxWidth = width - textStartX - 48;

    // App Name
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px system-ui, -apple-system, sans-serif';
    const appNameTitle = app.app_name.length > 24 ? app.app_name.slice(0, 24) + '...' : app.app_name;
    ctx.fillText(appNameTitle, textStartX, headerY + 30);

    // Developer Name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(`by ${app.developer_name}`, textStartX, headerY + 54);

    // Badges Row: Version & Category & Size
    // Version Pill
    const versionText = `v${app.version}`;
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    const versionWidth = ctx.measureText(versionText).width + 16;
    ctx.fillStyle = '#f59e0b';
    drawRoundedRect(ctx, textStartX, headerY + 66, versionWidth, 24, 12);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.fillText(versionText, textStartX + 8, headerY + 83);

    // Category & Size Text
    ctx.fillStyle = '#d6d3d1';
    ctx.font = '500 12px system-ui, -apple-system, sans-serif';
    const metaText = `${app.category}  •  ${app.file_size}  •  ★ ${app.rating.toFixed(1)}`;
    ctx.fillText(metaText, textStartX + versionWidth + 12, headerY + 83);

    // 5. CENTERPIECE: QR CODE BOX
    const qrContainerSize = 340;
    const qrContainerX = (width - qrContainerSize) / 2;
    const qrContainerY = 250;

    // White High-Contrast Container for instant camera scan
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 24);
    ctx.fill();

    // Container Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.5;
    drawRoundedRect(ctx, qrContainerX, qrContainerY, qrContainerSize, qrContainerSize, 24);
    ctx.stroke();

    // Draw the QR Code inside container
    const qrInnerSize = 290;
    const qrInnerX = qrContainerX + (qrContainerSize - qrInnerSize) / 2;
    const qrInnerY = qrContainerY + (qrContainerSize - qrInnerSize) / 2;

    if (qrSourceCanvas) {
      // Draw directly from existing rendered QR canvas
      ctx.drawImage(qrSourceCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
    } else {
      // Fallback: fetch from qrserver with CORS or draw placeholder
      const encodedUrl = encodeURIComponent(
        directDownloadUrl || 
        (app.binary_link || `https://hadi88apps.com/#download=${encodeURIComponent(app.package_name)}`)
      );
      const fallbackQrImg = await loadSafeImage(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedUrl}`
      );
      if (fallbackQrImg) {
        ctx.drawImage(fallbackQrImg, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize);
      } else {
        // Fallback message if image couldn't load
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QR Code Ready', qrContainerX + qrContainerSize / 2, qrContainerY + qrContainerSize / 2);
      }
    }

    // Label directly under QR
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.fillText('SCAN WITH PHONE CAMERA TO INSTALL', width / 2, qrContainerY + qrContainerSize + 36);

    ctx.fillStyle = '#a8a29e';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText('Works with Android Camera, Google Lens & any QR Scanner', width / 2, qrContainerY + qrContainerSize + 56);

    // 6. SHORT DETAILS & HIGHLIGHTS BOX
    const detailsBoxY = qrContainerY + qrContainerSize + 76;
    const detailsBoxWidth = width - 80;
    const detailsBoxHeight = 190;
    const detailsBoxX = 40;

    // Details background container
    ctx.fillStyle = 'rgba(23, 16, 11, 0.85)';
    drawRoundedRect(ctx, detailsBoxX, detailsBoxY, detailsBoxWidth, detailsBoxHeight, 20);
    ctx.fill();

    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, detailsBoxX, detailsBoxY, detailsBoxWidth, detailsBoxHeight, 20);
    ctx.stroke();

    // Details Header
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText('APPLICATION HIGHLIGHTS & SHORT DETAILS', detailsBoxX + 20, detailsBoxY + 30);

    // App Short Description / Overview text
    ctx.fillStyle = '#e7e5e4';
    ctx.font = '13px system-ui, -apple-system, sans-serif';
    const cleanDescription = (app.description || 'Download and enjoy official Android package with high-speed performance.')
      .replace(/\n+/g, ' ')
      .trim();
    wrapText(ctx, cleanDescription, detailsBoxX + 20, detailsBoxY + 54, detailsBoxWidth - 40, 19, 2);

    // 3 Feature Tags
    const tagY = detailsBoxY + 115;
    const tags = [
      { text: '✓  Direct APK Install', color: '#34d399' },
      { text: '✓  100% Virus-Free', color: '#34d399' },
      { text: `✓  ${app.min_android_version || 'Android 8.0+'}`, color: '#60a5fa' },
      { text: '✓  No Account Needed', color: '#fbbf24' }
    ];

    let currentTagX = detailsBoxX + 20;
    tags.forEach((tag) => {
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      const tagTextWidth = ctx.measureText(tag.text).width;
      const pillWidth = tagTextWidth + 16;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      drawRoundedRect(ctx, currentTagX, tagY, pillWidth, 26, 13);
      ctx.fill();

      ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, currentTagX, tagY, pillWidth, 26, 13);
      ctx.stroke();

      ctx.fillStyle = tag.color;
      ctx.fillText(tag.text, currentTagX + 8, tagY + 17);

      currentTagX += pillWidth + 8;
    });

    // Package identifier text
    ctx.fillStyle = '#78716c';
    ctx.font = '11px monospace';
    ctx.fillText(`Package: ${app.package_name}  •  Direct Binary: ${app.binary_link ? 'GitHub Releases' : 'Hosted APK'}`, detailsBoxX + 20, detailsBoxY + 168);

    // 7. FOOTER
    ctx.textAlign = 'center';
    ctx.fillStyle = '#78716c';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Find and ask for your dreaming apps  •  Hadi88 Apps Store', width / 2, height - 42);

    // 8. Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${sanitizeFilename(app.app_name)}_v${app.version}_QRCode.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (err) {
    console.error('Error generating QR card image:', err);
    return false;
  }
}
