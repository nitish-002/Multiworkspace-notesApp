from django.urls import path
from apps.sync.views import (
    StartEditingView, ApplyPatchView,
    ConflictListView, ConflictDetailView, ResolveConflictView, CheckVersionView
)

urlpatterns = [
    path('notebooks/<int:notebook_id>/edit/', StartEditingView.as_view(), name='start-editing'),
    path('notebooks/<int:notebook_id>/apply-patch/', ApplyPatchView.as_view(), name='apply-patch'),
    path('conflicts/', ConflictListView.as_view(), name='conflict-list'),
    path('conflicts/<int:conflict_id>/', ConflictDetailView.as_view(), name='conflict-detail'),
    path('conflicts/<int:conflict_id>/resolve/', ResolveConflictView.as_view(), name='resolve-conflict'),
    path('notebooks/<int:notebook_id>/check-version/', CheckVersionView.as_view(), name='check-version'),
]
