import uuid
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.hashers import check_password
from apps.notebooks.models import Notebook

class ShareLink(models.Model):
    ACCESS_LEVEL_CHOICES = [
        ('READ', 'Read Only'),
        ('EDIT', 'Can Edit'),
    ]

    notebook = models.ForeignKey(Notebook, on_delete=models.CASCADE, related_name='share_links')
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_share_links')
    access_level = models.CharField(max_length=10, choices=ACCESS_LEVEL_CHOICES)
    expires_at = models.DateTimeField(null=True, blank=True)
    password_hash = models.CharField(max_length=128, blank=True)
    max_uses = models.IntegerField(null=True, blank=True)
    use_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'share_links'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['token']),
            models.Index(fields=['notebook', 'is_active']),
        ]

    def __str__(self):
        return f"Share link for {self.notebook.title}"

    def is_valid(self):
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        if self.max_uses is not None and self.use_count >= self.max_uses:
            return False
        return True

    def check_password(self, password):
        if not self.password_hash:
            return True
        return check_password(password, self.password_hash)

    def increment_use_count(self):
        self.use_count += 1
        self.last_accessed_at = timezone.now()
        self.save(update_fields=['use_count', 'last_accessed_at'])


class ShareLinkAccess(models.Model):
    share_link = models.ForeignKey(ShareLink, on_delete=models.CASCADE, related_name='accesses')
    accessed_by_email = models.EmailField(blank=True)
    ip_address = models.GenericIPAddressField(null=True)
    user_agent = models.TextField(blank=True)
    accessed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'share_link_accesses'
        ordering = ['-accessed_at']

    def __str__(self):
        return f"Access to {self.share_link.notebook.title} at {self.accessed_at}"
