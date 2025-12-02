import requests
import sys

BASE_URL = "http://localhost:8000/api"
EMAIL = "admin@example.com"
PASSWORD = "AdminPass123!"

def login():
    print("Logging in...")
    response = requests.post(f"{BASE_URL}/auth/login/", json={"email": EMAIL, "password": PASSWORD})
    if response.status_code == 200:
        print("Login successful")
        return response.json()['access']
    else:
        print(f"Login failed: {response.text}")
        sys.exit(1)

def create_workspace(token):
    print("Creating workspace...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/workspaces/", headers=headers, json={"name": "Sharing Test Workspace"})
    if response.status_code == 201:
        print("Workspace created")
        data = response.json()
        if 'id' in data:
            return data['id']
        print("ID not found in response, listing workspaces...")
    else:
        print(f"Create workspace failed: {response.text}")
    
    # Try to list and get first one
    response = requests.get(f"{BASE_URL}/workspaces/", headers=headers)
    if response.status_code == 200 and response.json():
        print("Using existing workspace")
        print(response.json()[0])
        return response.json()[0]['id']
    sys.exit(1)

def create_notebook(token, workspace_id):
    print("Creating notebook...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/notebooks/", headers=headers, json={"title": "Shared Notebook", "content": "Content", "workspace_id": workspace_id})
    if response.status_code == 201:
        print("Notebook created")
        return response.json()['id']
    else:
        print(f"Create notebook failed: {response.text}")
        # Try to list
        response = requests.get(f"{BASE_URL}/notebooks/?workspace={workspace_id}", headers=headers)
        if response.status_code == 200 and response.json():
             print("Using existing notebook")
             return response.json()[0]['id']
        sys.exit(1)

def create_share_link(token, notebook_id):
    print("Creating share link...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{BASE_URL}/share/create/", headers=headers, json={"notebook": notebook_id, "access_level": "READ", "expires_in_days": 7})
    if response.status_code == 201:
        print("Share link created")
        return response.json()
    else:
        print(f"Create share link failed: {response.text}")
        sys.exit(1)

def access_share_link(token_uuid):
    print(f"Accessing share link {token_uuid}...")
    response = requests.get(f"{BASE_URL}/share/access/{token_uuid}/")
    if response.status_code == 200:
        print("Access successful")
        print(response.json())
    else:
        print(f"Access failed: {response.text}")
        sys.exit(1)

def check_stats(token, link_id):
    print("Checking stats...")
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/share/{link_id}/stats/", headers=headers)
    if response.status_code == 200:
        print("Stats retrieved")
        print(response.json())
    else:
        print(f"Check stats failed: {response.text}")
        sys.exit(1)

def main():
    token = login()
    workspace_id = create_workspace(token)
    notebook_id = create_notebook(token, workspace_id)
    share_link = create_share_link(token, notebook_id)
    access_share_link(share_link['token'])
    check_stats(token, share_link['id'])

if __name__ == "__main__":
    main()
