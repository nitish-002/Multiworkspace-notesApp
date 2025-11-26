import hashlib
import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class Notebook(models.Model):
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='notebooks')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True)
    version = models.IntegerField(default=1)
    content_hash = models.CharField(max_length=64, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_notebooks')
    last_modified_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='modified_notebooks')
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['workspace', 'updated_at']),
            models.Index(fields=['workspace', 'is_deleted']),
        ]

    def save(self, *args, **kwargs):
        if self.content:
            self.content_hash = hashlib.sha256(self.content.encode('utf-8')).hexdigest()
        else:
            self.content_hash = hashlib.sha256(b"").hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} (v{self.version})"

class NotebookVersion(models.Model):
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='versions')
    version_number = models.IntegerField()
    content = models.TextField()
    content_diff = models.TextField(blank=True)
    change_summary = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('notebook', 'version_number')
        ordering = ['-version_number']

    def __str__(self):
        return f"{self.notebook.title} - v{self.version_number}"

class EditingSession(models.Model):
    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='active_sessions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    base_version = models.IntegerField()
    base_content = models.TextField()
    session_token = models.UUIDField(default=uuid.uuid4, editable=False)
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"Session {self.session_token} - {self.user.email}"
