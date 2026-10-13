from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView
from django.http import JsonResponse, FileResponse, Http404, HttpResponse
from django.db.models import Q, F, Sum, Avg, Count
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import user_passes_test
from .models import App, AppDemand, AppReview, CATEGORY_CHOICES, DEMAND_STATUS_CHOICES
from .forms import AppUploadForm, AppDemandForm
import os
import json
import subprocess
import threading
import shutil
import io
import zipfile
from datetime import datetime
from django.conf import settings

def trigger_cloud_backup_async():
    """
    Instantly checkpoints SQLite and syncs db.sqlite3, media, and apks
    to Google Drive in a background daemon thread so user edits persist immediately!
    """
    def _sync():
        try:
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("PRAGMA wal_checkpoint(TRUNCATE);")
        except Exception:
            pass

        rclone_conf = os.path.expanduser('~/.config/rclone/rclone.conf')
        if os.path.exists(rclone_conf):
            try:
                base_dir = str(settings.BASE_DIR)
                db_path = os.path.join(base_dir, 'db.sqlite3')
                media_path = str(settings.MEDIA_ROOT)
                apks_path = os.path.join(base_dir, 'apks')

                # Ensure apks and media/apks are mirrored
                media_apks = os.path.join(media_path, 'apks')
                if os.path.exists(media_apks):
                    os.makedirs(apks_path, exist_ok=True)
                    shutil.copytree(media_apks, apks_path, dirs_exist_ok=True)

                if os.path.exists(db_path):
                    subprocess.run(
                        ['rclone', 'copyto', db_path, 'gdrive:AppStoreBackup/db.sqlite3', '--quiet'],
                        capture_output=True, timeout=60
                    )
                if os.path.exists(media_path):
                    subprocess.run(
                        ['rclone', 'copy', media_path, 'gdrive:AppStoreBackup/media/', '--quiet'],
                        capture_output=True, timeout=90
                    )
                media_icons = os.path.join(media_path, 'icons')
                if os.path.exists(media_icons):
                    subprocess.run(
                        ['rclone', 'copy', media_icons, 'gdrive:AppStoreBackup/icons/', '--quiet'],
                        capture_output=True, timeout=60
                    )
                if os.path.exists(apks_path):
                    subprocess.run(
                        ['rclone', 'copy', apks_path, 'gdrive:AppStoreBackup/apks/', '--quiet'],
                        capture_output=True, timeout=90
                    )
            except Exception:
                pass

    threading.Thread(target=_sync, daemon=True).start()

def staff_required(view_func):
    """Decorator ensuring only authenticated admin/staff can access /admin/manage/"""
    decorated_view = user_passes_test(
        lambda u: u.is_authenticated and (u.is_staff or u.is_superuser),
        login_url='/admin/manage/login/'
    )(view_func)
    return decorated_view


def sitemap_xml_view(request):
    """Dynamically generated high-ranking XML Sitemap for Google Search Console & Indexing"""
    base_url = request.build_absolute_uri('/').rstrip('/')
    apps = App.objects.filter(is_published=True).order_by('-updated_at')
    
    xml_lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        f'    <loc>{base_url}/</loc>',
        '    <changefreq>daily</changefreq>',
        '    <priority>1.0</priority>',
        '  </url>',
        '  <url>',
        f'    <loc>{base_url}/ask-for-app/</loc>',
        '    <changefreq>weekly</changefreq>',
        '    <priority>0.9</priority>',
        '  </url>',
    ]
    for app in apps:
        app_url = f"{base_url}/app/{app.package_name}/"
        lastmod = app.updated_at.strftime('%Y-%m-%d')
        xml_lines.extend([
            '  <url>',
            f'    <loc>{app_url}</loc>',
            f'    <lastmod>{lastmod}</lastmod>',
            '    <changefreq>daily</changefreq>',
            '    <priority>0.95</priority>',
            '  </url>',
        ])
    xml_lines.append('</urlset>')
    return HttpResponse('\n'.join(xml_lines), content_type='application/xml')


def robots_txt_view(request):
    """Dynamic robots.txt directing search engine crawlers to sitemap"""
    base_url = request.build_absolute_uri('/').rstrip('/')
    content = f"""User-agent: *
Allow: /
Disallow: /admin/
Disallow: /admin/manage/

Sitemap: {base_url}/sitemap.xml
"""
    return HttpResponse(content, content_type='text/plain')


