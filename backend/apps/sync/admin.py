from django.contrib import admin
from apps.sync.models import NotebookConflict
from apps.notebooks.models import EditingSession

@admin.register(NotebookConflict)
class NotebookConflictAdmin(admin.ModelAdmin):
    list_display = ('notebook', 'user', 'resolution_strategy', 'created_at')
    list_filter = ('resolution_strategy', 'created_at')
    search_fields = ('notebook__title', 'user__email')

@admin.register(EditingSession)
class EditingSessionAdmin(admin.ModelAdmin):
    list_display = ('notebook', 'user', 'base_version', 'is_active', 'started_at')
    list_filter = ('is_active', 'started_at')
    search_fields = ('notebook__title', 'user__email')
