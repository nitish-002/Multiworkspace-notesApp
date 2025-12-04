# Running Backend Locally

This guide will help you set up and run the Django backend on your local machine.

## Quick Start

### Option 1: Using the Scripts (Easiest)

**Windows:**
```bash
cd backend
.\run_local.bat
```

**macOS/Linux:**
```bash
cd backend
chmod +x run_local.sh
./run_local.sh
```

### Option 2: Manual Setup

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Create Environment File

Create a `.env` file in the `backend` directory:

```env
DEBUG=True
SECRET_KEY=django-insecure-local-dev-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```

**Note:** For local development, the database will use SQLite (default). If you want to use PostgreSQL locally, add:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### 6. Run Migrations

```bash
python manage.py migrate
```

This will create the SQLite database file (`db.sqlite3`) and apply all migrations.

### 7. Create Superuser (Optional)

To access the Django admin panel:

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 8. Run Development Server

```bash
python manage.py runserver
```

The server will start at `http://127.0.0.1:8000/`

## Access Points

- **API Base URL**: `http://127.0.0.1:8000/`
- **Admin Panel**: `http://127.0.0.1:8000/admin/`
- **API Endpoints**: `http://127.0.0.1:8000/api/`

## Common Commands

### Create New Migrations

```bash
python manage.py makemigrations
```

### Apply Migrations

```bash
python manage.py migrate
```

### Create Superuser

```bash
python manage.py createsuperuser
```

### Run Tests

```bash
python manage.py test
```

### Access Django Shell

```bash
python manage.py shell
```

### Collect Static Files

```bash
python manage.py collectstatic
```

## Environment Variables for Local Development

| Variable | Description | Default (Local) |
|----------|-------------|----------------|
| `DEBUG` | Enable debug mode | `True` |
| `SECRET_KEY` | Django secret key | Auto-generated if not set |
| `ALLOWED_HOSTS` | Allowed hostnames | `localhost,127.0.0.1` |
| `CORS_ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:5173` |
| `DATABASE_URL` | Database connection string | SQLite (default) |

## Database

### SQLite (Default for Local Development)

No configuration needed. The database file `db.sqlite3` will be created automatically when you run migrations.

### PostgreSQL (Optional)

If you want to use PostgreSQL locally:

1. Install PostgreSQL
2. Create a database
3. Add to `.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

## Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'django'"

**Solution:** Make sure your virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: "Port 8000 already in use"

**Solution:** Run on a different port:
```bash
python manage.py runserver 8001
```

### Issue: "Database is locked"

**Solution:** 
- Close any database viewers or other connections
- Restart the development server

### Issue: "Migration conflicts"

**Solution:**
```bash
python manage.py makemigrations
python manage.py migrate
```

### Issue: CORS errors from frontend

**Solution:** Make sure `CORS_ALLOWED_ORIGINS` in `.env` includes your frontend URL (e.g., `http://localhost:5173`)

## Connecting Frontend to Local Backend

In your frontend `.env` file (or environment variables), set:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Or if your frontend runs on a different port:

```env
VITE_API_URL=http://localhost:8000
```

## Development Tips

1. **Hot Reload**: Django automatically reloads when you save Python files
2. **Debug Mode**: With `DEBUG=True`, you'll see detailed error pages
3. **Database**: SQLite is perfect for local development (no setup needed)
4. **Admin Panel**: Use `/admin/` to manage data during development
5. **API Testing**: Use tools like Postman, Insomnia, or curl to test endpoints

## Next Steps

- Test API endpoints using the API documentation
- Create test users and data
- Connect your frontend to the local backend
- Start developing new features!

