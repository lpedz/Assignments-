from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds an email field as required and a bio field.
    """
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Use email for authentication display
    REQUIRED_FIELDS = ['email']

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.username
