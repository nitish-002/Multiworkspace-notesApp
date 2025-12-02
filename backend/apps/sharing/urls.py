from django.urls import path
from .views import (
    ShareLinkListView, CreateShareLinkView, ShareLinkDetailView,
    AccessSharedNotebookView, ShareLinkStatsView
)

urlpatterns = [
    path('', ShareLinkListView.as_view(), name='share-link-list'),
    path('create/', CreateShareLinkView.as_view(), name='create-share-link'),
    path('<int:pk>/', ShareLinkDetailView.as_view(), name='share-link-detail'),
    path('<int:pk>/stats/', ShareLinkStatsView.as_view(), name='share-link-stats'),
    path('access/<uuid:token>/', AccessSharedNotebookView.as_view(), name='access-shared-notebook'),
]
