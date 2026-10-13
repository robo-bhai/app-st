from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
import os
import base64
from urllib.parse import quote
from django.conf import settings

CATEGORY_CHOICES = [
    ('Games', 'Games'),
    ('Productivity', 'Productivity'),
    ('Tools', 'Tools'),
    ('Social', 'Social'),
    ('Entertainment', 'Entertainment'),
    ('Finance', 'Finance'),
    ('Photography', 'Photography'),
    ('Health & Fitness', 'Health & Fitness'),
]

DEMAND_STATUS_CHOICES = [
    ('Pending', 'Pending Review'),
    ('In Review', 'In Review'),
    ('Approved', 'Approved'),
    ('In Development', 'In Development'),
    ('Rejected', 'Rejected'),
]

PLATFORM_CHOICES = [
    ('Android', 'Android (APK)'),
    ('iOS', 'iOS (Swift)'),
    ('Cross-Platform', 'Cross-Platform (Flutter / React Native)'),
    ('Web App', 'Web Application / PWA'),
]

def safe_folder_name(instance):
    pkg = getattr(instance, 'package_name', '')
    if pkg and pkg.strip():
        return slugify(pkg.strip()).replace('-', '_')
    name = getattr(instance, 'app_name', 'app')
    return slugify(name or 'app').replace('-', '_')

def app_icon_upload_path(instance, filename):
    clean_filename = os.path.basename(filename).replace(' ', '_')
    return f"icons/{safe_folder_name(instance)}/{clean_filename}"

def app_banner_upload_path(instance, filename):
    clean_filename = os.path.basename(filename).replace(' ', '_')
    return f"banners/{safe_folder_name(instance)}/{clean_filename}"

def apk_upload_path(instance, filename):
    clean_filename = os.path.basename(filename).replace(' ', '_')
    return f"apks/{safe_folder_name(instance)}/{clean_filename}"

