from django.contrib import admin
from .models import ActivityLog

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('workspace', 'actor', 'action_type', 'target_title', 'created_at')
    list_filter = ('action_type', 'workspace', 'created_at')
    search_fields = ('target_title', 'actor__email', 'workspace__name')
    readonly_fields = [field.name for field in ActivityLog._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
