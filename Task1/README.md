# Task 1: Django REST API with JWT Auth, CRUD, and File Handling

A complete Django REST Framework project demonstrating user authentication, resource management (tasks), and secure file handling.

## Features
- **JWT Authentication**: Register, login, and token refresh logic using `PyJWT`.
- **JWT Middleware**: Custom DRF authentication to protect routes.
- **Tasks API (CRUD)**: Create, read, update, and delete tasks. Fully user-scoped (users can only interact with their own tasks).
- **Files API**: Upload files with automated size/type validation. Secure owner-only download links.

## Prerequisites
- Python 3.9+
- SQLite (Local development)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run Migrations**
   ```bash
   python manage.py makemigrations accounts tasks files
   python manage.py migrate
   ```

3. **Start the Development Server**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://127.0.0.1:8000/`.

---

## API Reference

### 1. Authentication
*All requests require `Content-Type: application/json`*

#### Register a New User
- **POST** `/api/auth/register/`
- **Body:** `{"username": "johndoe", "email": "john@example.com", "password": "password123", "password_confirm": "password123", "bio": "Optional bio"}`
- **Success (201):** Returns user object and `access`/`refresh` tokens.

#### Login
- **POST** `/api/auth/login/`
- **Body:** `{"username": "johndoe", "password": "password123"}`
- **Success (200):** Returns `access` and `refresh` tokens.

#### Refresh Token
- **POST** `/api/auth/refresh/`
- **Body:** `{"refresh": "<refresh_token>"}`
- **Success (200):** Returns new `access` token.

#### Get Profile (Protected)
- **GET** `/api/auth/profile/`
- **Headers:** `Authorization: Bearer <access_token>`
- **Success (200):** Returns authenticated user's profile.

---

### 2. Tasks API (CRUD)
*All tasks endpoints require the `Authorization: Bearer <access_token>` header.*
*Users can only access their own tasks.*

#### List all Tasks
- **GET** `/api/tasks/`
- **Success (200):** Returns a list of the user's tasks.

#### Create a Task
- **POST** `/api/tasks/`
- **Body:** `{"title": "Buy groceries", "description": "Milk and eggs", "completed": false}`
- **Success (201):** Returns the created task.

#### Retrieve a Task
- **GET** `/api/tasks/<id>/`
- **Success (200):** Returns the task details.

#### Update a Task
- **PUT** `/api/tasks/<id>/`
- **Body:** `{"title": "Buy groceries", "completed": true}`
- **Success (200):** Returns the updated task.

#### Delete a Task
- **DELETE** `/api/tasks/<id>/`
- **Success (204):** Task deleted.

---

### 3. Files API
*All file endpoints require the `Authorization: Bearer <access_token>` header.*
*Users can only access their own files.*

- **Allowed Extensions:** `txt, pdf, png, jpg, jpeg, gif, doc, docx, csv`
- **Max File Size:** `16 MB`

#### Upload a File
- **POST** `/api/files/`
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `file` field containing the binary file.
- **Success (201):** Returns file metadata including a `download_url`. (Direct file paths are hidden for security).

#### List Uploaded Files
- **GET** `/api/files/`
- **Success (200):** Returns a list of the user's files and their metadata.

#### Download a File
- **GET** *Use the `download_url` returned when uploading/listing the file.* (e.g., `/api/files/<id>/download/`)
- **Success (200):** Returns the raw file contents via `FileResponse`.

#### Delete a File
- **DELETE** `/api/files/<id>/`
- **Success (204):** Deletes the DB record and the associated file from disk.
