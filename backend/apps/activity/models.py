from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class ActivityLog(models.Model):
    WORKSPACE_CREATED = 'Created workspace'
    WORKSPACE_UPDATED = 'Updated workspace'
    MEMBER_ADDED = 'Added member'
    MEMBER_REMOVED = 'Removed member'
    MEMBER_ROLE_CHANGED = 'Changed member role'
    NOTEBOOK_CREATED = 'Created notebook'
    NOTEBOOK_UPDATED = 'Updated notebook'
    NOTEBOOK_DELETED = 'Deleted notebook'
    NOTEBOOK_RESTORED = 'Restored notebook'
    LABEL_CREATED = 'Created label'
    LABEL_ADDED = 'Added label to notebook'
    LABEL_REMOVED = 'Removed label from notebook'
    SHARE_LINK_CREATED = 'Created share link'
    SHARE_LINK_REVOKED = 'Revoked share link'

    ACTION_CHOICES = [
        (WORKSPACE_CREATED, 'Created workspace'),
        (WORKSPACE_UPDATED, 'Updated workspace'),
        (MEMBER_ADDED, 'Added member'),
        (MEMBER_REMOVED, 'Removed member'),
        (MEMBER_ROLE_CHANGED, 'Changed member role'),
        (NOTEBOOK_CREATED, 'Created notebook'),
        (NOTEBOOK_UPDATED, 'Updated notebook'),
        (NOTEBOOK_DELETED, 'Deleted notebook'),
        (NOTEBOOK_RESTORED, 'Restored notebook'),
        (LABEL_CREATED, 'Created label'),
        (LABEL_ADDED, 'Added label to notebook'),
        (LABEL_REMOVED, 'Removed label from notebook'),
        (SHARE_LINK_CREATED, 'Created share link'),
        (SHARE_LINK_REVOKED, 'Revoked share link'),
    ]

    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='activities')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='activities')
    action_type = models.CharField(max_length=30, choices=ACTION_CHOICES)
    target_type = models.CharField(max_length=50)
    target_id = models.IntegerField(null=True)
    target_title = models.CharField(max_length=300)
    metadata = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['workspace', '-created_at']),
            models.Index(fields=['actor', '-created_at']),
        ]

    def __str__(self):
        actor_email = self.actor.email if self.actor else 'Unknown'
        return f"{actor_email} {self.action_type} in {self.workspace.name}"
