from django.urls import path
from .views import (
    NotebookListCreateView, NotebookDetailView, NotebookVersionHistoryView,
    NotebookRestoreView, TrashListView
)

urlpatterns = [
    path('', NotebookListCreateView.as_view(), name='notebook-list-create'),
    path('trash/', TrashListView.as_view(), name='notebook-trash'),
    path('<int:pk>/', NotebookDetailView.as_view(), name='notebook-detail'),
    path('<int:pk>/versions/', NotebookVersionHistoryView.as_view(), name='notebook-versions'),
    path('<int:pk>/restore/', NotebookRestoreView.as_view(), name='notebook-restore'),
]
