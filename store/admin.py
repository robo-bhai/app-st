from django.contrib import admin
from django.utils.html import format_html
from .models import App, AppDemand, AppReview

# Global Django Admin Header Customization
admin.site.site_header = "Hadi88 Apps Administration"
admin.site.site_title = "Hadi88 Apps Admin Portal"
admin.site.index_title = "Store, Catalog & Demand Management"

@admin.register(App)
class AppAdmin(admin.ModelAdmin):
    list_display = (
        'icon_preview',
        'app_name',
        'category',
        'developer_name',
        'version',
        'rating',
        'formatted_downloads',
        'file_size',
        'is_featured',
        'is_published',
        'created_at'
    )
    list_filter = ('category', 'is_featured', 'is_published', 'created_at')
    search_fields = ('app_name', 'package_name', 'developer_name', 'description')
    list_editable = ('is_featured', 'is_published')
    readonly_fields = ('downloads_count', 'created_at', 'updated_at', 'icon_preview')
    ordering = ('-downloads_count', '-created_at')

    def icon_preview(self, obj):
        if obj.safe_icon_url:
            return format_html(
                '<img src="{}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover;" onerror="this.src=\'https://api.dicebear.com/7.x/identicon/svg?seed=app&backgroundColor=1f140e\';" />',
                obj.safe_icon_url
            )
        return "-"
    icon_preview.short_description = "Icon"


@admin.register(AppDemand)
class AppDemandAdmin(admin.ModelAdmin):
    list_display = (
        'app_title',
        'user_name',
        'email',
        'contact_method',
        'platform',
        'category',
        'status',
        'legal_policy_agreed',
        'created_at'
    )
    list_filter = ('status', 'platform', 'category', 'legal_policy_agreed', 'created_at')
    search_fields = ('app_title', 'user_name', 'email', 'requirements')
    list_editable = ('status',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(AppReview)
class AppReviewAdmin(admin.ModelAdmin):
    list_display = ('user_name', 'app', 'rating', 'device_model', 'helpful_count', 'created_at')
    list_filter = ('rating', 'created_at', 'app')
    search_fields = ('user_name', 'comment', 'app__app_name')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
