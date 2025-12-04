@echo off
REM Script to run Django backend locally on Windows

echo 🚀 Starting Django Backend Locally...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file for local development...
    (
        echo DEBUG=True
        echo SECRET_KEY=django-insecure-local-dev-key-change-in-production
        echo ALLOWED_HOSTS=localhost,127.0.0.1
        echo CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
    ) > .env
    echo ✅ Created .env file with default values
)

REM Run migrations
echo 🗄️  Running database migrations...
python manage.py migrate

REM Run development server
echo.
echo 🌟 Starting Django development server...
echo 📍 API will be available at: http://127.0.0.1:8000/
echo 📍 Admin panel at: http://127.0.0.1:8000/admin/
echo.
python manage.py runserver

pause

