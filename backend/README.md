# Django REST Framework Authentication System

A complete JWT-based authentication system built with Django REST Framework and SQLite database.

## Project Structure

```
backend/
├── config/                 # Django project configuration
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py        # Main settings file
│   ├── urls.py            # Root URL configuration
│   └── wsgi.py
├── apps/
│   └── accounts/          # Authentication app
│       ├── __init__.py
│       ├── admin.py       # Django admin configuration
│       ├── apps.py        # App configuration
│       ├── models.py      # Custom User model
│       ├── serializers.py # DRF serializers
│       ├── views.py       # API views
│       ├── urls.py        # App URL patterns
│       ├── tests.py
│       └── migrations/
├── manage.py
├── requirements.txt
├── .env                   # Environment variables
├── .gitignore
└── db.sqlite3            # SQLite database (created after migrations)
```

## Features

- **Custom User Model**: Email-based authentication instead of username
- **JWT Authentication**: Secure token-based authentication with access and refresh tokens
- **Token Blacklisting**: Logout functionality with token invalidation
- **User Registration**: Create new accounts with password validation
- **User Profile**: Retrieve and update user information
- **Password Management**: Change password with old password verification
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **Django Admin**: Custom admin interface for user management

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
```

### 2. Activate Virtual Environment

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

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

The `.env` file is already created with default values. Update if needed:

```env
DEBUG=True
SECRET_KEY=django-insecure-replace-with-real-secret-key-in-production
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### 7. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/`

## API Endpoints

### Base URL: `/api/auth/`

| Method | Endpoint | Description | Authentication |
|--------|----------|-------------|----------------|
| POST | `/api/auth/register/` | Register a new user | No |
| POST | `/api/auth/login/` | Login and get JWT tokens | No |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| GET | `/api/auth/profile/` | Get current user profile | Yes |
| PATCH | `/api/auth/profile/` | Update user profile | Yes |
| POST | `/api/auth/change-password/` | Change user password | Yes |
| POST | `/api/auth/logout/` | Logout and blacklist token | Yes |

## API Usage Examples

### 1. Register a New User

**Request:**
```http
POST /api/auth/register/
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
}
```

**Response (201 Created):**
```json
{
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "created_at": "2025-11-24T10:30:00Z"
    },
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "message": "User registered successfully"
}
```

### 2. Login

**Request:**
```http
POST /api/auth/login/
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Refresh Access Token

**Request:**
```http
POST /api/auth/token/refresh/
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 4. Get User Profile

**Request:**
```http
GET /api/auth/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Response (200 OK):**
```json
{
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "created_at": "2025-11-24T10:30:00Z"
}
```

### 5. Update User Profile

**Request:**
```http
PATCH /api/auth/profile/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
    "first_name": "John",
    "last_name": "Smith"
}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "created_at": "2025-11-24T10:30:00Z"
}
```

### 6. Change Password

**Request:**
```http
POST /api/auth/change-password/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
    "old_password": "SecurePass123!",
    "new_password": "NewSecurePass456!"
}
```

**Response (200 OK):**
```json
{
    "message": "Password changed successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
    "old_password": "Wrong password."
}
```

### 7. Logout

**Request:**
```http
POST /api/auth/logout/
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
Content-Type: application/json

{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response (200 OK):**
```json
{
    "message": "Logout successful"
}
```

## Authentication Header Format

For protected endpoints, include the JWT access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Token Lifetimes

- **Access Token**: 1 hour
- **Refresh Token**: 7 days

## Custom User Model

The custom User model uses **email** as the primary authentication field instead of username.

**Fields:**
- `email` (unique, required)
- `username` (unique, required)
- `first_name` (optional)
- `last_name` (optional)
- `created_at` (auto-generated)
- `updated_at` (auto-updated)

## Django Admin

Access the Django admin interface at `http://127.0.0.1:8000/admin/`

The custom admin interface includes:
- User list with email, username, name, staff status, and creation date
- Filters by staff status, superuser status, active status, and creation date
- Search by email, username, first name, and last name
- Ordered by most recent users first

## Password Validation

The system enforces Django's default password validators:
- Must not be too similar to other user attributes
- Minimum length of 8 characters
- Cannot be a commonly used password
- Cannot be entirely numeric

## Error Responses

All error responses follow this format:

```json
{
    "field_name": "Error message"
}
```

Or for general errors:

```json
{
    "error": "Error message"
}
```

## Testing with cURL

### Register
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

### Get Profile
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Considerations

For production deployment:

1. **Change SECRET_KEY**: Generate a new secret key
2. **Set DEBUG=False**: Disable debug mode
3. **Update ALLOWED_HOSTS**: Add your domain
4. **Use HTTPS**: Always use HTTPS in production
5. **Configure CORS**: Restrict CORS_ALLOWED_ORIGINS to your frontend domain
6. **Database**: Consider using PostgreSQL instead of SQLite
7. **Environment Variables**: Never commit `.env` to version control

## Dependencies

- Django 5.0.2
- djangorestframework 3.14.0
- djangorestframework-simplejwt 5.3.0
- django-cors-headers 4.3.1
- python-decouple 3.8

## Troubleshooting

### Issue: "ImportError: Couldn't import Django"
**Solution:** Make sure the virtual environment is activated and dependencies are installed.

### Issue: "OperationalError: no such table"
**Solution:** Run migrations: `python manage.py migrate`

### Issue: "Token is blacklisted"
**Solution:** The refresh token has been used for logout. Login again to get a new token.

### Issue: CORS errors in browser
**Solution:** Add your frontend URL to `CORS_ALLOWED_ORIGINS` in `.env` file.

## License

This project is provided as-is for educational purposes.
