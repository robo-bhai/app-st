from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve
from django.http import HttpResponse, Http404
from django.contrib.staticfiles import finders
import os

# Ultra-safe static resolution: checks static/, staticfiles/, finders, and public/
def safe_static_serve(request, path, insecure=True):
    response = None
    # 1. First check BASE_DIR / 'static' directly with the requested subpath
    static_file = os.path.join(settings.BASE_DIR, 'static', path)
    if os.path.isfile(static_file):
        response = serve(request, path, document_root=os.path.join(settings.BASE_DIR, 'static'), insecure=True)

    # 2. Check STATIC_ROOT (staticfiles) directly with requested path
    elif settings.STATIC_ROOT and os.path.isfile(os.path.join(settings.STATIC_ROOT, path)):
        response = serve(request, path, document_root=settings.STATIC_ROOT, insecure=True)

    # 3. Direct check for admin assets inside static/admin or staticfiles/admin
    elif path.startswith('admin/'):
        admin_rel_path = path[6:]
        admin_file = os.path.join(settings.BASE_DIR, 'static', 'admin', admin_rel_path)
        if os.path.isfile(admin_file):
            response = serve(request, admin_rel_path, document_root=os.path.join(settings.BASE_DIR, 'static', 'admin'), insecure=True)
        elif settings.STATIC_ROOT and os.path.isfile(os.path.join(settings.STATIC_ROOT, 'admin', admin_rel_path)):
            response = serve(request, admin_rel_path, document_root=os.path.join(settings.STATIC_ROOT, 'admin'), insecure=True)

    # 4. Check Django's staticfiles finders (finds django.contrib.admin and installed packages)
    if not response:
        try:
            matched_file = finders.find(path)
            if matched_file and os.path.isfile(matched_file):
                if matched_file.endswith(path):
                    root_dir = matched_file[:-len(path)].rstrip(os.sep)
                    response = serve(request, path, document_root=root_dir, insecure=True)
                else:
                    response = serve(request, os.path.basename(matched_file), document_root=os.path.dirname(matched_file), insecure=True)
        except Exception:
            pass

    # 5. Check BASE_DIR / 'public'
    if not response:
        public_file = os.path.join(settings.BASE_DIR, 'public', path)
        if os.path.isfile(public_file):
            response = serve(request, path, document_root=os.path.join(settings.BASE_DIR, 'public'), insecure=True)

    # Fallback to default static directory
    if not response:
        static_dir = os.path.join(settings.BASE_DIR, 'static')
        response = serve(request, path, document_root=static_dir, insecure=True)

    # Strictly enforce correct MIME types to prevent browser style dropping
    if path.endswith('.css'):
        response['Content-Type'] = 'text/css; charset=utf-8'
    elif path.endswith('.js'):
        response['Content-Type'] = 'application/javascript; charset=utf-8'
    elif path.endswith('.svg'):
        response['Content-Type'] = 'image/svg+xml'
    elif path.endswith('.woff2'):
        response['Content-Type'] = 'font/woff2'
    elif path.endswith('.woff'):
        response['Content-Type'] = 'font/woff'

    response['Access-Control-Allow-Origin'] = '*'
    return response

# Ultra-safe media resolution: checks MEDIA_ROOT, apks, public/images, and static/images
def safe_media_serve(request, path, insecure=True):
    # 1. Standard MEDIA_ROOT
    if os.path.exists(os.path.join(settings.MEDIA_ROOT, path)):
        return serve(request, path, document_root=settings.MEDIA_ROOT)

    # 2. Check if it's an APK requested and exists in apks/
    if path.startswith('apks/'):
        filename = os.path.basename(path)
        apks_dir = os.path.join(settings.BASE_DIR, 'apks')
        if os.path.exists(os.path.join(apks_dir, filename)):
            return serve(request, filename, document_root=apks_dir)

    # 3. Check if file exists in public/images
    clean_filename = os.path.basename(path)
    pub_img = os.path.join(settings.BASE_DIR, 'public', 'images', clean_filename)
    if os.path.exists(pub_img):
        return serve(request, clean_filename, document_root=os.path.join(settings.BASE_DIR, 'public', 'images'))

    # 4. Check if file exists in static/images
    stat_img = os.path.join(settings.BASE_DIR, 'static', 'images', clean_filename)
    if os.path.exists(stat_img):
        return serve(request, clean_filename, document_root=os.path.join(settings.BASE_DIR, 'static', 'images'))

    # 5. Check if file exists in media/icons or media/banners directly
    direct_candidates = [
        os.path.join(settings.MEDIA_ROOT, 'icons', clean_filename),
        os.path.join(settings.MEDIA_ROOT, 'banners', clean_filename),
        os.path.join(settings.BASE_DIR, 'media', 'icons', clean_filename),
        os.path.join(settings.BASE_DIR, 'media', 'banners', clean_filename),
    ]
    for cand in direct_candidates:
        if os.path.exists(cand):
            return serve(request, clean_filename, document_root=os.path.dirname(cand))

    # 6. Fallback for missing icon or image: return dynamic valid SVG to prevent 404
    if any(path.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico']):
        initials = clean_filename[:2].upper() if clean_filename else 'HD'
        svg = (
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">'
            f'<rect width="128" height="128" rx="28" fill="#1f140e" />'
            f'<rect x="4" y="4" width="120" height="120" rx="24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-opacity="0.4" />'
            f'<text x="64" y="73" font-family="sans-serif" font-size="32" font-weight="900" fill="#fcd34d" text-anchor="middle" dominant-baseline="middle">{initials}</text>'
            f'</svg>'
        )
        return HttpResponse(svg, content_type='image/svg+xml')

    # Default to MEDIA_ROOT
    return serve(request, path, document_root=settings.MEDIA_ROOT)

# Priority: static & media first, then admin, then store views
urlpatterns = [
    re_path(r'^static/(?P<path>.*)$', safe_static_serve),
    re_path(r'^staticfiles/(?P<path>.*)$', safe_static_serve),
    re_path(r'^media/(?P<path>.*)$', safe_media_serve),
    re_path(r'^images/(?P<path>.*)$', serve, {'document_root': os.path.join(settings.BASE_DIR, 'public', 'images')}),
    path('admin/', admin.site.urls),
    path('', include('store.urls')),
]

