from django.contrib import admin
from .models import Notebook, NotebookVersion

class NotebookVersionInline(admin.TabularInline):
    model = NotebookVersion
    extra = 0
    readonly_fields = ('version_number', 'created_by', 'created_at')

@admin.register(Notebook)
class NotebookAdmin(admin.ModelAdmin):
    list_display = ('title', 'workspace', 'version', 'created_by', 'updated_at', 'is_deleted')
    list_filter = ('is_deleted', 'workspace')
    search_fields = ('title', 'content')
    inlines = [NotebookVersionInline]

@admin.register(NotebookVersion)
class NotebookVersionAdmin(admin.ModelAdmin):
    list_display = ('notebook', 'version_number', 'created_by', 'created_at')
    list_filter = ('notebook__workspace',)
