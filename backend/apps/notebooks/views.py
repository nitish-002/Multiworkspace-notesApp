from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Notebook, NotebookVersion
from .serializers import (
    NotebookListSerializer, NotebookDetailSerializer, NotebookCreateSerializer,
    NotebookUpdateSerializer, NotebookVersionSerializer
)
from .permissions import CanAccessNotebook, CanEditNotebook
from apps.workspaces.models import WorkspaceMember

class NotebookListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Notebook.objects.filter(
            workspace__members__user=self.request.user,
            is_deleted=False
        ).distinct()
        
        workspace_id = self.request.query_params.get('workspace_id')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
            
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return NotebookCreateSerializer
        return NotebookListSerializer

class NotebookDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Notebook.objects.filter(is_deleted=False)
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return NotebookUpdateSerializer
        return NotebookDetailSerializer

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), CanEditNotebook()]
        return [permissions.IsAuthenticated(), CanAccessNotebook()]

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save()

class NotebookVersionHistoryView(generics.ListAPIView):
    serializer_class = NotebookVersionSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessNotebook]

    def get_queryset(self):
        notebook = get_object_or_404(Notebook, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, notebook)
        return NotebookVersion.objects.filter(notebook=notebook)

class NotebookRestoreView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, CanEditNotebook]

    def post(self, request, pk):
        notebook = get_object_or_404(Notebook, pk=pk)
        self.check_object_permissions(request, notebook)
        
        if not notebook.is_deleted:
            return Response({"detail": "Notebook is not deleted."}, status=status.HTTP_400_BAD_REQUEST)
            
        notebook.is_deleted = False
        notebook.deleted_at = None
        notebook.save()
        return Response({"detail": "Notebook restored successfully."})

class TrashListView(generics.ListAPIView):
    serializer_class = NotebookListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notebook.objects.filter(
            workspace__members__user=self.request.user,
            is_deleted=True
        ).distinct()