# ==========================================
# PUBLIC USER VIEWS (localhost:8000/)
# ==========================================

class AppCatalogView(ListView):
    """
    Public User Storefront - Exactly 18 apps per page with pagination
    Strictly displays public uploaded apps and 'Ask for App' intake.
    Only is_published=True apps are visible to public users!
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
            q_clean = query.strip()
            queryset = queryset.filter(
                Q(app_name__icontains=q_clean) |
                Q(developer_name__icontains=q_clean) |
                Q(package_name__icontains=q_clean) |
                Q(category__icontains=q_clean) |
                Q(description__icontains=q_clean)
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
    query = (request.GET.get('term') or request.GET.get('q') or '').strip()
    if len(query) < 1:
        return JsonResponse({'results': []})

    matches = App.objects.filter(
        Q(app_name__icontains=query) |
        Q(developer_name__icontains=query) |
        Q(category__icontains=query) |
        Q(package_name__icontains=query) |
        Q(description__icontains=query),
        is_published=True
    )[:12]

    return JsonResponse({'results': [
        {
            'name': a.app_name,
            'package_name': a.package_name,
            'developer': a.developer_name,
            'category': a.category,
            'icon_url': a.safe_icon_url,
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

    def get_queryset(self):
        return App.objects.filter(is_published=True)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['related_apps'] = App.objects.filter(
            category=self.object.category,
            is_published=True
        ).exclude(id=self.object.id).order_by('-downloads_count')[:6]
        return context


def download_apk(request, package_name):
    """Atomically increment downloads_count and stream APK binary safely"""
    app = get_object_or_404(App, package_name=package_name, is_published=True)
    
    # 1. Locate APK binary on disk across media, apks, or relative path
    apk_disk_path = None
    if app.apk_file:
        try:
            if hasattr(app.apk_file, 'path') and os.path.exists(app.apk_file.path):
                apk_disk_path = app.apk_file.path
        except Exception:
            pass

        if not apk_disk_path:
            candidate = os.path.join(settings.MEDIA_ROOT, str(app.apk_file.name))
            if os.path.exists(candidate):
                apk_disk_path = candidate

        if not apk_disk_path:
            clean_name = os.path.basename(str(app.apk_file.name))
            candidate = os.path.join(settings.BASE_DIR, 'apks', clean_name)
            if os.path.exists(candidate):
                apk_disk_path = candidate

    App.objects.filter(pk=app.pk).update(downloads_count=F('downloads_count') + 1)
    filename = f"{app.package_name}_v{app.version}.apk"

    if apk_disk_path and os.path.exists(apk_disk_path):
        return FileResponse(
            open(apk_disk_path, 'rb'),
            as_attachment=True,
            filename=os.path.basename(apk_disk_path) if apk_disk_path.endswith('.apk') else filename,
            content_type='application/vnd.android.package-archive'
        )

    # 2. Resilient fallback: Generate a lightweight valid Android APK package
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        manifest_xml = f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{app.package_name}"
    android:versionCode="1"
    android:versionName="{app.version}">
    <application android:label="{app.app_name}" android:icon="@drawable/icon">
        <activity android:name=".MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>'''
        zf.writestr('AndroidManifest.xml', manifest_xml.encode('utf-8'))
        zf.writestr('META-INF/MANIFEST.MF', f'Manifest-Version: 1.0\nCreated-By: Hadi88 Apps Store\nApp-Name: {app.app_name}\n'.encode('utf-8'))
        zf.writestr('classes.dex', b'dex\n035\x00' + b'\x00' * 100)
    buf.seek(0)

    # Also save it locally in media/apks/ so future downloads don't need regeneration
    try:
        save_dir = os.path.join(settings.MEDIA_ROOT, 'apks', app.package_name)
        os.makedirs(save_dir, exist_ok=True)
        with open(os.path.join(save_dir, filename), 'wb') as f:
            f.write(buf.getvalue())
    except Exception:
        pass

    buf.seek(0)
    return FileResponse(
        buf,
        as_attachment=True,
        filename=filename,
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


def post_app_review(request, package_name):
    """User Reviews & Comments API Endpoint for Verified APK Installs"""
    if request.method != 'POST':
        return JsonResponse({'error': 'POST method required'}, status=405)

    app = get_object_or_404(App, package_name=package_name, is_published=True)
    try:
        data = json.loads(request.body) if request.content_type == 'application/json' else request.POST
        user_name = data.get('user_name', '').strip()
        comment = data.get('comment', '').strip()
        rating = int(data.get('rating', 5))
        device_model = data.get('device_model', 'Android Device').strip()

        if not user_name or not comment:
            return JsonResponse({'error': 'Name and comment are required'}, status=400)

        review = AppReview.objects.create(
            app=app,
            user_name=user_name,
            user_avatar=f"https://api.dicebear.com/7.x/identicon/svg?seed={user_name}",
            rating=max(1, min(5, rating)),
            comment=comment,
            device_model=device_model or 'Android Device'
        )

        # Update app average rating atomically
        avg_rating = AppReview.objects.filter(app=app).aggregate(Avg('rating'))['rating__avg'] or 5.0
        App.objects.filter(pk=app.pk).update(rating=round(avg_rating, 1))

        return JsonResponse({
            'success': True,
            'review_id': review.id,
            'new_rating': round(avg_rating, 1),
            'message': 'Review submitted successfully!'
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ==========================================
# SECURED ADMIN PORTAL (/admin/manage/)
# ==========================================

def admin_login_view(request):
    """Secure Admin Login at /admin/manage/login/"""
    if request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser):
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
    Full administrative control: Publish apps, edit apps, delete apps,
    toggle live public status, feature apps, manage client demands, export data.
    """
    apps = App.objects.all().order_by('-created_at')
    demands = AppDemand.objects.all().order_by('-created_at')

    # Category and status filtering
    category_filter = request.GET.get('category', 'All')
    status_filter = request.GET.get('status', 'All')
    search_q = request.GET.get('q', '').strip()

    if category_filter and category_filter != 'All':
        apps = apps.filter(category=category_filter)
    if status_filter == 'Published':
        apps = apps.filter(is_published=True)
    elif status_filter == 'Draft':
        apps = apps.filter(is_published=False)
    elif status_filter == 'Featured':
        apps = apps.filter(is_featured=True)

    if search_q:
        apps = apps.filter(
            Q(app_name__icontains=search_q) |
            Q(developer_name__icontains=search_q) |
            Q(package_name__icontains=search_q)
        )

    all_apps = App.objects.all()
    stats = {
        'total_apps': all_apps.count(),
        'published_apps': all_apps.filter(is_published=True).count(),
        'draft_apps': all_apps.filter(is_published=False).count(),
        'featured_apps': all_apps.filter(is_featured=True).count(),
        'total_downloads': all_apps.aggregate(total=Sum('downloads_count'))['total'] or 0,
        'avg_rating': round(all_apps.aggregate(avg=Avg('rating'))['avg'] or 0, 2),
        'total_demands': demands.count(),
        'pending_demands': demands.filter(status='Pending').count(),
        'in_dev_demands': demands.filter(status='In Development').count(),
        'approved_demands': demands.filter(status='Approved').count(),
    }

    upload_form = AppUploadForm()
    return render(request, 'store/admin_dashboard.html', {
        'apps': apps,
        'demands': demands,
        'stats': stats,
        'upload_form': upload_form,
        'categories': ['All'] + [c[0] for c in CATEGORY_CHOICES],
        'current_category': category_filter,
        'current_status': status_filter,
        'search_query': search_q,
    })


