from django.contrib import admin
from .models import Workspace, WorkspaceMember

class WorkspaceMemberInline(admin.TabularInline):
    model = WorkspaceMember
    extra = 1

@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'owner', 'created_at')
    search_fields = ('name', 'owner__email')
    inlines = [WorkspaceMemberInline]

@admin.register(WorkspaceMember)
class WorkspaceMemberAdmin(admin.ModelAdmin):
    list_display = ('workspace', 'user', 'role', 'joined_at')
    list_filter = ('role', 'workspace')
    search_fields = ('user__email', 'workspace__name')
