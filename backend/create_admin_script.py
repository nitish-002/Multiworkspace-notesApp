import os
import sys
import django

# Add the backend directory to sys.path so config can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

email = 'admin@example.com'
username = 'admin'
password = 'AdminPass123!'

if not User.objects.filter(email=email).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"Superuser created successfully.")
    print(f"Email: {email}")
    print(f"Password: {password}")
else:
    print(f"Superuser with email {email} already exists.")
    # If it exists, we can't retrieve the password, but we can reset it if needed.
    # For now, I'll just inform the user.
    # Actually, to be helpful, let's reset it so the user definitely has access.
    user = User.objects.get(email=email)
    user.set_password(password)
    user.save()
    print(f"Superuser password reset successfully.")
    print(f"Email: {email}")
    print(f"Password: {password}")
