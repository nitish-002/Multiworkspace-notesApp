from django.db import models
from django.conf import settings
from apps.notebooks.models import Notebook

class NotebookConflict(models.Model):
    RESOLUTION_CHOICES = [
        ('PENDING', 'Pending'),
        ('AUTO_MERGED', 'Auto-merged'),
        ('YOURS', 'Kept your changes'),
        ('THEIRS', 'Kept their changes'),
        ('MANUAL', 'Manually merged'),
    ]

    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='conflicts')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notebook_conflicts')
    server_version = models.IntegerField()
    client_version = models.IntegerField()  # base_version from client
    base_content = models.TextField()
    your_content = models.TextField()
    their_content = models.TextField()
    resolved_content = models.TextField(blank=True)
    conflict_blocks = models.JSONField(default=list)
    resolution_strategy = models.CharField(max_length=20, choices=RESOLUTION_CHOICES, default='PENDING')
    resolved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_conflicts')
    resolved_at = models.DateTimeField(null=True, blank=True)
    conflict_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notebook_conflicts'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notebook', 'resolution_strategy']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"Conflict in {self.notebook.title} for {self.user.email}"
