# Hadi88 Apps - "Find and ask for your dreaming apps"

> **"We are building app on your demand"**

A complete, production-ready, and fully responsive Django web application replicating a modern mobile app marketplace (Google Play Store style) featuring deep dark chocolate brown and amber glassmorphism design.

## Features
- **Public Storefront (`localhost:8000/`)**: Strict visitor access showing uploaded apps (18 items per page), live AJAX search, APK downloads, and "Ask for App" demand modal. Zero admin buttons visible to regular users.
- **Custom Admin Portal (`/admin/manage/`)**: Dedicated, secured management route requiring staff login. Includes full app CRUD, APK publishing, and client demands review/status/deletion.
- **Client App Demands (Contact Admin)**: Dedicated on-demand app request pipeline where users specify platform, timeline, budget, and requirements.
- **Strict Compliance Policy**: Zero tolerance for illegal, theft, pirated, or cracked software categories.
- **Live AJAX Search Bar**: Real-time searching as you type without page reloads.
- **App Detail Pages**: Complete technical specs, screenshots, ratings, and instant APK downloads.
- **Atomic Downloads**: Fast APK downloads with race-condition-free `F()` download counters.

## Quickstart Guide

```bash
# 1. Create and activate Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply database migrations
python manage.py makemigrations
python manage.py migrate

# 4. Create an administrator account
python manage.py createsuperuser

# 5. Run local development server
python manage.py runserver
```

- Public User Store: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Secured Admin Portal: [http://127.0.0.1:8000/admin/manage/](http://127.0.0.1:8000/admin/manage/)
