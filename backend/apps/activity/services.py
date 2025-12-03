from .models import ActivityLog

class ActivityService:
    @staticmethod
    def log_activity(workspace, actor, action_type, target_type=None, target_id=None, target_title=None, metadata=None):
        if metadata is None:
            metadata = {}
            
        return ActivityLog.objects.create(
            workspace=workspace,
            actor=actor,
            action_type=action_type,
            target_type=target_type,
            target_id=target_id,
            target_title=target_title or 'Unknown',
            metadata=metadata
        )

    @staticmethod
    def log_workspace_created(workspace, actor):
        ActivityService.log_activity(
            workspace=workspace,
            actor=actor,
            action_type=ActivityLog.WORKSPACE_CREATED,
            target_type='Workspace',
            target_id=workspace.id,
            target_title=workspace.name
        )

    @staticmethod
    def log_notebook_created(notebook, actor):
        ActivityService.log_activity(
            workspace=notebook.workspace,
            actor=actor,
            action_type=ActivityLog.NOTEBOOK_CREATED,
            target_type='Notebook',
            target_id=notebook.id,
            target_title=notebook.title
        )

    @staticmethod
    def log_notebook_updated(notebook, actor, old_version=None, new_version=None):
        meta = {}
        if old_version: meta['old_version'] = old_version
        if new_version: meta['new_version'] = new_version
        
        ActivityService.log_activity(
            workspace=notebook.workspace,
            actor=actor,
            action_type=ActivityLog.NOTEBOOK_UPDATED,
            target_type='Notebook',
            target_id=notebook.id,
            target_title=notebook.title,
            metadata=meta
        )

    @staticmethod
    def log_member_added(workspace, actor, added_user, role):
        ActivityService.log_activity(
            workspace=workspace,
            actor=actor,
            action_type=ActivityLog.MEMBER_ADDED,
            target_type='WorkspaceMember',
            target_id=added_user.id,
            target_title=added_user.email,
            metadata={'role': role}
        )
