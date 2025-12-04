#!/usr/bin/env python3
"""
Script to test if the deployed backend is working
"""
import requests
import sys

def test_backend(url):
    """Test backend endpoints"""
    print(f"Testing backend at: {url}")
    print("-" * 50)
    
    # Test 1: Root endpoint (with longer timeout for cold starts)
    print("Testing root endpoint (this may take 30-60 seconds on first request if service is sleeping)...")
    try:
        response = requests.get(f"{url}/", timeout=60)
        print(f"✓ Root endpoint: {response.status_code}")
        if response.status_code == 400:
            print(f"  ⚠ Response: {response.text[:200]}")
    except requests.exceptions.Timeout:
        print("✗ Root endpoint: Timeout (service may be sleeping or starting up)")
        print("  → Render free tier services sleep after 15 minutes of inactivity")
        print("  → First request can take 30-60 seconds to wake up the service")
        print("  → Try again in a few moments, or check Render dashboard")
        return False
    except requests.exceptions.RequestException as e:
        print(f"✗ Root endpoint failed: {e}")
        return False
    
    # Test 2: Admin endpoint (should redirect or return 404/403, but server should respond)
    try:
        response = requests.get(f"{url}/admin/", timeout=30, allow_redirects=True)
        print(f"✓ Admin endpoint: {response.status_code}")
    except requests.exceptions.Timeout:
        print("⚠ Admin endpoint: Timeout (service may still be waking up)")
    except requests.exceptions.RequestException as e:
        print(f"⚠ Admin endpoint: {e}")
    
    # Test 3: API endpoint (should return 401 without auth, but server should respond)
    try:
        response = requests.get(f"{url}/api/workspaces/", timeout=30)
        if response.status_code in [200, 401, 403]:
            print(f"✓ API endpoint: {response.status_code} (expected for unauthenticated request)")
        else:
            print(f"⚠ API endpoint: {response.status_code} (unexpected)")
    except requests.exceptions.Timeout:
        print("✗ API endpoint: Timeout")
        print("  → Service may be sleeping. Check Render dashboard for service status")
        return False
    except requests.exceptions.RequestException as e:
        print(f"✗ API endpoint failed: {e}")
        return False
    
    # Test 4: CORS headers
    try:
        response = requests.options(f"{url}/api/workspaces/", timeout=10)
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        }
        print(f"✓ CORS headers: {cors_headers}")
    except requests.exceptions.RequestException as e:
        print(f"⚠ CORS test failed: {e}")
    
    print("-" * 50)
    print("✅ Backend is responding!")
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        backend_url = sys.argv[1].rstrip('/')
    else:
        # Default to local if no URL provided
        backend_url = "http://127.0.0.1:8000"
        print("No URL provided, testing local backend...")
        print("Usage: python test_backend.py <backend_url>")
        print("Example: python test_backend.py https://your-backend.onrender.com")
        print()
    
    success = test_backend(backend_url)
    sys.exit(0 if success else 1)

