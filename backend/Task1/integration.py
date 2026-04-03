import requests
import uuid
import sys

BASE_URL = 'http://127.0.0.1:8001/api'

def print_step(msg):
    print(f"\n{'='*50}\n▶ {msg}\n{'='*50}")

def run_tests():
    # Use a unique username to avoid conflicts on re-runs
    unique_id = str(uuid.uuid4())[:8]
    username = f"user_{unique_id}"
    email = f"{username}@test.com"
    password = "SecurePassword123!"

    print_step("1. User Authentication with JWT")
    
    # 1A. Register
    print("Testing Registration...")
    reg_data = {
        "username": username,
        "email": email,
        "password": password,
        "password_confirm": password
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=reg_data)
    assert r.status_code == 201, f"Registration failed: {r.text}"
    print("✅ Registration successful")

    # 1B. Login
    print("Testing Login...")
    login_data = {"username": username, "password": password}
    r = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
    assert r.status_code == 200, f"Login failed: {r.text}"
    tokens = r.json()['tokens']
    access_token = tokens['access']
    refresh_token = tokens['refresh']
    print("✅ Login successful, received tokens")

    # 1C. Token Refresh
    print("Testing Token Refresh...")
    r = requests.post(f"{BASE_URL}/auth/refresh/", json={"refresh": refresh_token})
    assert r.status_code == 200, f"Refresh failed: {r.text}"
    new_access_token = r.json()['access']
    print("✅ Token refresh successful")

    # 1D. JWT Middleware Protection
    print("Testing Protected Profile Endpoint...")
    headers = {"Authorization": f"Bearer {new_access_token}"}
    r = requests.get(f"{BASE_URL}/auth/profile/", headers=headers)
    assert r.status_code == 200, f"Profile fetch failed: {r.text}"
    assert r.json()['user']['username'] == username
    print("✅ Profile fetched successfully via JWT Middleware")

    print_step("2. Simple CRUD API (Tasks)")

    # 2A. Create Task
    print("Testing Task Creation...")
    task_data = {"title": "Test Task", "description": "Doing some integration testing"}
    r = requests.post(f"{BASE_URL}/tasks/", json=task_data, headers=headers)
    assert r.status_code == 201, f"Task creation failed: {r.text}"
    task_id = r.json()['id']
    print(f"✅ Created Task ID: {task_id}")

    # 2B. Read Tasks
    print("Testing Task Retrieval (List and Detail)...")
    r = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    assert len(r.json()) == 1, "Should have exactly 1 task"
    
    r = requests.get(f"{BASE_URL}/tasks/{task_id}/", headers=headers)
    assert r.json()['title'] == "Test Task"
    print("✅ Successfully listed and retrieved task details")

    # 2C. Update Task
    print("Testing Task Update...")
    update_data = {"title": "Updated Task", "completed": True}
    r = requests.put(f"{BASE_URL}/tasks/{task_id}/", json=update_data, headers=headers)
    assert r.status_code == 200, f"Update failed: {r.text}"
    assert r.json()['completed'] is True
    print("✅ Successfully updated task")

    # 2D. Delete Task
    print("Testing Task Deletion...")
    r = requests.delete(f"{BASE_URL}/tasks/{task_id}/", headers=headers)
    assert r.status_code == 204, f"Delete failed: {r.status_code}"
    
    r = requests.get(f"{BASE_URL}/tasks/", headers=headers)
    assert len(r.json()) == 0, "Task list should be empty after deletion"
    print("✅ Successfully deleted task")

    print_step("3. File Upload and Download API")

    # 3A. Upload File
    print("Testing File Upload...")
    file_content = b"This is a strictly confidential file content."
    files = {'file': ('confidential.txt', file_content, 'text/plain')}
    r = requests.post(f"{BASE_URL}/files/", files=files, headers=headers)
    assert r.status_code == 201, f"File upload failed: {r.text}"
    file_info = r.json()
    file_id = file_info['id']
    download_path = file_info['download_url']
    print(f"✅ Successfully uploaded file ID: {file_id}")
    print(f"   Download URL generated: {download_path}")

    # 3B. File Validation Logic (Upload Reject)
    print("Testing File Upload Validation (Rejecting .exe)...")
    bad_files = {'file': ('virus.exe', b'bad code', 'application/x-msdownload')}
    r = requests.post(f"{BASE_URL}/files/", files=bad_files, headers=headers)
    assert r.status_code == 400, "Should reject .exe files"
    print("✅ Successfully rejected unauthorized file extension")

    # 3C. Secure File Download
    print("Testing Secure File Download...")
    download_url = f"http://127.0.0.1:8001{download_path}"
    
    # Try fetching without auth
    r_no_auth = requests.get(download_url)
    assert r_no_auth.status_code in [401, 403], "Should deny unauthenticated downloads"
    
    # Try fetching with auth
    r = requests.get(download_url, headers=headers)
    assert r.status_code == 200, f"Download failed: {r.status_code}"
    assert r.content == file_content, "Downloaded content does not match uploaded content"
    print("✅ Successfully downloaded verified secure file contents")

    # 3D. Delete File
    print("Testing File Deletion...")
    r = requests.delete(f"{BASE_URL}/files/{file_id}/", headers=headers)
    assert r.status_code == 204, "Delete failed"
    print("✅ Successfully deleted file")

    print_step("ALL TESTS PASSED 🎉")
    print("Every requirement has been verified and functions correctly.")

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"❌ TEST FAILED: {e}")
        sys.exit(1)
