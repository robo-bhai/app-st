from django.apps import AppConfig
import sys

class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'
    verbose_name = 'Hadi88 Apps Marketplace'

    def ready(self):
        # Prevent running during collectstatic or basic help commands
        if any(cmd in sys.argv for cmd in ['collectstatic', 'help', '--help']):
            return

        try:
            from django.db import connection
            with connection.cursor() as cursor:
                tables = connection.introspection.table_names()
                # If store_app exists but store_appreview is missing, auto-create it
                if 'store_app' in tables and 'store_appreview' not in tables:
                    cursor.execute("""
                        CREATE TABLE IF NOT EXISTS store_appreview (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            user_name VARCHAR(100) NOT NULL,
                            user_avatar VARCHAR(200) NOT NULL DEFAULT '',
                            rating SMALLINT UNSIGNED NOT NULL DEFAULT 5,
                            comment TEXT NOT NULL,
                            device_model VARCHAR(100) NOT NULL DEFAULT 'Android Device',
                            helpful_count INTEGER UNSIGNED NOT NULL DEFAULT 0,
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            app_id BIGINT NOT NULL REFERENCES store_app (id) DEFERRABLE INITIALLY DEFERRED
                        );
                    """)
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS store_appreview_app_id_idx ON store_appreview (app_id);
                    """)
        except Exception:
            pass