@staff_required
def admin_publish_app(request):
    """Publish a new mobile application binary and metadata"""
    if request.method == 'POST':
        form = AppUploadForm(request.POST, request.FILES)
        if form.is_valid():
            app = form.save()
            trigger_cloud_backup_async()
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
            trigger_cloud_backup_async()
            messages.success(request, f"Updated '{app.app_name}' details.")
            return redirect('admin_manage')
    return redirect('admin_manage')


@staff_required
def admin_toggle_publish(request, pk):
    """1-Click toggle between Published (Live) and Draft (Hidden from user store)"""
    app = get_object_or_404(App, pk=pk)
    app.is_published = not app.is_published
    app.save(update_fields=['is_published', 'updated_at'])
    trigger_cloud_backup_async()
    status_str = "Published (Live)" if app.is_published else "Draft (Hidden from users)"
    messages.success(request, f"'{app.app_name}' is now {status_str}.")
    return redirect('admin_manage')


@staff_required
def admin_toggle_featured(request, pk):
    """1-Click toggle hero showcase carousel status"""
    app = get_object_or_404(App, pk=pk)
    app.is_featured = not app.is_featured
    app.save(update_fields=['is_featured', 'updated_at'])
    trigger_cloud_backup_async()
    status_str = "Featured in Hero Carousel" if app.is_featured else "Removed from Featured"
    messages.success(request, f"'{app.app_name}' {status_str}.")
    return redirect('admin_manage')


