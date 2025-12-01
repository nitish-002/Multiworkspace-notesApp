from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Label, NotebookLabel
from .serializers import (
    LabelSerializer, LabelCreateSerializer, NotebookLabelSerializer, AddLabelToNotebookSerializer
)
from apps.workspaces.models import WorkspaceMember
from apps.notebooks.models import Notebook
from apps.notebooks.permissions import CanAccessNotebook, CanEditNotebook
from apps.workspaces.permissions import IsWorkspaceMember

class LabelListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Label.objects.filter(workspace__members__user=self.request.user)
        workspace_id = self.request.query_params.get('workspace_id')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        return queryset

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LabelCreateSerializer
        return LabelSerializer

class LabelDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated] # Custom permission check in get_queryset/perform_destroy might be needed or rely on IsWorkspaceMember logic if applied to object
    
    def get_queryset(self):
        return Label.objects.filter(workspace__members__user=self.request.user)

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return LabelCreateSerializer
        return LabelSerializer

    def perform_destroy(self, instance):
        # Check if user is Owner/Admin of the workspace
        user = self.request.user
        is_authorized = WorkspaceMember.objects.filter(
            workspace=instance.workspace,
            user=user,
            role__in=['OWNER', 'ADMIN']
        ).exists()
        
        if not is_authorized:
             from rest_framework.exceptions import PermissionDenied
             raise PermissionDenied("You do not have permission to delete labels in this workspace.")
        
        instance.delete()

class NotebookLabelsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated, CanAccessNotebook]
    serializer_class = NotebookLabelSerializer

    def get_queryset(self):
        notebook_id = self.kwargs['notebook_id']
        notebook = get_object_or_404(Notebook, pk=notebook_id)
        self.check_object_permissions(self.request, notebook)
        return NotebookLabel.objects.filter(notebook=notebook)

class AddLabelToNotebookView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, CanEditNotebook]

    def post(self, request, notebook_id):
        notebook = get_object_or_404(Notebook, pk=notebook_id)
        self.check_object_permissions(request, notebook)
        
        serializer = AddLabelToNotebookSerializer(data=request.data, context={'notebook_id': notebook_id})
        if serializer.is_valid():
            label_id = serializer.validated_data['label_id']
            label = Label.objects.get(pk=label_id)
            
            NotebookLabel.objects.get_or_create(
                notebook=notebook,
                label=label,
                defaults={'added_by': request.user}
            )
            return Response({"detail": "Label added to notebook."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RemoveLabelFromNotebookView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, CanEditNotebook]

    def delete(self, request, notebook_id, label_id):
        notebook = get_object_or_404(Notebook, pk=notebook_id)
        self.check_object_permissions(request, notebook)
        
        deleted_count, _ = NotebookLabel.objects.filter(notebook=notebook, label_id=label_id).delete()
        
        if deleted_count > 0:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({"detail": "Label not found on this notebook."}, status=status.HTTP_404_NOT_FOUND)
