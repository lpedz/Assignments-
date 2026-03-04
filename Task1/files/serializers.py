from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    """
    Serializer for the File model.
    Read-only fields are automatically populated on creation.
    """
    class Meta:
        model = File
        fields = ('id', 'file', 'original_filename', 'file_size', 'file_type', 'uploaded_at', 'user')
        read_only_fields = ('id', 'original_filename', 'file_size', 'file_type', 'uploaded_at', 'user')

    def to_representation(self, instance):
        """Customize output to exclude the direct file URL for security, replacing it with our download endpoint."""
        representation = super().to_representation(instance)
        # Remove the auto-generated direct file URL exposed by DRF's FileField
        if 'file' in representation:
            representation['download_url'] = f'/api/files/{instance.pk}/download/'
            del representation['file']
        return representation
