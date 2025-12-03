from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from datetime import timedelta

from apps.workspaces.permissions import IsWorkspaceMember
from apps.notebooks.permissions import CanAccessNotebook
from .models import ActivityLog
from .serializers import ActivityLogSerializer

class ActivityPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class WorkspaceActivityView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, IsWorkspaceMember]
    pagination_class = ActivityPagination

    def get_queryset(self):
        workspace_id = self.kwargs.get('workspace_id')
        queryset = ActivityLog.objects.filter(workspace_id=workspace_id)

        # Filters
        action_type = self.request.query_params.get('action_type')
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        actor_id = self.request.query_params.get('actor_id')
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)

        target_type = self.request.query_params.get('target_type')
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        days = self.request.query_params.get('days', 30)
        try:
            days = int(days)
            start_date = timezone.now() - timedelta(days=days)
            queryset = queryset.filter(created_at__gte=start_date)
        except ValueError:
            pass

        return queryset.order_by('-created_at')

class UserActivityView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ActivityPagination

    def get_queryset(self):
        return ActivityLog.objects.filter(actor=self.request.user).order_by('-created_at')

class NotebookActivityView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [IsAuthenticated, CanAccessNotebook]
    pagination_class = ActivityPagination

    def get_queryset(self):
        notebook_id = self.kwargs.get('notebook_id')
        # Assuming notebook_id is passed in URL and handled by permission class for access check
        # We filter by target_id and target_type='Notebook'
        # Also ensure the notebook belongs to a workspace the user can access (handled by CanAccessNotebook usually)
        
        return ActivityLog.objects.filter(
            target_type='Notebook',
            target_id=notebook_id
        ).order_by('-created_at')
