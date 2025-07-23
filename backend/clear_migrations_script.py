import os
import django
from django.conf import settings
from django.db import connection

# Configure Django settings if not already configured
if not settings.configured:
    settings.configure(
        # Assuming your settings are in glowapp_backend.settings
        # You might need to adjust this based on your project structure
        # For this script, we only need database settings.
        DATABASES={
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': os.environ.get('DB_NAME', 'your_db_name'), # Replace with your database name
                'USER': os.environ.get('DB_USER', 'your_db_user'), # Replace with your database user
                'PASSWORD': os.environ.get('DB_PASSWORD', 'your_db_password'), # Replace with your database password
                'HOST': os.environ.get('DB_HOST', 'localhost'), # Replace with your database host
                'PORT': os.environ.get('DB_PORT', ''),       # Replace with your database port
            }
        },
        INSTALLED_APPS=[
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'salon', # Your app name
            # Add other necessary apps if needed
        ]
    )

django.setup()

def clear_salon_migrations():
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM django_migrations WHERE app = 'salon'")
    print("Cleared salon app migration history from django_migrations table.")

if __name__ == "__main__":
    clear_salon_migrations()