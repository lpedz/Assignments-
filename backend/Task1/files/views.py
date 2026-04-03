import os
import mimetypes
from django.http import FileResponse, Http404
from rest_framework import viewsets, mixins
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from .models import File
from .serializers import FileSerializer

class FileViewSet(mixins.CreateModelMixin,
                  mixins.ListModelMixin,
                  mixins.RetrieveModelMixin,
                  mixins.DestroyModelMixin,
                  viewsets.GenericViewSet):
    """
    API for uploading, listing, and deleting files.
    Allows Create, List, Retrieve (Metadata), Destroy. 
    Updates (PUT/PATCH) are not allowed.
    Only allows authenticated users to access their own files.
    """
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter files to only show the authenticated user's files."""
        return File.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the user when uploading a file."""
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Secure download endpoint for the file. Only the owner can access it."""
        file_obj = self.get_object() # Validates ownership via get_queryset
        
        if not file_obj.file or not os.path.exists(file_obj.file.path):
            raise Http404("File not found on server.")
            
        content_type, _ = mimetypes.guess_type(file_obj.file.path)
        if not content_type:
            content_type = 'application/octet-stream'

        response = FileResponse(open(file_obj.file.path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file_obj.original_filename}"'
        return response
