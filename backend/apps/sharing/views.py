from rest_framework import generics, permissions, status, exceptions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import ShareLink, ShareLinkAccess
from .serializers import (
    ShareLinkSerializer, CreateShareLinkSerializer, 
    UpdateShareLinkSerializer, AccessSharedNotebookSerializer
)
from .utils import log_share_link_access
from apps.notebooks.models import Notebook
from apps.notebooks.serializers import NotebookDetailSerializer
from apps.notebooks.permissions import CanEditNotebook

class ShareLinkListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ShareLinkSerializer

    def get_queryset(self):
        queryset = ShareLink.objects.filter(created_by=self.request.user)
        
        notebook_id = self.request.query_params.get('notebook_id')
        if notebook_id:
            queryset = queryset.filter(notebook_id=notebook_id)
            
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=active)
            
        return queryset

class CreateShareLinkView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateShareLinkSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response_serializer = ShareLinkSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class ShareLinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'PATCH':
            return UpdateShareLinkSerializer
        return ShareLinkSerializer

    def get_queryset(self):
        return ShareLink.objects.filter(created_by=self.request.user)

    def perform_destroy(self, instance):
        # Soft delete by deactivating
        instance.is_active = False
        instance.save()

class AccessSharedNotebookView(generics.RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NotebookDetailSerializer
    lookup_field = 'token'

    def get_object(self):
        token = self.kwargs.get('token')
        share_link = get_object_or_404(ShareLink, token=token)
        
        if not share_link.is_valid():
            raise exceptions.PermissionDenied("This share link is invalid or expired.")
            
        if share_link.password_hash:
            password = self.request.data.get('password')
            # For GET requests with password param if body not possible (though GET with body is discouraged)
            # Or maybe we should use POST for password access? 
            # The requirement says GET /api/share/access/<token>/ with body.
            if not password:
                raise exceptions.NotAuthenticated("Password required.")
            if not share_link.check_password(password):
                raise exceptions.AuthenticationFailed("Incorrect password.")
        
        # Log access
        log_share_link_access(share_link, self.request)
        
        # Increment use count
        share_link.increment_use_count()
        
        # Serialize notebook
        # serializer = self.get_serializer(share_link.notebook)
        
        return share_link

    def retrieve(self, request, *args, **kwargs):
        share_link = self.get_object()
        serializer = self.get_serializer(share_link.notebook)
        return Response({
            "notebook": serializer.data,
            "access_level": share_link.access_level
        })

class ShareLinkStatsView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ShareLinkSerializer
    queryset = ShareLink.objects.all()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.created_by != request.user:
            raise exceptions.PermissionDenied("You do not have permission to view stats for this link.")
            
        recent_accesses = instance.accesses.all()[:10]
        access_data = [
            {
                "accessed_at": access.accessed_at,
                "ip_address": access.ip_address,
                "user_agent": access.user_agent,
                "accessed_by_email": access.accessed_by_email
            }
            for access in recent_accesses
        ]
        
        return Response({
            "use_count": instance.use_count,
            "last_accessed_at": instance.last_accessed_at,
            "recent_accesses": access_data
        })

class EditSharedNotebookView(generics.UpdateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = NotebookDetailSerializer
    lookup_field = 'token'

    def get_object(self):
        token = self.kwargs.get('token')
        share_link = get_object_or_404(ShareLink, token=token)
        
        if not share_link.is_valid():
            raise exceptions.PermissionDenied("This share link is invalid or expired.")
            
        if share_link.access_level != 'EDIT':
            raise exceptions.PermissionDenied("This link does not have edit permissions.")

        if share_link.password_hash:
            # For PATCH, password should be in the body
            password = self.request.data.get('password')
            if not password:
                raise exceptions.NotAuthenticated("Password required.")
            if not share_link.check_password(password):
                raise exceptions.AuthenticationFailed("Incorrect password.")
        
        return share_link.notebook
