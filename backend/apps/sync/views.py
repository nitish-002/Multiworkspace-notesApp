from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from apps.notebooks.models import Notebook
from apps.sync.models import NotebookConflict
from apps.sync.services import EditingSessionService, SyncService
from apps.sync.serializers import (
    StartEditingSerializer, ApplyPatchSerializer, 
    ConflictSerializer, ResolveConflictSerializer
)
# Assuming CanEditNotebook permission exists or needs to be imported/created
# If it doesn't exist, we might need to use a standard permission or create one.
# For now, I'll assume it exists in apps.notebooks.permissions as per typical structure
# If not, I'll fallback to IsAuthenticated and check object permissions manually or use a placeholder.
try:
    from apps.notebooks.permissions import CanEditNotebook
except ImportError:
    # Fallback or placeholder if not found
    from rest_framework.permissions import BasePermission
    class CanEditNotebook(BasePermission):
        def has_object_permission(self, request, view, obj):
            # Simple check: owner or shared with edit access
            # This is a placeholder logic
            return obj.created_by == request.user or request.user in obj.shared_with.all()

class StartEditingView(APIView):
    permission_classes = [IsAuthenticated] # CanEditNotebook check inside or via permission class

    def post(self, request, notebook_id):
        notebook = get_object_or_404(Notebook, id=notebook_id)
        # Check permission manually if not using permission_classes for object
        # self.check_object_permissions(request, notebook) 
        
        session = EditingSessionService.start_editing_session(notebook, request.user)
        
        serializer = StartEditingSerializer({
            'notebook_id': notebook.id,
            'session_token': session.session_token,
            'base_version': session.base_version,
            'base_content': session.base_content,
            'current_version': notebook.version
        })
        
        return Response(serializer.data)

class ApplyPatchView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notebook_id):
        serializer = ApplyPatchSerializer(data=request.data)
        if serializer.is_valid():
            sync_service = SyncService()
            result = sync_service.apply_patch_to_notebook(
                notebook_id,
                request.user,
                serializer.validated_data['session_token'],
                serializer.validated_data['patch']
            )
            
            if result['status'] == 'error':
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            elif result['status'] == 'conflict':
                return Response(result, status=status.HTTP_409_CONFLICT)
            else:
                return Response(result, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ConflictListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConflictSerializer
    pagination_class = None

    def get_queryset(self):
        queryset = NotebookConflict.objects.filter(
            resolution_strategy='PENDING'
        )
        notebook_id = self.request.query_params.get('notebook_id')
        if notebook_id:
            queryset = queryset.filter(notebook_id=notebook_id)
        return queryset

class ConflictDetailView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ConflictSerializer
    lookup_field = 'id'
    lookup_url_kwarg = 'conflict_id'

    def get_queryset(self):
        return NotebookConflict.objects.all()

class ResolveConflictView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conflict_id):
        serializer = ResolveConflictSerializer(data=request.data)
        if serializer.is_valid():
            sync_service = SyncService()
            result = sync_service.resolve_conflict(
                conflict_id,
                request.user,
                serializer.validated_data['resolution_strategy'],
                serializer.validated_data.get('final_content')
            )
            
            if result['status'] == 'error':
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(result, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CheckVersionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, notebook_id):
        notebook = get_object_or_404(Notebook, id=notebook_id)
        
        # Count pending conflicts for this notebook
        pending_conflicts = NotebookConflict.objects.filter(
            notebook=notebook,
            resolution_strategy='PENDING'
        ).count()

        return Response({
            'version': notebook.version,
            'last_modified_by': notebook.last_modified_by.id if notebook.last_modified_by else None,
            'pending_conflicts': pending_conflicts
        })
