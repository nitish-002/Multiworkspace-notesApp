from django.contrib import admin
from .models import Label, NotebookLabel

@admin.register(Label)
class LabelAdmin(admin.ModelAdmin):
    list_display = ('name', 'workspace', 'color', 'created_at')
    list_filter = ('workspace',)
    search_fields = ('name', 'workspace__name')

@admin.register(NotebookLabel)
class NotebookLabelAdmin(admin.ModelAdmin):
    list_display = ('notebook', 'label', 'added_by', 'added_at')
    list_filter = ('label__workspace',)
