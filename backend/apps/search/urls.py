from django.urls import path
from .views import NotebookSearchView, WorkspaceSearchView

urlpatterns = [
    path('notebooks/', NotebookSearchView.as_view(), name='search-notebooks'),
    path('workspaces/', WorkspaceSearchView.as_view(), name='search-workspaces'),
]
