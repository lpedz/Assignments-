import os
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

def validate_file_extension(value):
    ext = os.path.splitext(value.name)[1][1:].lower()
    valid_extensions = getattr(settings, 'ALLOWED_FILE_EXTENSIONS', [])
    if ext not in valid_extensions:
        raise ValidationError(f'Unsupported file extension. Allowed: {", ".join(valid_extensions)}')

def validate_file_size(value):
    limit = getattr(settings, 'FILE_UPLOAD_MAX_MEMORY_SIZE', 16 * 1024 * 1024)
    if value.size > limit:
        raise ValidationError(f'File too large. Size should not exceed {limit / (1024*1024)} MB.')

def user_directory_path(instance, filename):
    """File will be uploaded to MEDIA_ROOT/user_<id>/<filename>"""
    return f'user_{instance.user.id}/{filename}'

class File(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(
        upload_to=user_directory_path,
        validators=[validate_file_extension, validate_file_size]
    )
    original_filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_filename} ({self.user.username})"

    def save(self, *args, **kwargs):
        # Auto-fill metadata on creation
        if not self.pk and self.file:
            self.original_filename = self.file.name
            self.file_size = self.file.size
            self.file_type = os.path.splitext(self.file.name)[1].lower()
        super().save(*args, **kwargs)
