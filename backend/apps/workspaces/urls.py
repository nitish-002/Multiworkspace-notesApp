from django.urls import path
from .views import (
    WorkspaceListCreateView, WorkspaceDetailView, WorkspaceMembersView,
    AddWorkspaceMemberView, UpdateMemberRoleView, RemoveMemberView
)

urlpatterns = [
    path('', WorkspaceListCreateView.as_view(), name='workspace-list-create'),
    path('<int:pk>/', WorkspaceDetailView.as_view(), name='workspace-detail'),
    path('<int:pk>/members/', WorkspaceMembersView.as_view(), name='workspace-members'),
    path('<int:pk>/members/add/', AddWorkspaceMemberView.as_view(), name='add-workspace-member'),
    path('<int:pk>/members/<int:user_id>/update/', UpdateMemberRoleView.as_view(), name='update-member-role'),
    path('<int:pk>/members/<int:user_id>/remove/', RemoveMemberView.as_view(), name='remove-member'),
]
