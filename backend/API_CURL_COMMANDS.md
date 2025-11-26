# API cURL Commands

Complete cURL commands for testing all authentication endpoints.

## Environment Setup

Replace these variables with your actual values:
```bash
BASE_URL="http://127.0.0.1:8000"
ACCESS_TOKEN="your_access_token_here"
REFRESH_TOKEN="your_refresh_token_here"
```

---

## 1. Register a New User

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"johndoe\", \"email\": \"john@example.com\", \"password\": \"SecurePass123!\", \"password2\": \"SecurePass123!\", \"first_name\": \"John\", \"last_name\": \"Doe\"}"
```

**Expected Response:**
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

---

## 2. Login (Get JWT Tokens)

```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"john@example.com\", \"password\": \"SecurePass123!\"}"
```

**Expected Response:**
```json
{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Note:** Save the access and refresh tokens from the response!

---

## 3. Refresh Access Token

```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\": \"YOUR_REFRESH_TOKEN_HERE\"}"
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...\"}"
```

**Expected Response:**
```json
{
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 4. Get User Profile

```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Example:**
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

**Expected Response:**
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

---

## 5. Update User Profile (PATCH)

Update specific fields:

```bash
curl -X PATCH http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\": \"John\", \"last_name\": \"Smith\"}"
```

**Example:**
```bash
curl -X PATCH http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\": \"Jane\", \"last_name\": \"Doe\"}"
```

**Expected Response:**
```json
{
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "created_at": "2025-11-24T10:30:00Z"
}
```

---

## 6. Update User Profile (PUT)

Update all fields:

```bash
curl -X PUT http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"johndoe\", \"email\": \"john@example.com\", \"first_name\": \"John\", \"last_name\": \"Doe\"}"
```

---

## 7. Change Password

```bash
curl -X POST http://127.0.0.1:8000/api/auth/change-password/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"old_password\": \"SecurePass123!\", \"new_password\": \"NewSecurePass456!\"}"
```

**Expected Response (Success):**
```json
{
    "message": "Password changed successfully"
}
```

**Expected Response (Wrong Old Password):**
```json
{
    "old_password": "Wrong password."
}
```

---

## 8. Logout (Blacklist Token)

```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\": \"YOUR_REFRESH_TOKEN_HERE\"}"
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ ^
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\": \"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...\"}"
```

**Expected Response:**
```json
{
    "message": "Logout successful"
}
```

---

## Complete Workflow Example

### Step 1: Register
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"testuser\", \"email\": \"test@example.com\", \"password\": \"TestPass123!\", \"password2\": \"TestPass123!\", \"first_name\": \"Test\", \"last_name\": \"User\"}"
```

### Step 2: Login
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"test@example.com\", \"password\": \"TestPass123!\"}"
```

**Copy the access token from response**

### Step 3: Get Profile
```bash
curl -X GET http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>"
```

### Step 4: Update Profile
```bash
curl -X PATCH http://127.0.0.1:8000/api/auth/profile/ ^
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>" ^
  -H "Content-Type: application/json" ^
  -d "{\"first_name\": \"Updated\", \"last_name\": \"Name\"}"
```

### Step 5: Change Password
```bash
curl -X POST http://127.0.0.1:8000/api/auth/change-password/ ^
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>" ^
  -H "Content-Type: application/json" ^+
  -d "{\"old_password\": \"TestPass123!\", \"new_password\": \"NewPass456!\"}"
```

### Step 6: Logout
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ ^
  -H "Authorization: Bearer <PASTE_ACCESS_TOKEN_HERE>" ^
  -H "Content-Type: application/json" ^
  -d "{\"refresh\": \"<PASTE_REFRESH_TOKEN_HERE>\"}"
  
```

---

## Testing with PowerShell (Alternative)

If you prefer PowerShell's `Invoke-RestMethod`:

### Register
```powershell
$body = @{
    username = "johndoe"
    email = "john@example.com"
    password = "SecurePass123!"
    password2 = "SecurePass123!"
    first_name = "John"
    last_name = "Doe"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/register/" -Method Post -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "john@example.com"
    password = "SecurePass123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method Post -Body $body -ContentType "application/json"
$accessToken = $response.access
$refreshToken = $response.refresh
```

### Get Profile
```powershell
$headers = @{
    Authorization = "Bearer $accessToken"
}

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/profile/" -Method Get -Headers $headers
```

### Update Profile
```powershell
$headers = @{
    Authorization = "Bearer $accessToken"
}

$body = @{
    first_name = "Jane"
    last_name = "Smith"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/profile/" -Method Patch -Headers $headers -Body $body -ContentType "application/json"
```

### Change Password
```powershell
$headers = @{
    Authorization = "Bearer $accessToken"
}

$body = @{
    old_password = "SecurePass123!"
    new_password = "NewSecurePass456!"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/change-password/" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

### Logout
```powershell
$headers = @{
    Authorization = "Bearer $accessToken"
}

$body = @{
    refresh = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/logout/" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

---

## Tips

1. **Windows Command Prompt**: Use `^` for line continuation
2. **PowerShell/Bash**: Use backtick `` ` `` (PowerShell) or `\` (Bash) for line continuation
3. **Save Tokens**: After login/register, copy and save the access and refresh tokens
4. **Token Expiry**: Access tokens expire after 1 hour, use refresh endpoint to get new ones
5. **Pretty Print**: Add `-w "\n"` to cURL commands or use `| jq` for formatted JSON output

---

## Common HTTP Status Codes

- **200 OK**: Successful GET, PATCH, or general success
- **201 Created**: Successful registration
- **400 Bad Request**: Validation errors or wrong password
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Endpoint doesn't exist
- **500 Internal Server Error**: Server-side error
