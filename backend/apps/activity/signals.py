from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from apps.notebooks.models import Notebook
from apps.workspaces.models import WorkspaceMember
from .services import ActivityService

@receiver(pre_save, sender=Notebook)
def capture_old_notebook_state(sender, instance, **kwargs):
    if instance.pk:
        try:
            old_instance = Notebook.objects.get(pk=instance.pk)
            instance._old_version = old_instance.version
        except Notebook.DoesNotExist:
            instance._old_version = None
    else:
        instance._old_version = None

@receiver(post_save, sender=Notebook)
def log_notebook_activity(sender, instance, created, **kwargs):
    if created:
        # For created, we use created_by
        ActivityService.log_notebook_created(instance, instance.created_by)
    else:
        # For updated, we check if version changed or just content
        # If we have _old_version, we can use it.
        old_version = getattr(instance, '_old_version', None)
        new_version = instance.version
        
        # Use last_modified_by if available, else maybe created_by (fallback)
        actor = instance.last_modified_by or instance.created_by
        
        # Only log version metadata if version actually changed
        if old_version is not None and old_version != new_version:
             ActivityService.log_notebook_updated(
                instance, 
                actor, 
                old_version=old_version, 
                new_version=new_version
            )
        else:
            # Just log that it was updated without version details (e.g. title change)
            # Or skip logging if we only want to track content changes?
            # Let's log it but without version metadata to avoid confusion
            ActivityService.log_notebook_updated(
                instance, 
                actor
            )

@receiver(post_save, sender=WorkspaceMember)
def log_member_activity(sender, instance, created, **kwargs):
    if created:
        # invited_by might be null if owner created workspace (auto-add)
        # If invited_by is null, it might be the user themselves (if self-signup/owner)
        # But for WorkspaceMember creation during Workspace creation, invited_by is usually null?
        # In Workspace.save(), it creates WorkspaceMember.
        # We might want to handle that case.
        
        actor = instance.invited_by or instance.user
        ActivityService.log_member_added(
            instance.workspace, 
            actor, 
            instance.user, 
            instance.role
        )
