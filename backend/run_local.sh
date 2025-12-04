#!/usr/bin/env bash
# Script to run Django backend locally

echo "🚀 Starting Django Backend Locally..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file for local development..."
    cat > .env << EOF
DEBUG=True
SECRET_KEY=django-insecure-local-dev-key-change-in-production-$(date +%s)
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
EOF
    echo "✅ Created .env file with default values"
fi

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist (optional)
echo ""
read -p "Do you want to create a superuser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Run development server
echo ""
echo "🌟 Starting Django development server..."
echo "📍 API will be available at: http://127.0.0.1:8000/"
echo "📍 Admin panel at: http://127.0.0.1:8000/admin/"
echo ""
python manage.py runserver

