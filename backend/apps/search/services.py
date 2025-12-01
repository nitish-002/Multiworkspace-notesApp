from django.db.models import Q, Case, When, Value, IntegerField
from apps.notebooks.models import Notebook
from apps.workspaces.models import Workspace

class SearchService:
    @staticmethod
    def search_notebooks(user, query, workspace_id=None, label_ids=None, limit=50):
        queryset = Notebook.objects.filter(
            workspace__members__user=user,
            is_deleted=False
        ).distinct()

        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)

        if label_ids:
            label_id_list = [int(id) for id in label_ids.split(',')]
            queryset = queryset.filter(notebook_labels__label__id__in=label_id_list)

        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) | Q(content__icontains=query)
            )
            # Simple relevance ranking for SQLite
            queryset = queryset.annotate(
                relevance=Case(
                    When(title__icontains=query, then=Value(2)),
                    When(content__icontains=query, then=Value(1)),
                    default=Value(0),
                    output_field=IntegerField(),
                )
            ).order_by('-relevance', '-updated_at')
        else:
            queryset = queryset.order_by('-updated_at')

        return queryset[:limit]

    @staticmethod
    def search_workspaces(user, query, limit=20):
        queryset = Workspace.objects.filter(members__user=user)
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) | Q(description__icontains=query)
            )
        
        return queryset.order_by('-created_at')[:limit]

    @staticmethod
    def get_recent_notebooks(user, workspace_id=None, limit=10):
        queryset = Notebook.objects.filter(
            workspace__members__user=user,
            is_deleted=False
        ).order_by('-updated_at')

        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)

        return queryset[:limit]
