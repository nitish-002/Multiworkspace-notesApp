from rest_framework import permissions
from apps.workspaces.models import WorkspaceMember

class CanAccessNotebook(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the workspace
        return WorkspaceMember.objects.filter(
            workspace=obj.workspace, 
            user=request.user
        ).exists()

class CanEditNotebook(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Check if user has edit rights (OWNER, ADMIN, EDITOR)
        return WorkspaceMember.objects.filter(
            workspace=obj.workspace, 
            user=request.user, 
            role__in=['OWNER', 'ADMIN', 'EDITOR']
        ).exists()