def generate_app_icon_svg(app_name: str, category: str = 'Tools') -> str:
    """
    Generates a high-resolution, self-contained SVG Data URI icon.
    Works 100% offline, requires ZERO external network calls, never breaks!
    """
    palettes = {
        'Games': ('#d97706', '#b45309', '#fef3c7'),
        'Productivity': ('#f59e0b', '#78350f', '#fffbeb'),
        'Tools': ('#059669', '#064e3b', '#ecfdf5'),
        'Social': ('#ec4899', '#831843', '#fdf2f8'),
        'Entertainment': ('#8b5cf6', '#4c1d95', '#f5f3ff'),
        'Finance': ('#10b981', '#047857', '#d1fae5'),
        'Photography': ('#06b6d4', '#164e63', '#cffafe'),
        'Health & Fitness': ('#f97316', '#7c2d12', '#ffedd5'),
    }
    c_from, c_to, c_text = palettes.get(category, ('#d97706', '#451a03', '#fef3c7'))
    clean_name = (app_name or 'Hadi88 App').strip()
    words = [w for w in clean_name.split() if w]
    initials = ''.join(w[0].upper() for w in words[:2]) if words else clean_name[:2].upper()
    safe_name = quote(clean_name)

    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">'
        f'<defs>'
        f'<linearGradient id="grad-{safe_name}" x1="0%" y1="0%" x2="100%" y2="100%">'
        f'<stop offset="0%" stop-color="{c_from}" />'
        f'<stop offset="100%" stop-color="{c_to}" />'
        f'</linearGradient>'
        f'</defs>'
        f'<rect width="128" height="128" rx="28" fill="url(#grad-{safe_name})" />'
        f'<rect x="4" y="4" width="120" height="120" rx="24" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />'
        f'<circle cx="64" cy="64" r="40" fill="rgba(0,0,0,0.25)" />'
        f'<text x="64" y="73" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="34" font-weight="900" fill="{c_text}" text-anchor="middle" dominant-baseline="middle">'
        f'{initials}'
        f'</text>'
        f'</svg>'
    )
    b64 = base64.b64encode(svg.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{b64}"


class App(models.Model):
    """
    Hadi88 Apps - Core Application Model
    """
    app_name = models.CharField(max_length=150, verbose_name="Application Name")
    package_name = models.CharField(max_length=150, unique=True, db_index=True, verbose_name="Package Name (e.g. com.hadi88.app)")
    developer_name = models.CharField(max_length=120, default="Hadi88 Studio", verbose_name="Developer Name")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Tools', db_index=True)
    app_icon = models.ImageField(upload_to=app_icon_upload_path, verbose_name="App Icon (512x512)")
    banner_image = models.ImageField(upload_to=app_banner_upload_path, blank=True, null=True, verbose_name="Featured Banner (16:9)")
    description = models.TextField(verbose_name="Full Description")
    version = models.CharField(max_length=20, default="1.0.0", verbose_name="Version")
    apk_file = models.FileField(
        upload_to=apk_upload_path,
        validators=[FileExtensionValidator(allowed_extensions=['apk', 'xapk', 'zip'])],
        verbose_name="APK Binary Package"
    )
    file_size = models.CharField(max_length=20, default="25 MB", verbose_name="File Size (e.g. 45 MB)")
    downloads_count = models.PositiveIntegerField(default=0, db_index=True, verbose_name="Total Downloads")
    rating = models.DecimalField(
        max_digits=3, decimal_places=2, default=4.50,
        validators=[MinValueValidator(1.00), MaxValueValidator(5.00)],
        verbose_name="Rating (1.00 - 5.00)"
    )
    is_featured = models.BooleanField(default=False, help_text="Showcase in hero carousel")
    is_published = models.BooleanField(default=True, help_text="Publicly visible in store")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-downloads_count', '-created_at']
        verbose_name = "Application"
        verbose_name_plural = "Applications"

    def __str__(self):
        return f"{self.app_name} (v{self.version}) - {self.developer_name}"

    def save(self, *args, **kwargs):
        if not self.package_name:
            self.package_name = f"com.hadi88.{slugify(self.app_name).replace('-', '')}"
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return reverse('app_detail', kwargs={'package_name': self.package_name})

    @property
    def formatted_downloads(self):
        if self.downloads_count >= 1_000_000:
            return f"{self.downloads_count / 1_000_000:.1f}M+"
        elif self.downloads_count >= 1_000:
            return f"{self.downloads_count / 1_000:.0f}K+"
        return str(self.downloads_count)

    @property
    def safe_icon_url(self):
        """
        Guaranteed working icon URL in all environments:
        1. Cloudinary or remote http(s) URL if configured
        2. Local media file if exists on disk across media, static, or public dirs
        3. Inline base64 SVG Data URI fallback (works 100% offline, zero network calls, never breaks!)
        """
        if self.app_icon:
            try:
                url = str(self.app_icon.url)
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                # Check absolute path on filesystem
                if hasattr(self.app_icon, 'path') and os.path.exists(self.app_icon.path):
                    return url
                # Check multiple candidate directories
                fname = str(self.app_icon.name)
                bname = os.path.basename(fname)
                candidates = [
                    os.path.join(settings.MEDIA_ROOT, fname),
                    os.path.join(settings.BASE_DIR, 'media', fname),
                    os.path.join(settings.BASE_DIR, 'media', 'icons', bname),
                    os.path.join(settings.BASE_DIR, 'public', 'images', bname),
                    os.path.join(settings.BASE_DIR, 'static', 'images', bname),
                ]
                for cand in candidates:
                    if os.path.exists(cand):
                        return f"{settings.MEDIA_URL}{fname}" if cand.startswith(str(settings.MEDIA_ROOT)) else f"/images/{bname}"
            except Exception:
                pass

        # Return guaranteed inline base64 SVG icon
        return generate_app_icon_svg(self.app_name, self.category)

    @property
    def safe_banner_url(self):
        """
        Guaranteed working banner image in safe mode or with Cloudinary.
        Falls back to curated category banners from static assets.
        """
        if self.banner_image:
            try:
                url = str(self.banner_image.url)
                if url.startswith('http://') or url.startswith('https://'):
                    return url
                if hasattr(self.banner_image, 'path') and os.path.exists(self.banner_image.path):
                    return url
                fname = str(self.banner_image.name)
                bname = os.path.basename(fname)
                candidates = [
                    os.path.join(settings.MEDIA_ROOT, fname),
                    os.path.join(settings.BASE_DIR, 'media', fname),
                    os.path.join(settings.BASE_DIR, 'media', 'banners', bname),
                    os.path.join(settings.BASE_DIR, 'public', 'images', bname),
                    os.path.join(settings.BASE_DIR, 'static', 'images', bname),
                ]
                for cand in candidates:
                    if os.path.exists(cand):
                        return f"{settings.MEDIA_URL}{fname}" if cand.startswith(str(settings.MEDIA_ROOT)) else f"/images/{bname}"
            except Exception:
                pass

        if self.category == 'Games':
            return '/images/app_cyber_strike_1791093769332.jpg'
        elif self.category == 'Productivity':
            return '/images/app_zenith_productivity_1791093784758.jpg'
        elif self.category == 'Social':
            return '/images/app_lunar_social_1791093799108.jpg'
        return '/images/hero_app_showcase_1791093747904.jpg'


class AppDemand(models.Model):
    """
    Hadi88 Apps - On-Demand Custom App Requests from Users
    "Find and ask for your dreaming apps"
    "We are building app on your demand"
    """
    user_name = models.CharField(max_length=120, verbose_name="User Name")
    email = models.EmailField(verbose_name="User Email")
    contact_method = models.CharField(
        max_length=20, 
        choices=[('Email', 'Email'), ('WhatsApp', 'WhatsApp'), ('Telegram', 'Telegram')],
        default='Email'
    )
    contact_handle = models.CharField(max_length=100, blank=True, verbose_name="Phone / Username Handle")
    app_title = models.CharField(max_length=150, verbose_name="Dreaming App Concept Title")
    platform = models.CharField(max_length=30, choices=PLATFORM_CHOICES, default='Android')
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Productivity')
    requirements = models.TextField(verbose_name="Detailed App Requirements & Workflows")
    timeline = models.CharField(max_length=50, default="2-4 Weeks", verbose_name="Desired Delivery Timeline")
    budget = models.CharField(max_length=50, default="$1,000 - $3,000", verbose_name="Estimated Budget")
    status = models.CharField(max_length=30, choices=DEMAND_STATUS_CHOICES, default='Pending', db_index=True)
    legal_policy_agreed = models.BooleanField(
        default=False,
        help_text="User strictly affirmed that requested app contains no illegal, pirated, or theft material."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Client App Demand"
        verbose_name_plural = "Client App Demands"

    def __str__(self):
        return f"{self.app_title} by {self.user_name} [{self.status}]"


class AppReview(models.Model):
    """
    User Reviews & Comments System for Verified APK Installs
    """
    app = models.ForeignKey(App, on_delete=models.CASCADE, related_name='user_reviews')
    user_name = models.CharField(max_length=100, verbose_name="Reviewer Name")
    user_avatar = models.URLField(blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5, verbose_name="Star Rating (1-5)")
    comment = models.TextField(verbose_name="User Review")
    device_model = models.CharField(max_length=100, blank=True, default="Android Device")
    helpful_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "App Review"
        verbose_name_plural = "App Reviews"

    def __str__(self):
        return f"{self.user_name} on {self.app.app_name} ({self.rating}★)"

