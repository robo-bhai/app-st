import { DjangoFile } from '../types/app';

export const DJANGO_FILES: DjangoFile[] = [
  {
    name: 'models.py',
    path: 'store/models.py',
    language: 'python',
    description: 'Django ORM App & AppDemand models with validation, slug generation, and client demand logging',
    content: `from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
import os

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

def app_icon_upload_path(instance, filename):
    return f"icons/{instance.package_name}/{filename}"

def app_banner_upload_path(instance, filename):
    return f"banners/{instance.package_name}/{filename}"

def apk_upload_path(instance, filename):
    return f"apks/{instance.package_name}/{filename}"


class App(models.Model):
    """
    Hadi88 Apps - Core Application Model
    """
    app_name = models.CharField(max_length=150, verbose_name="Application Name")
    package_name = models.SlugField(max_length=150, unique=True, verbose_name="Package Name (Slug)")
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
`
  },
  {
    name: 'settings.py',
    path: 'appstore_project/settings.py',
    language: 'python',
    description: 'Django settings for Hadi88 Apps with dark chocolate theme & pagination',
    content: `"""
Django settings for Hadi88 Apps - "Find and ask for your dreaming apps"
"We are building app on your demand"
"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-hadi88-apps-secure-production-key-2026')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Hadi88 Apps Core Store application
    'store.apps.StoreConfig',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'appstore_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'django.template.context_processors.media',
            ],
        },
    },
]

WSGI_APPLICATION = 'appstore_project.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LOGIN_URL = '/admin/manage/login/'
LOGIN_REDIRECT_URL = '/admin/manage/'
LOGOUT_REDIRECT_URL = '/'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Store pagination requirement: Exactly 18 apps per page
APPS_PER_PAGE = 18
DATA_UPLOAD_MAX_MEMORY_SIZE = 150 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 150 * 1024 * 1024
`
  },
  {
    name: 'forms.py',
    path: 'store/forms.py',
    language: 'python',
    description: 'Forms for publishing apps and submitting custom on-demand app requests with warning compliance',
    content: `from django import forms
from .models import App, AppDemand

GLASS_INPUT_CLASS = (
    "w-full bg-[#18120e]/90 text-amber-50 placeholder-stone-500 text-xs sm:text-sm "
    "rounded-xl border border-amber-500/20 px-3 py-2 sm:px-4 sm:py-3 focus:outline-none "
    "focus:border-amber-500 transition-all min-h-[40px] sm:min-h-[44px]"
)

GLASS_SELECT_CLASS = (
    "w-full bg-[#18120e] text-amber-50 text-xs sm:text-sm rounded-xl border "
    "border-amber-500/20 px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:border-amber-500 "
    "transition-all cursor-pointer min-h-[40px] sm:min-h-[44px]"
)

class AppUploadForm(forms.ModelForm):
    """Admin form to publish or update an APK package"""
    class Meta:
        model = App
        fields = [
            'app_name', 'package_name', 'developer_name', 'category',
            'version', 'file_size', 'rating', 'app_icon', 'banner_image',
            'apk_file', 'description', 'is_featured', 'is_published'
        ]
        widgets = {
            'app_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g., Aether Strike'}),
            'package_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g., com.hadi88.aether'}),
            'developer_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Hadi88 Studio'}),
            'category': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'version': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': '1.0.0'}),
            'file_size': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': '45 MB'}),
            'rating': forms.NumberInput(attrs={'class': GLASS_INPUT_CLASS, 'step': '0.1', 'min': '1.0', 'max': '5.0'}),
            'description': forms.Textarea(attrs={'class': GLASS_INPUT_CLASS, 'rows': 3}),
            'is_featured': forms.CheckboxInput(attrs={'class': 'w-4 h-4 accent-amber-500 rounded'}),
            'is_published': forms.CheckboxInput(attrs={'class': 'w-4 h-4 accent-amber-500 rounded'}),
        }


class AppDemandForm(forms.ModelForm):
    """
    Client On-Demand Form:
    "Find and ask for your dreaming apps"
    "We are building app on your demand"
    With mandatory legal compliance check.
    """
    legal_policy_agreed = forms.BooleanField(
        required=True,
        label="I confirm that my requested application contains no illegal, pirated, modded, or theft material."
    )

    class Meta:
        model = AppDemand
        fields = [
            'user_name', 'email', 'contact_method', 'contact_handle',
            'app_title', 'platform', 'category', 'requirements',
            'timeline', 'budget', 'legal_policy_agreed'
        ]
        widgets = {
            'user_name': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Your Full Name'}),
            'email': forms.EmailInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'name@example.com'}),
            'contact_method': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'contact_handle': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'WhatsApp / Telegram / Phone'}),
            'app_title': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'Your Dreaming App Concept Name'}),
            'platform': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'category': forms.Select(attrs={'class': GLASS_SELECT_CLASS}),
            'requirements': forms.Textarea(attrs={
                'class': GLASS_INPUT_CLASS,
                'rows': 3,
                'placeholder': 'Explain your requirements: features, database needs, user authentication, third-party APIs...'
            }),
            'timeline': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g. 2-4 Weeks'}),
            'budget': forms.TextInput(attrs={'class': GLASS_INPUT_CLASS, 'placeholder': 'e.g. $1,000 - $3,000'}),
            'legal_policy_agreed': forms.CheckboxInput(attrs={'class': 'w-4 h-4 accent-amber-500 rounded mt-0.5'}),
        }
`
  },
  {
    name: 'views.py',
    path: 'store/views.py',
    language: 'python',
    description: 'Views for 18-item catalog pagination, live search, app details, APK download, custom /admin/manage/ portal and authentication',
    content: `from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView
from django.http import JsonResponse, FileResponse, Http404
from django.db.models import Q, F, Sum, Avg
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import user_passes_test
from .models import App, AppDemand, CATEGORY_CHOICES
from .forms import AppUploadForm, AppDemandForm
import os

def staff_required(view_func):
    """Decorator ensuring only authenticated admin/staff can access /admin/manage/"""
    decorated_view = user_passes_test(
        lambda u: u.is_authenticated and (u.is_staff or u.is_superuser),
        login_url='/admin/manage/login/'
    )(view_func)
    return decorated_view


# ==========================================
# PUBLIC USER VIEWS (localhost:8000/)
# ==========================================

class AppCatalogView(ListView):
    """
    Public User Storefront - Exactly 18 apps per page with pagination
    Strictly displays public uploaded apps and 'Ask for App' intake
    """
    model = App
    template_name = 'store/index.html'
    context_object_name = 'apps'
    paginate_by = 18

    def get_queryset(self):
        queryset = App.objects.filter(is_published=True)
        category = self.request.GET.get('category')
        query = self.request.GET.get('q')

        if category and category != 'All':
            queryset = queryset.filter(category=category)
        if query:
            queryset = queryset.filter(
                Q(app_name__icontains=query) |
                Q(developer_name__icontains=query) |
                Q(package_name__icontains=query)
            )
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['categories'] = ['All'] + [c[0] for c in CATEGORY_CHOICES]
        context['current_category'] = self.request.GET.get('category', 'All')
        context['search_query'] = self.request.GET.get('q', '')
        context['featured_apps'] = App.objects.filter(is_published=True).order_by('-is_featured', '-rating')[:4]
        context['total_apps_count'] = App.objects.filter(is_published=True).count()
        return context


def live_search_ajax(request):
    """Instant AJAX search endpoint matching user input without page reloads"""
    query = request.GET.get('term', '').strip()
    if len(query) < 1:
        return JsonResponse({'results': []})

    matches = App.objects.filter(
        Q(app_name__icontains=query) |
        Q(developer_name__icontains=query) |
        Q(category__icontains=query),
        is_published=True
    )[:8]

    return JsonResponse({'results': [
        {
            'name': a.app_name,
            'package_name': a.package_name,
            'developer': a.developer_name,
            'category': a.category,
            'icon_url': a.app_icon.url if a.app_icon else '',
            'rating': float(a.rating),
            'file_size': a.file_size,
            'detail_url': a.get_absolute_url(),
        } for a in matches
    ]})


class AppDetailView(DetailView):
    """Detailed mobile application profile"""
    model = App
    template_name = 'store/app_detail.html'
    context_object_name = 'app'
    slug_field = 'package_name'
    slug_url_kwarg = 'package_name'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['related_apps'] = App.objects.filter(
            category=self.object.category,
            is_published=True
        ).exclude(id=self.object.id).order_by('-downloads_count')[:6]
        return context


def download_apk(request, package_name):
    """Atomically increment downloads_count and stream APK binary"""
    app = get_object_or_404(App, package_name=package_name, is_published=True)
    if not app.apk_file or not os.path.exists(app.apk_file.path):
        raise Http404("APK file is unavailable on server.")

    App.objects.filter(pk=app.pk).update(downloads_count=F('downloads_count') + 1)
    return FileResponse(
        open(app.apk_file.path, 'rb'),
        as_attachment=True,
        filename=os.path.basename(app.apk_file.name),
        content_type='application/vnd.android.package-archive'
    )


def contact_admin_demand(request):
    """
    Public User Demand Form:
    "Find and ask for your dreaming apps"
    "We are building app on your demand"
    Displays strict legal notice warning against illegal or theft apps.
    """
    if request.method == 'POST':
        form = AppDemandForm(request.POST)
        if form.is_valid():
            demand = form.save()
            messages.success(
                request,
                f"Thank you, {demand.user_name}! Your custom app request for '{demand.app_title}' has been submitted to Hadi88 Apps engineering team."
            )
            return redirect('app_catalog')
    else:
        form = AppDemandForm()

    return render(request, 'store/contact_admin.html', {'form': form})


# ==========================================
# SECURED ADMIN PORTAL (/admin/manage/)
# ==========================================

def admin_login_view(request):
    """Secure Admin Login at /admin/manage/login/"""
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('admin_manage')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if user.is_staff or user.is_superuser:
                login(request, user)
                messages.success(request, f"Welcome back, Administrator {user.username}!")
                return redirect('admin_manage')
            else:
                messages.error(request, "Access restricted to staff administrators.")
        else:
            messages.error(request, "Invalid username or password.")
    else:
        form = AuthenticationForm()

    return render(request, 'store/admin_login.html', {'form': form})


def admin_logout_view(request):
    """Admin Logout handler"""
    logout(request)
    messages.info(request, "You have been signed out from the Admin Portal.")
    return redirect('app_catalog')


@staff_required
def admin_dashboard(request):
    """
    Custom Secured Route: /admin/manage/
    Full administrative control: Publish apps, edit apps, delete apps, manage client demands.
    """
    apps = App.objects.all().order_by('-created_at')
    demands = AppDemand.objects.all().order_by('-created_at')

    stats = {
        'total_apps': apps.count(),
        'total_downloads': apps.aggregate(total=Sum('downloads_count'))['total'] or 0,
        'avg_rating': round(apps.aggregate(avg=Avg('rating'))['avg'] or 0, 2),
        'pending_demands': demands.filter(status='Pending').count(),
    }

    upload_form = AppUploadForm()
    return render(request, 'store/admin_dashboard.html', {
        'apps': apps,
        'demands': demands,
        'stats': stats,
        'upload_form': upload_form,
    })


@staff_required
def admin_publish_app(request):
    """Publish a new mobile application binary and metadata"""
    if request.method == 'POST':
        form = AppUploadForm(request.POST, request.FILES)
        if form.is_valid():
            app = form.save()
            messages.success(request, f"Successfully published '{app.app_name}' (v{app.version}) to Hadi88 Store!")
            return redirect('admin_manage')
        else:
            messages.error(request, "Please correct the form errors below.")
    return redirect('admin_manage')


@staff_required
def admin_edit_app(request, pk):
    """Update existing application details or APK version"""
    app = get_object_or_404(App, pk=pk)
    if request.method == 'POST':
        form = AppUploadForm(request.POST, request.FILES, instance=app)
        if form.is_valid():
            form.save()
            messages.success(request, f"Updated '{app.app_name}' details.")
            return redirect('admin_manage')
    return redirect('admin_manage')


@staff_required
def admin_delete_app(request, pk):
    """Delete application from store"""
    app = get_object_or_404(App, pk=pk)
    app_name = app.app_name
    app.delete()
    messages.success(request, f"Application '{app_name}' removed from store.")
    return redirect('admin_manage')


@staff_required
def admin_update_demand_status(request, pk):
    """Update status of client on-demand app request"""
    demand = get_object_or_404(AppDemand, pk=pk)
    new_status = request.POST.get('status')
    if new_status in dict(DEMAND_STATUS_CHOICES):
        demand.status = new_status
        demand.save()
        messages.success(request, f"Demand '{demand.app_title}' marked as '{new_status}'.")
    return redirect('admin_manage')


@staff_required
def admin_delete_demand(request, pk):
    """Delete client app demand"""
    demand = get_object_or_404(AppDemand, pk=pk)
    demand.delete()
    messages.success(request, "Demand request deleted.")
    return redirect('admin_manage')
`
  },
  {
    name: 'urls.py',
    path: 'store/urls.py',
    language: 'python',
    description: 'Routing for public catalog (localhost:8000/) and secured custom admin route (/admin/manage/)',
    content: `from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # ----------------------------------------------------
    # 1. PUBLIC USERS ACCESS (localhost:8000/)
    # Only browsing apps, searching, and submitting demands
    # ----------------------------------------------------
    path('', views.AppCatalogView.as_view(), name='app_catalog'),
    path('api/search/', views.live_search_ajax, name='live_search_ajax'),
    path('app/<slug:package_name>/', views.AppDetailView.as_view(), name='app_detail'),
    path('app/<slug:package_name>/download/', views.download_apk, name='download_apk'),
    path('ask-for-app/', views.contact_admin_demand, name='contact_admin_demand'),

    # ----------------------------------------------------
    # 2. SECURED CUSTOM ADMIN ROUTE: /admin/manage/
    # Dedicated secure login and fully administrative portal
    # ----------------------------------------------------
    path('admin/manage/login/', views.admin_login_view, name='admin_login'),
    path('admin/manage/logout/', views.admin_logout_view, name='admin_logout'),
    path('admin/manage/', views.admin_dashboard, name='admin_manage'),
    path('admin/manage/publish/', views.admin_publish_app, name='admin_publish_app'),
    path('admin/manage/app/<int:pk>/edit/', views.admin_edit_app, name='admin_edit_app'),
    path('admin/manage/app/<int:pk>/delete/', views.admin_delete_app, name='admin_delete_app'),
    path('admin/manage/demand/<int:pk>/status/', views.admin_update_demand_status, name='admin_update_demand_status'),
    path('admin/manage/demand/<int:pk>/delete/', views.admin_delete_demand, name='admin_delete_demand'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
`
  },
  {
    name: 'base.html',
    path: 'templates/store/base.html',
    language: 'html',
    description: 'Base responsive template for public users (NO admin buttons visible to regular visitors)',
    content: `{% load static %}
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>{% block title %}Hadi88 Apps - Find and Ask for Your Dreaming Apps{% endblock %}</title>
  
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            amber: { 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
            choco: { 950: '#0d0a08', 900: '#140f0c', 850: '#1a130f', 800: '#231b15' }
          }
        }
      }
    }
  </script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #0d0a08; color: #f7efe6; }
    h1, h2, h3, .font-display { font-family: 'Syne', sans-serif; }
    .glass-panel { background: rgba(22, 17, 13, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(245, 158, 11, 0.15); }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-[#0d0a08] text-[#f7efe6] pb-20 sm:pb-0">

  <!-- Top Header Navigation (Users ONLY: No Admin Button!) -->
  <header class="sticky top-0 z-40 bg-[#120e0b]/95 backdrop-blur-md border-b border-amber-500/15">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2.5">
      
      <!-- Brand Logo & Tagline -->
      <a href="{% url 'app_catalog' %}" class="flex items-center gap-2 shrink-0">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-display font-black text-base sm:text-xl shadow-md shadow-amber-500/20">
          H
        </div>
        <div class="flex flex-col">
          <span class="font-display font-extrabold text-base sm:text-2xl text-white leading-none">
            Hadi88<span class="text-amber-400 ml-0.5">Apps</span>
          </span>
          <span class="hidden sm:block text-[10px] text-amber-300/80 font-medium">Find and ask for your dreaming apps</span>
        </div>
      </a>

      <!-- Live Search Bar -->
      <div class="relative flex-1 max-w-xs sm:max-w-md mx-2">
        <input 
          type="text" 
          id="live-search-input"
          placeholder="Search apps..." 
          class="w-full bg-[#18120e]/95 text-xs text-amber-100 placeholder-stone-500 rounded-full pl-8 pr-3 py-1.5 sm:py-2 border border-amber-500/20 focus:outline-none focus:border-amber-400"
        />
        <div id="live-search-results" class="hidden absolute top-full mt-1.5 w-full glass-panel rounded-xl p-1.5 shadow-2xl z-50 max-h-72 overflow-y-auto"></div>
      </div>

      <!-- User Action (Ask for App) -->
      <nav class="flex items-center gap-2">
        <a href="{% url 'contact_admin_demand' %}" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-all flex items-center gap-1">
          <span>Ask for App</span>
        </a>
      </nav>

    </div>
  </header>

  <!-- Taglines Strip -->
  <div class="bg-[#160f0b]/90 border-b border-amber-500/10 py-1 px-3 text-center text-[9px] sm:text-xs text-stone-300">
    <span class="text-amber-300 font-bold">"Find and ask for your dreaming apps"</span>
    <span class="text-stone-500 mx-1">·</span>
    <span>"We are building app on your demand"</span>
  </div>

  <!-- Flash Messages -->
  {% if messages %}
  <div class="max-w-7xl mx-auto px-3 mt-3 w-full">
    {% for message in messages %}
    <div class="p-2.5 rounded-xl border bg-emerald-950/40 border-emerald-500/30 text-emerald-300 text-xs">
      {{ message }}
    </div>
    {% endfor %}
  </div>
  {% endif %}

  <!-- Main Viewport -->
  <main class="flex-1">
    {% block content %}{% endblock %}
  </main>

  <!-- Mobile Sticky Bottom Navigation Dock (Users Only: Store & Ask App) -->
  <nav class="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#120e0b]/95 backdrop-blur-xl border-t border-amber-500/20 px-3 py-1.5 flex items-center justify-around">
    <a href="{% url 'app_catalog' %}" class="flex flex-col items-center text-amber-400 text-[10px] font-bold">
      <span class="text-sm">🏪</span>
      <span>Store</span>
    </a>
    <a href="{% url 'contact_admin_demand' %}" class="flex flex-col items-center text-amber-300 text-[10px] font-bold">
      <span class="text-sm">💡</span>
      <span>Ask App</span>
    </a>
  </nav>

  <!-- Footer (No Admin Button) -->
  <footer class="mt-12 sm:mt-20 border-t border-amber-500/15 bg-[#0a0705] py-8">
    <div class="max-w-7xl mx-auto px-4 text-center text-xs text-stone-400 space-y-1.5">
      <div class="font-display font-bold text-white text-sm sm:text-base">Hadi88 Apps</div>
      <p class="text-[10px] sm:text-xs">"Find and ask for your dreaming apps" · "We are building app on your demand"</p>
      <p class="text-[9px] sm:text-[11px] text-stone-500">Strict safety: We never develop any illegal, theft, or piracy category software.</p>
    </div>
  </footer>

  <!-- AJAX Live Search Script -->
  <script>
    const searchInput = document.getElementById('live-search-input');
    const searchResults = document.getElementById('live-search-results');

    if (searchInput && searchResults) {
      let debounceTimer;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        if (query.length < 1) {
          searchResults.classList.add('hidden');
          return;
        }
        debounceTimer = setTimeout(() => {
          fetch('/api/search/?term=' + encodeURIComponent(query))
            .then(res => res.json())
            .then(data => {
              if (data.results && data.results.length > 0) {
                searchResults.innerHTML = data.results.map(app => \`
                  <a href="\${app.detail_url}" class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-500/10 block">
                    <img src="\${app.icon_url}" class="w-7 h-7 rounded-lg object-cover bg-stone-900" />
                    <div class="min-w-0 flex-1">
                      <div class="text-xs font-bold text-white truncate">\${app.name}</div>
                      <div class="text-[10px] text-stone-400 truncate">\${app.category} · \${app.file_size}</div>
                    </div>
                    <div class="text-amber-400 text-xs font-bold">★ \${app.rating}</div>
                  </a>
                \`).join('');
                searchResults.classList.remove('hidden');
              } else {
                searchResults.innerHTML = '<div class="p-2 text-xs text-stone-400 text-center">No apps found.</div>';
                searchResults.classList.remove('hidden');
              }
            });
        }, 250);
      });

      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
          searchResults.classList.add('hidden');
        }
      });
    }
  </script>
</body>
</html>
`
  },
  {
    name: 'admin_login.html',
    path: 'templates/store/admin_login.html',
    language: 'html',
    description: 'Secured Admin Authentication template at custom route /admin/manage/login/',
    content: `{% extends 'store/base.html' %}

{% block title %}Admin Sign In - Hadi88 Apps Portal{% endblock %}

{% block content %}
<div class="min-h-[70vh] flex items-center justify-center px-4 py-8">
  <div class="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-amber-500/25 shadow-2xl space-y-6">
    
    <div class="text-center space-y-2">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black mx-auto shadow-lg shadow-amber-500/20 text-xl font-bold">
        🔒
      </div>
      <h1 class="text-2xl font-display font-extrabold text-white">Admin Management Sign In</h1>
      <p class="text-xs text-stone-400">Custom Secured Route: <code class="text-amber-400">/admin/manage/</code></p>
    </div>

    <form method="POST" class="space-y-4">
      {% csrf_token %}
      
      <div>
        <label class="block text-xs font-semibold text-stone-300 mb-1">Admin Username</label>
        <input 
          type="text" 
          name="username" 
          required 
          class="w-full bg-[#18120e] text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-amber-500/20 focus:border-amber-400 focus:outline-none"
          placeholder="admin"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-stone-300 mb-1">Admin Password</label>
        <input 
          type="password" 
          name="password" 
          required 
          class="w-full bg-[#18120e] text-white text-xs sm:text-sm rounded-xl px-3 py-2.5 border border-amber-500/20 focus:border-amber-400 focus:outline-none"
          placeholder="••••••••"
        />
      </div>

      <button 
        type="submit" 
        class="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-sm shadow-xl shadow-amber-500/20"
      >
        Sign In to Management
      </button>
    </form>

    <div class="text-center pt-2 border-t border-amber-500/10">
      <a href="{% url 'app_catalog' %}" class="text-xs text-stone-400 hover:text-amber-400">
        ← Return to Public Store
      </a>
    </div>

  </div>
</div>
{% endblock %}
`
  },
  {
    name: 'admin_dashboard.html',
    path: 'templates/store/admin_dashboard.html',
    language: 'html',
    description: 'Secured administrative dashboard at /admin/manage/ with app CRUD, status editing, and demand deletion',
    content: `{% extends 'store/base.html' %}

{% block title %}Admin Dashboard - Hadi88 Apps Portal (/admin/manage/){% endblock %}

{% block content %}
<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6">

  <!-- Header & Logout -->
  <div class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div>
      <div class="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Hadi88 Custom Admin Portal</div>
      <h1 class="text-lg sm:text-2xl font-display font-extrabold text-white">Management Dashboard (/admin/manage/)</h1>
      <p class="text-xs text-stone-400">Welcome, {{ request.user.username }}. Full control over apps and client demands.</p>
    </div>

    <div class="flex items-center gap-2">
      <a href="{% url 'admin_logout' %}" class="px-3 py-1.5 rounded-xl bg-red-950/40 text-red-300 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold">
        Sign Out
      </a>
    </div>
  </div>

  <!-- KPI Stats Grid -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
    <div class="glass-panel rounded-xl p-3 border border-amber-500/15">
      <span class="text-[9px] text-stone-400 uppercase">Total Downloads</span>
      <div class="text-lg sm:text-2xl font-bold text-amber-400 font-mono">{{ stats.total_downloads }}</div>
    </div>
    <div class="glass-panel rounded-xl p-3 border border-amber-500/15">
      <span class="text-[9px] text-stone-400 uppercase">Live Apps</span>
      <div class="text-lg sm:text-2xl font-bold text-white font-mono">{{ stats.total_apps }}</div>
    </div>
    <div class="glass-panel rounded-xl p-3 border border-amber-500/15">
      <span class="text-[9px] text-stone-400 uppercase">Client Demands</span>
      <div class="text-lg sm:text-2xl font-bold text-amber-400 font-mono">{{ stats.pending_demands }} pending</div>
    </div>
    <div class="glass-panel rounded-xl p-3 border border-amber-500/15">
      <span class="text-[9px] text-stone-400 uppercase">Average Rating</span>
      <div class="text-lg sm:text-2xl font-bold text-white font-mono">★ {{ stats.avg_rating }}</div>
    </div>
  </div>

  <!-- Publish New App Form Block -->
  <div class="glass-panel rounded-2xl p-4 sm:p-6 border border-amber-500/20 space-y-3">
    <h2 class="text-sm sm:text-base font-bold text-white">Publish New Application</h2>
    <form method="POST" action="{% url 'admin_publish_app' %}" enctype="multipart/form-data" class="space-y-3">
      {% csrf_token %}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label class="block text-stone-300 mb-1">App Name</label>
          {{ upload_form.app_name }}
        </div>
        <div>
          <label class="block text-stone-300 mb-1">Package Name (Slug)</label>
          {{ upload_form.package_name }}
        </div>
        <div>
          <label class="block text-stone-300 mb-1">Category</label>
          {{ upload_form.category }}
        </div>
        <div>
          <label class="block text-stone-300 mb-1">Version</label>
          {{ upload_form.version }}
        </div>
        <div>
          <label class="block text-stone-300 mb-1">File Size</label>
          {{ upload_form.file_size }}
        </div>
        <div>
          <label class="block text-stone-300 mb-1">APK Binary</label>
          {{ upload_form.apk_file }}
        </div>
      </div>
      <div>
        <label class="block text-xs text-stone-300 mb-1">Description</label>
        {{ upload_form.description }}
      </div>
      <button type="submit" class="px-5 py-2 rounded-xl bg-amber-500 text-black font-extrabold text-xs">
        Publish App to Store
      </button>
    </form>
  </div>

  <!-- Client Demands Review & Management -->
  <div class="glass-panel rounded-2xl p-4 sm:p-6 border border-amber-500/20 space-y-3">
    <h2 class="text-sm sm:text-base font-bold text-white">Client App Requests & Demands</h2>
    <div class="space-y-2">
      {% for demand in demands %}
      <div class="glass-panel rounded-xl p-3 border border-amber-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="space-y-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-white text-xs">{{ demand.app_title }}</span>
            <span class="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">{{ demand.platform }}</span>
            <span class="text-[9px] text-stone-400">{{ demand.category }}</span>
          </div>
          <div class="text-[10px] text-stone-300">
            <strong>{{ demand.user_name }}</strong> · {{ demand.email }} · {{ demand.contact_method }}: {{ demand.contact_handle }}
          </div>
          <p class="text-[11px] text-stone-300 leading-relaxed">{{ demand.requirements }}</p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <form method="POST" action="{% url 'admin_update_demand_status' demand.pk %}">
            {% csrf_token %}
            <select name="status" onchange="this.form.submit()" class="bg-[#18120e] text-[10px] text-amber-300 rounded-lg px-2 py-1 border border-amber-500/30">
              <option value="Pending" {% if demand.status == 'Pending' %}selected{% endif %}>Pending</option>
              <option value="In Review" {% if demand.status == 'In Review' %}selected{% endif %}>In Review</option>
              <option value="Approved" {% if demand.status == 'Approved' %}selected{% endif %}>Approved</option>
              <option value="In Development" {% if demand.status == 'In Development' %}selected{% endif %}>In Dev</option>
              <option value="Rejected" {% if demand.status == 'Rejected' %}selected{% endif %}>Rejected</option>
            </select>
          </form>

          <form method="POST" action="{% url 'admin_delete_demand' demand.pk %}">
            {% csrf_token %}
            <button type="submit" class="px-2 py-1 rounded bg-red-950/40 text-red-400 text-xs hover:bg-red-900/60">
              Delete
            </button>
          </form>
        </div>
      </div>
      {% empty %}
      <div class="text-xs text-stone-400 py-4 text-center">No inbound client app requests.</div>
      {% endfor %}
    </div>
  </div>

  <!-- Applications Inventory -->
  <div class="space-y-2">
    <h2 class="text-xs sm:text-sm font-bold text-white">Published Apps Inventory</h2>
    <div class="glass-panel rounded-2xl overflow-hidden border border-amber-500/20">
      <table class="w-full text-left text-xs">
        <thead class="bg-[#18120e] text-stone-400 border-b border-amber-500/15">
          <tr>
            <th class="p-3">Application</th>
            <th class="p-3">Category</th>
            <th class="p-3">Version</th>
            <th class="p-3">Downloads</th>
            <th class="p-3">Rating</th>
            <th class="p-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-amber-500/10">
          {% for app in apps %}
          <tr class="hover:bg-amber-500/5">
            <td class="p-3 font-bold text-white">{{ app.app_name }}</td>
            <td class="p-3 text-stone-300">{{ app.category }}</td>
            <td class="p-3 font-mono text-stone-300">v{{ app.version }}</td>
            <td class="p-3 font-mono text-amber-400">{{ app.downloads_count }}</td>
            <td class="p-3 font-bold text-amber-400">★ {{ app.rating }}</td>
            <td class="p-3 text-right">
              <form method="POST" action="{% url 'admin_delete_app' app.pk %}" class="inline">
                {% csrf_token %}
                <button type="submit" class="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </form>
            </td>
          </tr>
          {% endfor %}
        </tbody>
      </table>
    </div>
  </div>

</div>
{% endblock %}
`
  },
  {
    name: 'index.html',
    path: 'templates/store/index.html',
    language: 'html',
    description: 'Homepage template featuring exact 18-app pagination, category tabs, and hero spotlight with Hadi88 Apps taglines',
    content: `{% extends 'store/base.html' %}

{% block content %}
<div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-10">

  <!-- Hero Spotlight -->
  {% if featured_apps %}
  <section class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-amber-500/20 relative overflow-hidden">
    {% with hero=featured_apps.0 %}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-8 items-center">
      <div class="lg:col-span-7 space-y-2 sm:space-y-4">
        <div class="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wide">
          Hadi88 Spotlight · "Find and ask for your dreaming apps"
        </div>
        <h1 class="text-xl sm:text-4xl font-display font-extrabold text-white leading-tight">
          {{ hero.app_name }}
        </h1>
        <p class="text-[11px] sm:text-sm text-stone-300 line-clamp-2 sm:line-clamp-3 leading-relaxed">
          {{ hero.description }}
        </p>
        <div class="flex items-center gap-2 pt-1">
          <a href="{{ hero.get_absolute_url }}" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md">
            View & Install
          </a>
          <a href="{% url 'contact_admin_demand' %}" class="px-3.5 py-2 rounded-xl glass-panel text-amber-300 text-xs font-semibold">
            Ask for App
          </a>
        </div>
      </div>
      <div class="lg:col-span-5">
        {% if hero.banner_image %}
        <img src="{{ hero.banner_image.url }}" alt="{{ hero.app_name }}" class="w-full h-36 sm:h-64 object-cover rounded-xl border border-amber-500/20">
        {% endif %}
      </div>
    </div>
    {% endwith %}
  </section>
  {% endif %}

  <!-- Categories Filter -->
  <section class="space-y-2 sm:space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-xs sm:text-base font-display font-bold text-white">Categories</h2>
      <span class="text-[10px] sm:text-xs text-stone-400">{{ total_apps_count }} apps available</span>
    </div>
    <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none">
      {% for cat in categories %}
      <a href="?category={{ cat }}" class="whitespace-nowrap px-2.5 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-semibold {% if current_category == cat %}bg-amber-500 text-black font-bold{% else %}glass-panel text-stone-300 hover:text-white{% endif %}">
        {{ cat }}
      </a>
      {% endfor %}
    </div>
  </section>

  <!-- 18 Apps Per Page Grid (Responsive 2-col on mobile with small fonts & small icons) -->
  <section class="space-y-4">
    <div class="flex items-center justify-between border-b border-amber-500/10 pb-2">
      <div class="flex items-center gap-1.5">
        <h2 class="text-sm sm:text-xl font-display font-bold text-white">
          {% if current_category != 'All' %}{{ current_category }} Apps{% else %}All Applications{% endif %}
        </h2>
        <span class="text-[9px] sm:text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">18 / page</span>
      </div>
      <div class="text-[10px] sm:text-xs text-stone-400">
        Showing {{ apps|length }} of {{ total_apps_count }}
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3.5">
      {% for app in apps %}
      <div class="glass-panel rounded-xl sm:rounded-2xl p-2 sm:p-3.5 flex flex-col justify-between hover:border-amber-400/40 transition-all">
        <div>
          <a href="{{ app.get_absolute_url }}">
            <img src="{{ app.app_icon.url }}" alt="{{ app.app_name }}" class="w-full aspect-square rounded-lg sm:rounded-xl object-cover mb-2 bg-stone-900 border border-amber-500/15">
          </a>
          <a href="{{ app.get_absolute_url }}" class="font-bold text-[11px] sm:text-xs text-white truncate block hover:text-amber-400">{{ app.app_name }}</a>
          <p class="text-[9px] sm:text-[11px] text-stone-400 truncate mt-0.5">{{ app.developer_name }}</p>
          <div class="flex items-center justify-between text-[8px] sm:text-[10px] text-stone-400 mt-1">
            <span class="text-amber-400 font-bold">★ {{ app.rating }}</span>
            <span class="font-mono">{{ app.file_size }}</span>
          </div>
        </div>
        <div class="pt-2 mt-2 border-t border-amber-500/10">
          <a href="{% url 'download_apk' app.package_name %}" class="w-full py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black text-[10px] sm:text-xs font-bold text-center block transition-all min-h-[32px] flex items-center justify-center">
            Install (APK)
          </a>
        </div>
      </div>
      {% endfor %}
    </div>

    <!-- Exact 18 Items Pagination Controls -->
    {% if is_paginated %}
    <div class="flex items-center justify-between glass-panel p-2.5 sm:p-4 rounded-xl text-xs">
      <div>
        {% if page_obj.has_previous %}
        <a href="?page={{ page_obj.previous_page_number }}{% if current_category != 'All' %}&category={{ current_category }}{% endif %}" class="px-3 py-1.5 glass-panel rounded-lg text-stone-300 text-xs">Previous</a>
        {% endif %}
      </div>
      <span class="text-[10px] sm:text-xs text-stone-400">Page {{ page_obj.number }} of {{ paginator.num_pages }}</span>
      <div>
        {% if page_obj.has_next %}
        <a href="?page={{ page_obj.next_page_number }}{% if current_category != 'All' %}&category={{ current_category }}{% endif %}" class="px-3 py-1.5 glass-panel rounded-lg text-stone-300 text-xs">Next</a>
        {% endif %}
      </div>
    </div>
    {% endif %}
  </section>

</div>
{% endblock %}
`
  },
  {
    name: 'app_detail.html',
    path: 'templates/store/app_detail.html',
    language: 'html',
    description: 'Detailed mobile app view with responsive layout, 4-col mini specs, verified APK download, and related apps',
    content: `{% extends 'store/base.html' %}

{% block title %}{{ app.app_name }} (v{{ app.version }}) - Hadi88 Apps{% endblock %}

{% block content %}
<div class="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">

  <!-- Breadcrumbs & Back -->
  <div class="flex items-center justify-between text-xs">
    <a href="{% url 'app_catalog' %}" class="glass-panel px-3 py-1.5 rounded-lg text-stone-300 hover:text-amber-400 inline-flex items-center gap-1">
      ← Back to Store
    </a>
    <span class="text-[11px] text-stone-400">Hadi88 Verified Package</span>
  </div>

  <!-- Header Identity -->
  <div class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
    <div class="flex items-center gap-3">
      <img src="{{ app.app_icon.url }}" alt="{{ app.app_name }}" class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover bg-stone-900 border border-amber-500/30 shadow-md shrink-0">
      <div>
        <h1 class="text-base sm:text-2xl font-display font-extrabold text-white">{{ app.app_name }}</h1>
        <div class="text-xs text-amber-400 font-semibold">{{ app.developer_name }}</div>
        <div class="text-[10px] text-stone-400 mt-0.5">{{ app.category }} · v{{ app.version }} · {{ app.file_size }}</div>
      </div>
    </div>

    <a href="{% url 'download_apk' app.package_name %}" class="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm text-center shadow-md">
      Download APK ({{ app.file_size }})
    </a>
  </div>

  <!-- Quick Specs Grid (Compact 4-column) -->
  <div class="grid grid-cols-4 gap-1.5 sm:gap-2 text-center">
    <div class="p-2 rounded-xl bg-[#1b140f] border border-amber-500/10">
      <div class="text-[9px] text-stone-400">Rating</div>
      <div class="text-xs sm:text-sm font-bold text-amber-400">★ {{ app.rating }}</div>
    </div>
    <div class="p-2 rounded-xl bg-[#1b140f] border border-amber-500/10">
      <div class="text-[9px] text-stone-400">Downloads</div>
      <div class="text-xs sm:text-sm font-bold text-white font-mono">{{ app.downloads_count }}</div>
    </div>
    <div class="p-2 rounded-xl bg-[#1b140f] border border-amber-500/10">
      <div class="text-[9px] text-stone-400">Size</div>
      <div class="text-xs sm:text-sm font-bold text-white font-mono">{{ app.file_size }}</div>
    </div>
    <div class="p-2 rounded-xl bg-[#1b140f] border border-amber-500/10">
      <div class="text-[9px] text-stone-400">Platform</div>
      <div class="text-xs sm:text-sm font-bold text-stone-300 font-mono">Android</div>
    </div>
  </div>

  <!-- Screenshots -->
  {% if app.banner_image %}
  <div class="rounded-xl overflow-hidden border border-amber-500/20 bg-stone-950">
    <img src="{{ app.banner_image.url }}" alt="{{ app.app_name }} banner" class="w-full h-40 sm:h-64 object-cover">
  </div>
  {% endif %}

  <!-- Description -->
  <div class="glass-panel rounded-2xl p-4 sm:p-6 space-y-2 border border-amber-500/15">
    <h2 class="text-xs sm:text-sm font-display font-bold text-white">About this app</h2>
    <p class="text-xs text-stone-300 leading-relaxed whitespace-pre-line">{{ app.description }}</p>
  </div>

</div>
{% endblock %}
`
  },
  {
    name: 'contact_admin.html',
    path: 'templates/store/contact_admin.html',
    language: 'html',
    description: 'Demand an app form page with strict legal policy warning and user requirement submission',
    content: `{% extends 'store/base.html' %}

{% block title %}Ask for Your Dreaming App - Hadi88 Apps{% endblock %}

{% block content %}
<div class="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4">

  <!-- Header -->
  <div class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-1 text-center border border-amber-500/20">
    <div class="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider">Hadi88 Apps On-Demand Engineering</div>
    <h1 class="text-lg sm:text-2xl font-display font-extrabold text-white">Find and Ask for Your Dreaming Apps</h1>
    <p class="text-xs text-amber-200/80 font-medium">"We are building app on your demand"</p>
  </div>

  <!-- STRICT POLICY WARNING BOX (Mandatory User Requirement) -->
  <div class="rounded-xl bg-red-950/30 border border-red-500/40 p-3 space-y-1 text-xs">
    <div class="font-bold text-red-300 uppercase tracking-wide text-[10px] sm:text-xs flex items-center gap-1.5">
      <span>⚠️ Strict Policy & Safety Warning</span>
    </div>
    <p class="text-red-200/90 leading-relaxed font-medium text-[10px] sm:text-xs">
      <strong>We do not build any illegal, pirated, modded, gambling, adult, hacking, or theft category applications.</strong>
      In such cases, we will <strong>never reply to spam emails, fraudulent messages, or illicit solicitations</strong>. Our discussion and decision is final.
    </p>
  </div>

  <!-- Demand Submission Form -->
  <div class="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-amber-500/20">
    <form method="POST" class="space-y-3">
      {% csrf_token %}
      
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Your Full Name *</label>
          {{ form.user_name }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Email Address *</label>
          {{ form.email }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Contact Channel</label>
          {{ form.contact_method }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">WhatsApp / Phone / Telegram</label>
          {{ form.contact_handle }}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-500/10">
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Dreaming App Name *</label>
          {{ form.app_title }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Platform</label>
          {{ form.platform }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Category</label>
          {{ form.category }}
        </div>
      </div>

      <div>
        <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Detailed Requirements & Features *</label>
        {{ form.requirements }}
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Timeline</label>
          {{ form.timeline }}
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-stone-300 mb-0.5">Budget</label>
          {{ form.budget }}
        </div>
      </div>

      <div class="p-2.5 rounded-xl bg-[#1b140f] border border-amber-500/20 flex items-start gap-2">
        {{ form.legal_policy_agreed }}
        <label class="text-[10px] sm:text-xs text-stone-300 leading-tight cursor-pointer">
          I confirm that my proposed app contains no illegal, pirated, or theft material, and I accept Hadi88 Apps safety standards.
        </label>
      </div>

      <div class="pt-2 flex justify-end">
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs shadow-md">
          Submit App Demand to Admin
        </button>
      </div>
    </form>
  </div>

</div>
{% endblock %}
`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    language: 'txt',
    description: 'Python packages required for Hadi88 Apps Django deployment',
    content: `Django>=5.0.0,<5.2.0
Pillow>=10.2.0
django-cleanup>=8.0.0
gunicorn>=21.2.0
whitenoise>=6.6.0
`
  },
  {
    name: 'appstore_server.yml',
    path: '.github/workflows/appstore_server.yml',
    language: 'txt',
    description: 'Complete GitHub Actions workflow with 5-minute periodic auto-backup and safe Google Drive push/restore',
    content: `name: Run AppStore Test Servers & Cloudflare Tunnel

on:
  workflow_dispatch:

# When a new workflow is triggered, cancel any previously running instance safely
concurrency:
  group: appstore-server-group
  cancel-in-progress: true

jobs:
  run-appstore:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      # ----------------------------------------------------
      # 1. INSTALL & SETUP RCLONE (Google Drive CLI)
      # ----------------------------------------------------
      - name: Install Rclone
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y -qq rclone
          rclone version

      - name: Setup Rclone Config
        env:
          RCLONE_CONFIG_BODY: \${{ secrets.RCLONE_CONFIG_DATA }}
        run: |
          if [ -z "$RCLONE_CONFIG_BODY" ]; then
            echo "ERROR: RCLONE_CONFIG_DATA secret is empty! Cannot sync with Google Drive."
            exit 1
          fi
          mkdir -p ~/.config/rclone
          echo "$RCLONE_CONFIG_BODY" > ~/.config/rclone/rclone.conf
          chmod 600 ~/.config/rclone/rclone.conf
          echo "Rclone config installed successfully."

      # ----------------------------------------------------
      # 2. RESTORE DB, MEDIA & APKS FROM GOOGLE DRIVE (BEFORE STARTUP)
      # ----------------------------------------------------
      - name: Restore DB, Media & APKs from Google Drive
        run: |
          echo "=== Downloading DB & APKs from Drive ==="
          mkdir -p media apks

          # Check if remote backup exists on Drive
          if rclone lsf gdrive:AppStoreBackup/db.sqlite3 > /dev/null 2>&1; then
            echo ">>> Remote db.sqlite3 found! Restoring exact state..."
            rclone copyto gdrive:AppStoreBackup/db.sqlite3 ./db.sqlite3 --verbose
            rclone copy gdrive:AppStoreBackup/ ./ --include "db.sqlite3-*" --verbose || true
            echo "Database successfully restored."
          else
            echo ">>> No remote db.sqlite3 found. Fresh database will be created."
          fi

          rclone copy gdrive:AppStoreBackup/media ./media/ --update --verbose || true
          rclone copy gdrive:AppStoreBackup/apks ./apks/ --update --verbose || true
          echo "Restore step completed."

      # ----------------------------------------------------
      # 3. INSTALL CLOUDFLARED
      # ----------------------------------------------------
      - name: Install Cloudflared
        run: |
          curl -sL --retry 3 --output /tmp/cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
          sudo dpkg -i /tmp/cloudflared.deb || sudo apt-get install -f -y

      # ----------------------------------------------------
      # 4. INSTALL DEPENDENCIES
      # ----------------------------------------------------
      - name: Install Python Dependencies
        run: |
          python -m pip install --upgrade pip setuptools wheel
          pip install gunicorn whitenoise
          if [ -f requirements.txt ]; then pip install -r requirements.txt; fi

      - name: Install Frontend Dependencies
        run: |
          if [ -f package.json ]; then npm install --legacy-peer-deps; fi

      # ----------------------------------------------------
      # 5. RUN DJANGO MIGRATIONS & COLLECT STATIC
      # ----------------------------------------------------
      - name: Run Django Migrations & Collect Static
        env:
          DJANGO_SETTINGS_MODULE: appstore_project.settings
        run: |
          python manage.py makemigrations store || true
          python manage.py makemigrations || true
          python manage.py migrate --noinput
          mkdir -p static staticfiles media
          python manage.py collectstatic --noinput || true

      # ----------------------------------------------------
      # 6. CREATE OR REFRESH SUPERUSER (SAFE)
      # ----------------------------------------------------
      - name: Create or Refresh Superuser
        env:
          DJANGO_SUPERUSER_USERNAME: \${{ secrets.SUPERUSER_USERNAME }}
          DJANGO_SUPERUSER_EMAIL: \${{ secrets.SUPERUSER_EMAIL }}
          DJANGO_SUPERUSER_PASSWORD: \${{ secrets.SUPERUSER_PASSWORD }}
        run: |
          python - << 'EOF'
          import os, django
          os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'appstore_project.settings')
          django.setup()
          from django.contrib.auth import get_user_model
          User = get_user_model()
          username = os.getenv('DJANGO_SUPERUSER_USERNAME', 'admin')
          email = os.getenv('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
          password = os.getenv('DJANGO_SUPERUSER_PASSWORD', 'admin1234')

          if not User.objects.filter(username=username).exists():
              User.objects.create_superuser(username=username, email=email, password=password)
              print(f"Superuser '{username}' created.")
          else:
              user = User.objects.get(username=username)
              user.set_password(password)
              user.is_staff = True
              user.is_superuser = True
              user.save()
              print(f"Superuser '{username}' refreshed.")
          EOF

      # ----------------------------------------------------
      # 7. START GUNICORN BACKEND (PORT 8000)
      # ----------------------------------------------------
      - name: Start Gunicorn (Backend)
        run: |
          nohup gunicorn appstore_project.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120 > gunicorn.log 2>&1 &
          sleep 3

      # ----------------------------------------------------
      # 8. START VITE FRONTEND (PORT 3000)
      # ----------------------------------------------------
      - name: Start Vite Frontend
        run: |
          nohup npm run dev -- --host 0.0.0.0 --port 3000 > vite.log 2>&1 &
          sleep 5

      # ----------------------------------------------------
      # 9. START CLOUDFLARE TUNNELS
      # ----------------------------------------------------
      - name: Start Cloudflare Tunnels
        env:
          BACKEND_TOKEN: \${{ secrets.CLOUDFLARE_BACKEND_TOKEN }}
          FRONTEND_TOKEN: \${{ secrets.CLOUDFLARE_FRONTEND_TOKEN }}
        run: |
          if [ -z "$BACKEND_TOKEN" ] || [ -z "$FRONTEND_TOKEN" ]; then
            echo "ERROR: Cloudflare tokens missing!"
            exit 1
          fi
          nohup cloudflared tunnel --no-autoupdate run --token "$BACKEND_TOKEN" > backend_cf.log 2>&1 &
          nohup cloudflared tunnel --no-autoupdate run --token "$FRONTEND_TOKEN" > frontend_cf.log 2>&1 &
          sleep 5

      # ----------------------------------------------------
      # 10. MONITOR, PERIODIC AUTO-BACKUP & KEEP ALIVE
      # ----------------------------------------------------
      - name: Monitor, Keep Alive & Periodic Drive Sync (360 Minutes)
        timeout-minutes: 360
        run: |
          echo "Server live on port 8000 and 3000!"
          
          # Auto-sync daemon every 5 minutes
          (
            while true; do
              sleep 300
              if [ -f ~/.config/rclone/rclone.conf ]; then
                python -c "import sqlite3, os; os.path.exists('db.sqlite3') and sqlite3.connect('db.sqlite3').execute('PRAGMA wal_checkpoint(PASSIVE);')" || true
                [ -f "db.sqlite3" ] && rclone copyto db.sqlite3 gdrive:AppStoreBackup/db.sqlite3 --quiet || true
                [ -d "media" ] && rclone copy media gdrive:AppStoreBackup/media/ --update --quiet || true
                [ -d "apks" ] && rclone copy apks gdrive:AppStoreBackup/apks/ --update --quiet || true
              fi
            done
          ) &
          AUTOSYNC_PID=$!

          for i in {1..360}; do
            sleep 60
            if ! pgrep -f "cloudflared" > /dev/null; then
              echo "CRITICAL: Cloudflared stopped!"
              kill $AUTOSYNC_PID 2>/dev/null || true
              exit 1
            fi
            if ! pgrep -f "gunicorn" > /dev/null; then
              echo "CRITICAL: Gunicorn stopped!"
              kill $AUTOSYNC_PID 2>/dev/null || true
              exit 1
            fi
          done
          kill $AUTOSYNC_PID 2>/dev/null || true

      # ----------------------------------------------------
      # 11. SAFE PUSH TO DRIVE ON CLOSE / CANCEL (always())
      # ----------------------------------------------------
      - name: Safe Push Data to Google Drive on Close
        if: always()
        run: |
          echo "=== Workflow Closing: Flushing and Syncing to Google Drive ==="
          pkill -f "gunicorn" 2>/dev/null || true
          pkill -f "vite" 2>/dev/null || true
          pkill -f "cloudflared" 2>/dev/null || true
          sleep 2

          # SQLite WAL TRUNCATE Checkpoint
          python - << 'EOF' || true
          import os, sqlite3
          if os.path.exists('db.sqlite3'):
              conn = sqlite3.connect('db.sqlite3')
              conn.execute('PRAGMA wal_checkpoint(TRUNCATE);')
              conn.commit()
              conn.close()
              print("WAL checkpoint TRUNCATE completed.")
          EOF

          if [ -f ~/.config/rclone/rclone.conf ]; then
            TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
            if [ -f "db.sqlite3" ]; then
              rclone copyto db.sqlite3 gdrive:AppStoreBackup/db.sqlite3 --verbose
              rclone copyto db.sqlite3 gdrive:AppStoreBackup/snapshots/db_\${TIMESTAMP}.sqlite3 --verbose || true
            fi
            if [ -d "media" ]; then
              rclone copy media gdrive:AppStoreBackup/media/ --update --verbose
            fi
            if [ -d "apks" ]; then
              rclone copy apks gdrive:AppStoreBackup/apks/ --update --verbose
            fi
            echo "=== Data Successfully Backed Up to Drive ==="
          fi
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Hadi88 Apps documentation, taglines, setup instructions, and legal safety policy',
    content: `# Hadi88 Apps - "Find and ask for your dreaming apps"

> **"We are building app on your demand"**

A modern, responsive Django web marketplace replicating the Google Play Store experience with dark chocolate brown & amber glassmorphic design.

## Architecture & Routes
- **Public User Store (\`localhost:8000/\`)**:
  - Displays all published applications (exactly 18 items per page with pagination).
  - Search bar with instant AJAX matching.
  - Detail view and verified APK downloads.
  - "Ask for Your Dreaming App" on-demand intake form.
  - **Zero admin links or buttons displayed to public visitors.**
- **Secured Admin Portal (\`localhost:8000/admin/manage/\`)**:
  - Requires administrator/staff authentication.
  - Login at \`/admin/manage/login/\`.
  - Full app CRUD: Publish new apps, edit details, unpublish, or delete apps.
  - Manage client demands: Review specifications, change statuses (Pending, In Review, Approved, In Development, Rejected), and delete requests.
- **Strict Safety Policy**:
  - *"We do not build any illegal, pirated, or theft category applications. In such cases, we will never reply to spam emails, fraudulent messages, or illicit solicitations. Our discussion and decision is final."*

## Quickstart
\`\`\`bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`
Visit \`http://127.0.0.1:8000/\` for public store and \`http://127.0.0.1:8000/admin/manage/\` for the secure management portal.
`
  }
];
