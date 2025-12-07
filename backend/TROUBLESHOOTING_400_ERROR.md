# Troubleshooting 400 Bad Request Error on Registration

## Common Causes

### 1. **CORS Configuration Issue**
Make sure your Netlify frontend URL is in `CORS_ALLOWED_ORIGINS` in Render:

**In Render Dashboard → Environment Variables:**
```
CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app
```

### 2. **Validation Errors**
The 400 error is likely due to validation failures. Common issues:
- Password doesn't meet requirements (min 8 chars, not too common, etc.)
- Email format invalid
- Username already exists
- Email already exists
- Passwords don't match

### 3. **Check Browser Console**
Open browser DevTools (F12) → Console tab to see the actual error response.

### 4. **Check Network Tab**
Open browser DevTools (F12) → Network tab:
- Find the failed request
- Click on it
- Check the "Response" tab to see the actual error message from backend

## How to Debug

### Step 1: Check the Actual Error Response
In browser console, you should see something like:
```javascript
{
  "username": ["A user with that username already exists."],
  "email": ["user with this email already exists."],
  "password": ["This password is too short. It must contain at least 8 characters."]
}
```

### Step 2: Verify Environment Variables in Render
Make sure these are set:
- `ALLOWED_HOSTS=multiworkspace-notesapp.onrender.com`
- `CORS_ALLOWED_ORIGINS=https://multiworkspace-notes.netlify.app`
- `SECRET_KEY=your-secret-key`
- `DATABASE_URL=your-database-url`

### Step 2.5: Verify Settings.py (Already Fixed via Code)
Ensure `settings.py` has:
```python
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
```
This is required because Render terminates SSL, and without this, Django treats requests as HTTP, leading to 400 errors for secure checks.

### Step 3: Test the API Directly
Use curl or Postman to test:
```bash
curl -X POST https://multiworkspace-notesapp.onrender.com/api/auth/register/ \
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

## Frontend Error Display
The updated Signup component now shows detailed error messages. Check:
1. Browser console for full error details
2. The error message displayed on the signup form
3. Network tab for the actual API response

## Quick Fixes

### If password validation fails:
- Use a stronger password (min 8 chars, mix of letters/numbers)
- Example: `TestPass123!`

### If email/username already exists:
- Try a different email/username
- Or login with existing credentials

### If CORS error:
- Add your Netlify URL to `CORS_ALLOWED_ORIGINS` in Render
- Redeploy the backend

