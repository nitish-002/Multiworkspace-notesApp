from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace
from apps.notebooks.models import Notebook

class Label(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='labels')
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#3B82F6')
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['workspace', 'name']
        db_table = 'labels'
        ordering = ['name']

    def __str__(self):
        return f"{self.workspace.name} - {self.name}"

class NotebookLabel(models.Model):
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='notebook_labels')
    label = models.ForeignKey(Label, on_delete=models.CASCADE, related_name='notebook_labels')
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['notebook', 'label']
        db_table = 'notebook_labels'
        indexes = [
            models.Index(fields=['notebook']),
            models.Index(fields=['label']),
        ]

    def __str__(self):
        return f"{self.notebook.title} - {self.label.name}"
