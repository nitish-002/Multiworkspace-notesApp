from django.urls import path
from .views import (
    LabelListCreateView, LabelDetailView, NotebookLabelsView,
    AddLabelToNotebookView, RemoveLabelFromNotebookView
)

urlpatterns = [
    path('', LabelListCreateView.as_view(), name='label-list-create'),
    path('<int:pk>/', LabelDetailView.as_view(), name='label-detail'),
    path('notebooks/<int:notebook_id>/labels/', NotebookLabelsView.as_view(), name='notebook-labels'),
    path('notebooks/<int:notebook_id>/labels/add/', AddLabelToNotebookView.as_view(), name='add-label-to-notebook'),
    path('notebooks/<int:notebook_id>/labels/<int:label_id>/remove/', RemoveLabelFromNotebookView.as_view(), name='remove-label-from-notebook'),
]
