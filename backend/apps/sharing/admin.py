from django.contrib import admin
from .models import ShareLink, ShareLinkAccess

@admin.register(ShareLink)
class ShareLinkAdmin(admin.ModelAdmin):
    list_display = ('notebook', 'token', 'access_level', 'created_by', 'expires_at', 'use_count', 'is_active')
    list_filter = ('access_level', 'is_active', 'created_at')
    search_fields = ('notebook__title', 'created_by__email')
    readonly_fields = ('token', 'use_count', 'last_accessed_at', 'created_at')

@admin.register(ShareLinkAccess)
class ShareLinkAccessAdmin(admin.ModelAdmin):
    list_display = ('share_link', 'accessed_by_email', 'ip_address', 'accessed_at')
    list_filter = ('accessed_at',)
    readonly_fields = ('share_link', 'accessed_by_email', 'ip_address', 'user_agent', 'accessed_at')
