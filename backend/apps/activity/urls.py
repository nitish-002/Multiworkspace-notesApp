from django.urls import path
from .views import WorkspaceActivityView, UserActivityView, NotebookActivityView

urlpatterns = [
    path('workspaces/<int:workspace_id>/', WorkspaceActivityView.as_view(), name='workspace-activity'),
    path('my-activity/', UserActivityView.as_view(), name='user-activity'),
    path('notebooks/<int:notebook_id>/', NotebookActivityView.as_view(), name='notebook-activity'),
]
