from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # ----------------------------------------------------
    # 1. PUBLIC USERS ACCESS (localhost:8000/)
    # Strictly for browsing apps, searching, and submitting demands
    # NO admin buttons or links visible here
    # ----------------------------------------------------
    path('', views.AppCatalogView.as_view(), name='app_catalog'),
    path('sitemap.xml', views.sitemap_xml_view, name='sitemap_xml'),
    path('robots.txt', views.robots_txt_view, name='robots_txt'),
    path('api/search/', views.live_search_ajax, name='live_search_ajax'),
    path('app/<str:package_name>/', views.AppDetailView.as_view(), name='app_detail'),
    path('app/<str:package_name>/download/', views.download_apk, name='download_apk'),
    path('app/<str:package_name>/review/', views.post_app_review, name='post_app_review'),
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
    path('admin/manage/app/<int:pk>/toggle-publish/', views.admin_toggle_publish, name='admin_toggle_publish'),
    path('admin/manage/app/<int:pk>/toggle-featured/', views.admin_toggle_featured, name='admin_toggle_featured'),
    path('admin/manage/bulk/', views.admin_bulk_action, name='admin_bulk_action'),
    path('admin/manage/export-catalog/', views.admin_export_catalog_json, name='admin_export_catalog_json'),
    path('admin/manage/demand/<int:pk>/status/', views.admin_update_demand_status, name='admin_update_demand_status'),
    path('admin/manage/demand/<int:pk>/delete/', views.admin_delete_demand, name='admin_delete_demand'),
]