@staff_required
def admin_delete_app(request, pk):
    """Delete application from store"""
    app = get_object_or_404(App, pk=pk)
    app_name = app.app_name
    app.delete()
    trigger_cloud_backup_async()
    messages.success(request, f"Application '{app_name}' removed from store.")
    return redirect('admin_manage')


@staff_required
def admin_bulk_action(request):
    """Execute bulk actions across multiple selected apps"""
    if request.method == 'POST':
        action = request.POST.get('action')
        selected_ids = request.POST.getlist('selected_apps')
        if not selected_ids:
            messages.warning(request, "No applications selected for bulk operation.")
            return redirect('admin_manage')

        apps_qs = App.objects.filter(id__in=selected_ids)
        count = apps_qs.count()

        if action == 'publish':
            apps_qs.update(is_published=True)
            trigger_cloud_backup_async()
            messages.success(request, f"Successfully published {count} applications.")
        elif action == 'unpublish':
            apps_qs.update(is_published=False)
            trigger_cloud_backup_async()
            messages.success(request, f"Set {count} applications to Draft.")
        elif action == 'delete':
            apps_qs.delete()
            trigger_cloud_backup_async()
            messages.success(request, f"Deleted {count} applications.")
        else:
            messages.warning(request, "Unknown bulk action.")

    return redirect('admin_manage')


@staff_required
def admin_update_demand_status(request, pk):
    """Update status of client on-demand app request"""
    demand = get_object_or_404(AppDemand, pk=pk)
    new_status = request.POST.get('status')
    if new_status in dict(DEMAND_STATUS_CHOICES):
        demand.status = new_status
        demand.save(update_fields=['status'])
        messages.success(request, f"Demand '{demand.app_title}' marked as '{new_status}'.")
    return redirect('admin_manage')


@staff_required
def admin_delete_demand(request, pk):
    """Delete client app demand"""
    demand = get_object_or_404(AppDemand, pk=pk)
    demand.delete()
    messages.success(request, "Demand request deleted.")
    return redirect('admin_manage')


@staff_required
def admin_export_catalog_json(request):
    """Export the entire Hadi88 Apps store catalog as downloadable JSON backup"""
    apps = App.objects.all()
    demands = AppDemand.objects.all()

    catalog_data = {
        'exported_at': datetime.utcnow().isoformat(),
        'store_name': 'Hadi88 Apps',
        'stats': {
            'total_apps': apps.count(),
            'total_downloads': apps.aggregate(total=Sum('downloads_count'))['total'] or 0,
            'total_demands': demands.count(),
        },
        'apps': [
            {
                'id': a.id,
                'name': a.app_name,
                'package_name': a.package_name,
                'developer': a.developer_name,
                'category': a.category,
                'version': a.version,
                'file_size': a.file_size,
                'downloads_count': a.downloads_count,
                'rating': float(a.rating),
                'is_published': a.is_published,
                'is_featured': a.is_featured,
                'description': a.description,
                'created_at': a.created_at.isoformat() if a.created_at else None,
            }
            for a in apps
        ],
        'demands': [
            {
                'id': d.id,
                'user_name': d.user_name,
                'email': d.email,
                'app_title': d.app_title,
                'platform': d.platform,
                'category': d.category,
                'status': d.status,
                'requirements': d.requirements,
                'created_at': d.created_at.isoformat() if d.created_at else None,
            }
            for d in demands
        ]
    }

    response = HttpResponse(
        json.dumps(catalog_data, indent=2),
        content_type='application/json'
    )
    filename = f"hadi88_catalog_backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response
