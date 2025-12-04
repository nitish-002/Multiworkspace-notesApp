# Environment Variables for Django Deployment on Render

This document lists all environment variables needed for deploying your Django application to Render.

## Required Environment Variables (Production)

### 1. **SECRET_KEY** ⚠️ REQUIRED
- **Description**: Django secret key for cryptographic signing
- **How to generate**:
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- **Example**: `django-insecure-abc123xyz789...` (50+ characters)
- **Security**: **NEVER** commit this to version control. Keep it secret!

### 2. **ALLOWED_HOSTS** ⚠️ REQUIRED
- **Description**: Comma-separated list of host/domain names that this Django site can serve
- **Format**: Comma-separated values (no spaces)
- **Example**: `your-app.onrender.com,www.yourdomain.com,yourdomain.com`
- **For Render**: Use your Render service URL (e.g., `your-app.onrender.com`)

### 3. **CORS_ALLOWED_ORIGINS** ⚠️ REQUIRED
- **Description**: Comma-separated list of origins that are allowed to make cross-origin requests
- **Format**: Comma-separated URLs (no spaces)
- **Example**: `https://your-frontend.onrender.com,https://www.yourdomain.com`
- **Note**: Must include your frontend URL(s). Do NOT include trailing slashes.

## Database Configuration

### Option 1: DATABASE_URL (Recommended for Render) ✅
- **Description**: Complete PostgreSQL connection URL
- **Auto-provided**: Render automatically provides this when you link a PostgreSQL database service
- **Format**: `postgresql://user:password@host:port/dbname`
- **Action**: Link your PostgreSQL database service in Render dashboard → Connections

### Option 2: Individual Database Variables (Fallback)
If `DATABASE_URL` is not set, these will be used:

- **DB_USER**: PostgreSQL username (default: `postgres`)
- **DB_PASSWORD**: PostgreSQL password
- **DB_HOST**: Database host (default: `localhost`)
- **DB_PORT**: Database port (default: `5432`)
- **DB_NAME**: Database name (default: `ojt_db`)

## Optional Environment Variables

### 4. **DEBUG** (Optional)
- **Description**: Enable/disable debug mode
- **Default**: `False` (production-safe)
- **Production**: Should be `False` or not set
- **Development**: `True`
- **Format**: Boolean (`True`/`False` or `1`/`0`)

## Complete Environment Variables List for Render

### Minimum Required (Production)
```env
SECRET_KEY=your-generated-secret-key-here
ALLOWED_HOSTS=your-app.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
DEBUG=False
```

### With Individual Database Config (if not using DATABASE_URL)
```env
SECRET_KEY=your-generated-secret-key-here
ALLOWED_HOSTS=your-app.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
DEBUG=False
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
DB_NAME=your_db_name
```

## How to Set Environment Variables on Render

1. **Go to your Render Dashboard**
   - Navigate to your Web Service

2. **Open Environment Tab**
   - Click on "Environment" in the left sidebar

3. **Add Variables**
   - Click "Add Environment Variable"
   - Enter the key and value
   - Click "Save Changes"

4. **Link Database (Recommended)**
   - Go to your Web Service → "Connections"
   - Click "Link Database"
   - Select your PostgreSQL database
   - This automatically provides `DATABASE_URL`

## Environment Variables Priority

1. **DATABASE_URL** (if set) - Used first
2. Individual DB variables (DB_USER, DB_PASSWORD, etc.) - Used if DATABASE_URL not set
3. Default values - Used if neither is set (not recommended for production)

## Security Checklist

- [ ] `SECRET_KEY` is set and unique (not the default)
- [ ] `DEBUG=False` in production
- [ ] `ALLOWED_HOSTS` includes your production domain(s)
- [ ] `CORS_ALLOWED_ORIGINS` includes your frontend URL(s) only
- [ ] Database credentials are secure
- [ ] No sensitive data in code or version control

## Example Render Configuration

### Web Service Environment Variables:
```
SECRET_KEY=django-insecure-abc123xyz789... (your generated key)
ALLOWED_HOSTS=your-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://your-frontend.onrender.com
DEBUG=False
```

### Database Service:
- Create PostgreSQL database service
- Link it to your web service (provides DATABASE_URL automatically)

## Troubleshooting

### Issue: "SECRET_KEY not found"
- **Solution**: Add `SECRET_KEY` environment variable in Render dashboard

### Issue: "DisallowedHost" error
- **Solution**: Add your Render URL to `ALLOWED_HOSTS`

### Issue: CORS errors from frontend
- **Solution**: Add your frontend URL to `CORS_ALLOWED_ORIGINS`

### Issue: Database connection failed
- **Solution**: Link your PostgreSQL database service in Render dashboard


