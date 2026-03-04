import jwt
import datetime
from django.conf import settings


def generate_access_token(user):
    """Generate a short-lived JWT access token."""
    payload = {
        'user_id': user.id,
        'username': user.username,
        'type': 'access',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRY_MINUTES
        ),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')


def generate_refresh_token(user):
    """Generate a long-lived JWT refresh token."""
    payload = {
        'user_id': user.id,
        'type': 'refresh',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(
            days=settings.JWT_REFRESH_TOKEN_EXPIRY_DAYS
        ),
        'iat': datetime.datetime.utcnow(),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm='HS256')


def decode_token(token):
    """Decode and validate a JWT token. Returns the payload or raises an exception."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
