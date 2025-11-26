from rest_framework import permissions
from .models import WorkspaceMember

class IsWorkspaceOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user

class IsWorkspaceMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(workspace=obj, user=request.user).exists()

class IsWorkspaceOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            workspace=obj, 
            user=request.user, 
            role__in=['OWNER', 'ADMIN']
        ).exists()

class CanEditWorkspace(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return WorkspaceMember.objects.filter(
            workspace=obj, 
            user=request.user, 
            role__in=['OWNER', 'ADMIN', 'EDITOR']
        ).exists()
