import mimetypes
from django.conf import settings

# Ensure strict MIME types are correctly registered in the Python runtime
mimetypes.add_type("text/css", ".css", True)
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("image/svg+xml", ".svg", True)

class DynamicCsrfTrustedOriginsMiddleware:
    """
    Middleware that dynamically registers the incoming Host and Origin
    into settings.CSRF_TRUSTED_ORIGINS.
    This permanently prevents '403 Forbidden: CSRF verification failed'
    errors when accessing via Cloudflare tunnels, custom domains, or reverse proxies.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            # 1. Inspect request host
            host = request.get_host()
            if host:
                clean_host = host.split(':')[0]
                candidates = [
                    f"https://{host}",
                    f"http://{host}",
                    f"https://{clean_host}",
                    f"http://{clean_host}",
                ]
                for origin in candidates:
                    if origin not in settings.CSRF_TRUSTED_ORIGINS:
                        settings.CSRF_TRUSTED_ORIGINS.append(origin)

            # 2. Inspect HTTP_ORIGIN header
            origin_header = request.META.get('HTTP_ORIGIN')
            if origin_header and origin_header not in settings.CSRF_TRUSTED_ORIGINS:
                settings.CSRF_TRUSTED_ORIGINS.append(origin_header)

            # 3. Inspect HTTP_REFERER header
            referer_header = request.META.get('HTTP_REFERER')
            if referer_header:
                from urllib.parse import urlparse
                parsed = urlparse(referer_header)
                if parsed.scheme and parsed.netloc:
                    origin_from_ref = f"{parsed.scheme}://{parsed.netloc}"
                    if origin_from_ref not in settings.CSRF_TRUSTED_ORIGINS:
                        settings.CSRF_TRUSTED_ORIGINS.append(origin_from_ref)
        except Exception:
            pass

        response = self.get_response(request)
        return response
