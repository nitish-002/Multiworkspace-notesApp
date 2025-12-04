#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --no-input || echo "Warning: collectstatic failed, continuing..."

# Only run migrations if DATABASE_URL is set (database is available)
# On Render, DATABASE_URL is automatically provided when you link a PostgreSQL database service
if [ -n "$DATABASE_URL" ]; then
  python manage.py migrate
else
  echo "Warning: DATABASE_URL not set. Skipping migrations."
  echo "To fix: Link your PostgreSQL database service to this web service in Render dashboard."
fi
