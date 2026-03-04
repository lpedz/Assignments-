from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    """
    CRUD API for Tasks.
    Only allows authenticated users.
    Users can only see and modify their own tasks.
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter tasks to only show the authenticated user's tasks."""
        return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Automatically set the user when creating a task."""
        serializer.save(user=self.request.user)
