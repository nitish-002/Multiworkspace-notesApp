from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember
from .serializers import (
    WorkspaceListSerializer, WorkspaceDetailSerializer, WorkspaceCreateSerializer,
    WorkspaceMemberSerializer, AddMemberSerializer
)
from .permissions import IsWorkspaceOwner, IsWorkspaceOwnerOrAdmin, IsWorkspaceMember, CanEditWorkspace

User = get_user_model()

from django.db.models import Prefetch

class WorkspaceListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(members__user=self.request.user).prefetch_related(
            Prefetch('members', queryset=WorkspaceMember.objects.filter(user=self.request.user), to_attr='my_membership')
        )

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return WorkspaceCreateSerializer
        return WorkspaceListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        response_serializer = WorkspaceListSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Workspace.objects.prefetch_related('members__user')
    
    def get_serializer_class(self):
        return WorkspaceDetailSerializer

    def get_permissions(self):
        if self.request.method == 'DELETE':
            return [permissions.IsAuthenticated(), IsWorkspaceOwner()]
        elif self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), CanEditWorkspace()]
        return [permissions.IsAuthenticated(), IsWorkspaceMember()]

class WorkspaceMembersView(generics.ListAPIView):
    serializer_class = WorkspaceMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]

    def get_queryset(self):
        workspace = get_object_or_404(Workspace, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, workspace)
        return WorkspaceMember.objects.filter(workspace=workspace)

class AddWorkspaceMemberView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin]

    def post(self, request, pk):
        workspace = get_object_or_404(Workspace, pk=pk)
        self.check_object_permissions(request, workspace)
        
        serializer = AddMemberSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            user = User.objects.get(email=email)
            
            if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
                return Response({"detail": "User is already a member."}, status=status.HTTP_400_BAD_REQUEST)
            
            WorkspaceMember.objects.create(
                workspace=workspace,
                user=user,
                role=role,
                invited_by=request.user
            )
            return Response({"detail": "Member added successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UpdateMemberRoleView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin]

    def put(self, request, pk, user_id):
        workspace = get_object_or_404(Workspace, pk=pk)
        self.check_object_permissions(request, workspace)
        
        member = get_object_or_404(WorkspaceMember, workspace=workspace, user_id=user_id)
        
        if member.role == 'OWNER':
             return Response({"detail": "Cannot change role of the owner."}, status=status.HTTP_403_FORBIDDEN)

        role = request.data.get('role')
        if role not in dict(WorkspaceMember.ROLE_CHOICES):
             return Response({"detail": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)
        
        if role == 'OWNER':
             return Response({"detail": "Cannot assign OWNER role manually."}, status=status.HTTP_400_BAD_REQUEST)

        member.role = role
        member.save()
        
        # Log activity
        from apps.activity.models import ActivityLog
        from apps.activity.services import ActivityService
        
        ActivityService.log_activity(
            workspace=workspace,
            actor=request.user,
            action_type=ActivityLog.MEMBER_ROLE_CHANGED,
            target_type='WorkspaceMember',
            target_id=member.user.id,
            target_title=member.user.email,
            metadata={'new_role': role}
        )
        
        return Response({"detail": "Member role updated."})

class RemoveMemberView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceOwnerOrAdmin]

    def delete(self, request, pk, user_id):
        workspace = get_object_or_404(Workspace, pk=pk)
        self.check_object_permissions(request, workspace)
        
        member = get_object_or_404(WorkspaceMember, workspace=workspace, user_id=user_id)
        
        if member.role == 'OWNER':
             return Response({"detail": "Cannot remove the owner."}, status=status.HTTP_403_FORBIDDEN)

        member.delete()
        
        # Log activity
        from apps.activity.models import ActivityLog
        from apps.activity.services import ActivityService
        
        ActivityService.log_activity(
            workspace=workspace,
            actor=request.user,
            action_type=ActivityLog.MEMBER_REMOVED,
            target_type='WorkspaceMember',
            target_id=member.user.id,
            target_title=member.user.email
        )
        
        return Response(status=status.HTTP_204_NO_CONTENT)
