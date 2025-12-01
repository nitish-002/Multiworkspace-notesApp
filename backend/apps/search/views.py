from rest_framework import generics, permissions
from apps.notebooks.serializers import NotebookListSerializer
from apps.workspaces.serializers import WorkspaceListSerializer
from .services import SearchService

class NotebookSearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotebookListSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        workspace_id = self.request.query_params.get('workspace_id')
        labels = self.request.query_params.get('labels')
        
        return SearchService.search_notebooks(
            user=self.request.user,
            query=query,
            workspace_id=workspace_id,
            label_ids=labels
        )

class WorkspaceSearchView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = WorkspaceListSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        return SearchService.search_workspaces(
            user=self.request.user,
            query=query
        )
