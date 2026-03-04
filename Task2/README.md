# Django Arithmetic API

A simple RESTful API built with Django and Django REST Framework that performs basic arithmetic operations (addition, subtraction, multiplication, division). The API is secured using JSON Web Tokens (JWT).

## Features
- **JWT Authentication:** All arithmetic endpoints require a valid JWT token.
- **Arithmetic Endpoints:** Perform addition, subtraction, multiplication, and division.
- **Robust Testing:** Integration tests verifying math logic and authentication requirements.

## Prerequisites
- Python 3.10+
- Django 5.2.12
- djangorestframework
- djangorestframework-simplejwt

## Setup Instructions

1. **Clone the repository:**
   (Or navigate to the project directory)

2. **Set up a virtual environment and activate it:**
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser to access the API:**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server:**
   ```bash
   python manage.py runserver
   ```

## Usage

### 1. Obtain a JWT Token
To access the arithmetic endpoints, you first need to obtain an access token using your user credentials.

**Endpoint:** `POST /api/token/`
**Body (JSON):**
```json
{
    "username": "your_username",
    "password": "your_password"
}
```
*Note the `access` token returned in the response.*

### 2. Available Math Endpoints
All of the following endpoints require the token in the Authorization header:
`Authorization: Bearer <your_access_token>`

- **Addition**: `POST /api/add/`
- **Subtraction**: `POST /api/subtract/`
- **Multiplication**: `POST /api/multiply/`
- **Division**: `POST /api/divide/`

**Request Body Format (JSON):**
```json
{
    "a": 10,
    "b": 5
}
```

**Successful Response Format (JSON):**
```json
{
    "result": 15
}
```

## Running Tests
Integration tests are provided in `api/tests.py` using Django REST Framework's `APITestCase`. 

To run the full test suite:
```bash
python manage.py test api
```
