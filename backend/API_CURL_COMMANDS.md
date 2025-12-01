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

# Workspaces API

## 9. List Workspaces

```bash
curl -X GET http://127.0.0.1:8000/api/workspaces/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
[
    {
        "id": 1,
        "name": "My Workspace",
        "slug": "my-workspace",
        "owner": "johndoe",
        "member_count": 1,
        "my_role": "OWNER"
    }
]
```

---

## 10. Create Workspace

```bash
curl -X POST http://127.0.0.1:8000/api/workspaces/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"New Team Space\", \"description\": \"A space for the new team\"}"
```

**Expected Response:**
```json
{
    "name": "New Team Space",
    "description": "A space for the new team"
}
```

---

## 11. Get Workspace Detail

```bash
curl -X GET http://127.0.0.1:8000/api/workspaces/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Expected Response:**
```json
{
    "id": 1,
    "name": "My Workspace",
    "slug": "my-workspace",
    "description": "",
    "owner": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com",
        ...
    },
    "created_at": "...",
    "updated_at": "...",
    "members": [
        {
            "id": 1,
            "user": { ... },
            "role": "OWNER",
            "joined_at": "..."
        }
    ],
    "notebook_count": 0
}
```

---

## 12. Update Workspace

```bash
curl -X PUT http://127.0.0.1:8000/api/workspaces/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Updated Workspace Name\", \"description\": \"Updated description\"}"
```


---

## 13. Delete Workspace

```bash
curl -X DELETE http://127.0.0.1:8000/api/workspaces/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 14. List Workspace Members

```bash
curl -X GET http://127.0.0.1:8000/api/workspaces/1/members/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 15. Add Workspace Member

```bash
curl -X POST http://127.0.0.1:8000/api/workspaces/1/members/add/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"jane@example.com\", \"role\": \"EDITOR\"}"
```

**Expected Response:**
```json
{
    "detail": "Member added successfully."
}
```

---

## 16. Update Member Role

```bash
curl -X PUT http://127.0.0.1:8000/api/workspaces/1/members/2/update/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"role\": \"ADMIN\"}"
```

**Note:** Replace `2` with the actual user ID of the member.

---

## 17. Remove Member

```bash
curl -X DELETE http://127.0.0.1:8000/api/workspaces/1/members/2/remove/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

# Notebooks API

## 18. List Notebooks

```bash
curl -X GET http://127.0.0.1:8000/api/notebooks/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Filter by Workspace:**
```bash
curl -X GET "http://127.0.0.1:8000/api/notebooks/?workspace_id=1" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 19. Create Notebook

```bash
curl -X POST http://127.0.0.1:8000/api/notebooks/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Project Ideas\", \"content\": \"# My Ideas\n\n1. Idea one...\", \"workspace_id\": 1}"
```

**Expected Response:**
```json
{
    "id": 1,
    "title": "Project Ideas",
    "content": "# My Ideas\n\n1. Idea one...",
    "version": 1,
    ...
}
```

---

## 20. Get Notebook Detail

```bash
curl -X GET http://127.0.0.1:8000/api/notebooks/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 21. Update Notebook

```bash
curl -X PUT http://127.0.0.1:8000/api/notebooks/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Project Ideas (Updated)\", \"content\": \"# My Ideas\n\n1. Idea one...\n2. Idea two\", \"change_summary\": \"Added idea two\"}"
```

**Note:** This automatically creates a new version.

---

## 22. Soft Delete Notebook (Trash)

```bash
curl -X DELETE http://127.0.0.1:8000/api/notebooks/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 23. List Notebook Versions

```bash
curl -X GET http://127.0.0.1:8000/api/notebooks/1/versions/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 24. List Trash (Deleted Notebooks)

```bash
curl -X GET http://127.0.0.1:8000/api/notebooks/trash/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 25. Restore Notebook from Trash

```bash
curl -X POST http://127.0.0.1:8000/api/notebooks/1/restore/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

# Labels API

## 26. List Labels

```bash
curl -X GET http://127.0.0.1:8000/api/labels/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Filter by Workspace:**
```bash
curl -X GET "http://127.0.0.1:8000/api/labels/?workspace_id=1" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 27. Create Label

```bash
curl -X POST http://127.0.0.1:8000/api/labels/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Urgent\", \"color\": \"#EF4444\", \"workspace\": 1}"
```

**Expected Response:**
```json
{
    "id": 1,
    "name": "Urgent",
    "color": "#EF4444",
    "description": "",
    "workspace": 1,
    "notebook_count": 0,
    ...
}
```

---

## 28. Get Label Detail

```bash
curl -X GET http://127.0.0.1:8000/api/labels/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 29. Update Label

```bash
curl -X PATCH http://127.0.0.1:8000/api/labels/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"High Priority\", \"color\": \"#DC2626\"}"
```

---

## 30. Delete Label

```bash
curl -X DELETE http://127.0.0.1:8000/api/labels/1/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 31. Add Label to Notebook

```bash
curl -X POST http://127.0.0.1:8000/api/labels/notebooks/1/labels/add/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"label_id\": 1}"
```

---

## 32. List Notebook Labels

```bash
curl -X GET http://127.0.0.1:8000/api/labels/notebooks/1/labels/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 33. Remove Label from Notebook

```bash
curl -X DELETE http://127.0.0.1:8000/api/labels/notebooks/1/labels/1/remove/ ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

# Search API

## 34. Search Notebooks

**Basic Search:**
```bash
curl -X GET "http://127.0.0.1:8000/api/search/notebooks/?q=meeting" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

**Advanced Search (Workspace + Labels):**
```bash
curl -X GET "http://127.0.0.1:8000/api/search/notebooks/?q=project&workspace_id=1&labels=1,2" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 35. Search Workspaces

```bash
curl -X GET "http://127.0.0.1:8000/api/search/workspaces/?q=team" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```
