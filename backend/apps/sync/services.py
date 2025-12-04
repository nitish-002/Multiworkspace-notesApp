import diff_match_patch as dmp_module
from django.db import transaction
from django.utils import timezone
from apps.notebooks.models import Notebook, NotebookVersion, EditingSession
from apps.sync.models import NotebookConflict

class EditingSessionService:
    @staticmethod
    def start_editing_session(notebook, user):
        """Create or reactivate editing session"""
        # Deactivate any existing active sessions for this user+notebook
        EditingSession.objects.filter(notebook=notebook, user=user, is_active=True).update(is_active=False)
        
        # Create new session with current content as base
        session = EditingSession.objects.create(
            notebook=notebook,
            user=user,
            base_version=notebook.version,
            base_content=notebook.content,
            is_active=True
        )
        return session

    @staticmethod
    def get_active_session(notebook, user, session_token):
        """Get and validate active session"""
        try:
            session = EditingSession.objects.get(
                session_token=session_token,
                notebook=notebook,
                user=user,
                is_active=True
            )
            # TODO: Implement is_expired check if needed, for now just return session
            # if session.is_expired():
            #     session.is_active = False
            #     session.save()
            #     return None
            return session
        except EditingSession.DoesNotExist:
            return None

class PatchService:
    def __init__(self):
        self.dmp = dmp_module.diff_match_patch()
    
    def generate_patch(self, old_text, new_text):
        """Generate patch from old to new text"""
        patches = self.dmp.patch_make(old_text, new_text)
        return self.dmp.patch_toText(patches)
    
    def apply_patch(self, base_text, patch_text):
        """Apply patch to base text"""
        patches = self.dmp.patch_fromText(patch_text)
        result_text, success_flags = self.dmp.patch_apply(patches, base_text)
        return result_text, all(success_flags)
    
    def three_way_merge(self, base, yours, theirs):
        """Attempt three-way merge"""
        # Check for semantic conflicts first (line-based)
        conflicts = self.detect_conflicts(base, yours, theirs)
        if conflicts:
            return None, False, conflicts

        # Generate patches from base to yours
        your_patches = self.dmp.patch_make(base, yours)
        
        # Try to apply your patches to their version
        result, success = self.dmp.patch_apply(your_patches, theirs)
        
        if all(success):
            return result, True, []
        else:
            # Merge failed (patch application failed)
            # If we are here, detect_conflicts didn't find anything (e.g. context mismatch but not same line)
            # But we should probably return conflicts if we can find any, or just fail.
            # Let's run detect_conflicts again just in case (though it should be deterministic)
            return None, False, conflicts
    
    def detect_conflicts(self, base, yours, theirs):
        """Line-by-line conflict detection"""
        base_lines = base.splitlines()
        your_lines = yours.splitlines()
        their_lines = theirs.splitlines()
        
        conflicts = []
        max_lines = max(len(base_lines), len(your_lines), len(their_lines))
        
        for i in range(max_lines):
            base_line = base_lines[i] if i < len(base_lines) else ""
            your_line = your_lines[i] if i < len(your_lines) else ""
            their_line = their_lines[i] if i < len(their_lines) else ""
            
            # Check if both changed same line differently
            if base_line != your_line and base_line != their_line:
                if your_line != their_line:
                    conflicts.append({
                        'line_number': i + 1,
                        'base': base_line,
                        'yours': your_line,
                        'theirs': their_line
                    })
        
        return conflicts

class SyncService:
    def __init__(self):
        self.patch_service = PatchService()
    
    @transaction.atomic
    def apply_patch_to_notebook(self, notebook_id, user, session_token, patch_text):
        """Main sync method - apply patch with conflict detection"""
        # Lock notebook for update
        notebook = Notebook.objects.select_for_update().get(id=notebook_id)
        
        # Get editing session
        session = EditingSessionService.get_active_session(notebook, user, session_token)
        if not session:
            return {
                'status': 'error',
                'message': 'Invalid or expired editing session'
            }
            
        # Handle empty patch (Polling / Pull)
        if not patch_text:
            if notebook.version > session.base_version:
                # Client is behind, send latest content
                # Update session to match server
                session.base_version = notebook.version
                session.base_content = notebook.content
                session.save()
                
                return {
                    'status': 'auto_merged', # Frontend treats this as "update content"
                    'version': notebook.version,
                    'content': notebook.content,
                    'message': 'Pulled latest changes'
                }
            else:
                # Client is up to date
                return {
                    'status': 'no_changes',
                    'version': notebook.version
                }
        
        # Check if server version changed
        if notebook.version == session.base_version:
            # No conflicts - direct apply
            result_content, success = self.patch_service.apply_patch(
                notebook.content,
                patch_text
            )
            
            if success:
                # Update notebook
                notebook.content = result_content
                notebook.version += 1
                notebook.last_modified_by = user
                notebook.save()
                
                # Create version history
                NotebookVersion.objects.create(
                    notebook=notebook,
                    version_number=notebook.version,
                    content=result_content,
                    created_by=user
                )
                
                # Update session
                session.base_version = notebook.version
                session.base_content = result_content
                session.save()
                
                return {
                    'status': 'success',
                    'version': notebook.version,
                    'content': result_content
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Patch application failed'
                }
        
        # Check if server version changed
        if notebook.version == session.base_version:
            # No conflicts - direct apply
            result_content, success = self.patch_service.apply_patch(
                notebook.content,
                patch_text
            )
            
            if success:
                # Update notebook
                notebook.content = result_content
                notebook.version += 1
                notebook.last_modified_by = user
                notebook.save()
                
                # Create version history
                NotebookVersion.objects.create(
                    notebook=notebook,
                    version_number=notebook.version,
                    content=result_content,
                    created_by=user
                )
                
                # Update session
                session.base_version = notebook.version
                session.base_content = result_content
                session.save()
                
                return {
                    'status': 'success',
                    'version': notebook.version,
                    'content': result_content
                }
            else:
                return {
                    'status': 'error',
                    'message': 'Patch application failed'
                }
        
        else:
            # Version mismatch - attempt merge
            return self._handle_conflict(notebook, user, session, patch_text)
    
    def _handle_conflict(self, notebook, user, session, patch_text):
        """Handle version conflict with three-way merge"""
        base_content = session.base_content
        server_content = notebook.content
        
        # Apply patch to base to get user's version
        your_content, _ = self.patch_service.apply_patch(base_content, patch_text)
        
        # Determine User Role
        # We need to fetch the workspace member. 
        # Since we don't want to import WorkspaceMember inside the method to avoid circular imports if any,
        # we'll assume it's available or do a local import.
        from apps.workspaces.models import WorkspaceMember
        try:
            member = WorkspaceMember.objects.get(workspace=notebook.workspace, user=user)
            role = member.role
        except WorkspaceMember.DoesNotExist:
            role = 'VIEWER' # Should not happen for editor

        is_admin_or_owner = role in ['OWNER', 'ADMIN']

        # Attempt three-way merge
        merged_content, success, conflicts = self.patch_service.three_way_merge(
            base_content,
            your_content,
            server_content
        )
        
        if success:
            # Auto-merge successful
            notebook.content = merged_content
            notebook.version += 1
            notebook.last_modified_by = user
            notebook.save()
            
            # Log conflict (auto-resolved)
            NotebookConflict.objects.create(
                notebook=notebook,
                user=user,
                server_version=notebook.version,
                client_version=session.base_version,
                base_content=base_content,
                your_content=your_content,
                their_content=server_content,
                resolved_content=merged_content,
                resolution_strategy='AUTO_MERGED',
                resolved_by=user,
                resolved_at=timezone.now()
            )
            
            return {
                'status': 'auto_merged',
                'version': notebook.version,
                'content': merged_content,
                'message': 'Changes merged automatically'
            }
        else:
            # Merge failed - Conflict
            
            if is_admin_or_owner:
                # Owner/Admin wins -> Force "YOURS"
                # We treat their version as the resolution
                
                notebook.content = your_content
                notebook.version += 1
                notebook.last_modified_by = user
                notebook.save()
                
                NotebookConflict.objects.create(
                    notebook=notebook,
                    user=user,
                    server_version=notebook.version,
                    client_version=session.base_version,
                    base_content=base_content,
                    your_content=your_content,
                    their_content=server_content,
                    resolved_content=your_content,
                    resolution_strategy='YOURS', # Auto-resolved as YOURS
                    resolved_by=user,
                    resolved_at=timezone.now()
                )
                
                # Update session to match new state
                session.base_version = notebook.version
                session.base_content = your_content
                session.save()

                return {
                    'status': 'auto_merged', # Treat as auto-merge for frontend
                    'version': notebook.version,
                    'content': your_content,
                    'message': 'Conflict resolved automatically (Owner Override)'
                }

            else:
                # Editor -> Queue Conflict
                conflict = NotebookConflict.objects.create(
                    notebook=notebook,
                    user=user,
                    server_version=notebook.version,
                    client_version=session.base_version,
                    base_content=base_content,
                    your_content=your_content,
                    their_content=server_content,
                    conflict_blocks=conflicts,
                    resolution_strategy='PENDING'
                )
                
                return {
                    'status': 'conflict_pending',
                    'conflict_id': conflict.id,
                    'message': 'Changes queued for review'
                }
    
    @transaction.atomic
    def resolve_conflict(self, conflict_id, user, strategy, final_content=None):
        """Resolve conflict with user's choice"""
        conflict = NotebookConflict.objects.select_for_update().get(id=conflict_id)
        
        if conflict.resolution_strategy != 'PENDING':
            return {'status': 'error', 'message': 'Conflict already resolved'}
        
        notebook = Notebook.objects.select_for_update().get(id=conflict.notebook_id)
        
        # Determine final content based on strategy
        if strategy == 'YOURS':
            content = conflict.your_content
        elif strategy == 'THEIRS':
            content = conflict.their_content
        elif strategy == 'MANUAL':
            content = final_content
        else:
            return {'status': 'error', 'message': 'Invalid strategy'}
        
        # Update notebook
        notebook.content = content
        notebook.version += 1
        notebook.last_modified_by = user
        notebook.save()
        
        # Update conflict
        conflict.resolved_content = content
        conflict.resolution_strategy = strategy
        conflict.resolved_by = user
        conflict.resolved_at = timezone.now()
        conflict.save()
        
        # Create version
        NotebookVersion.objects.create(
            notebook=notebook,
            version_number=notebook.version,
            content=content,
            created_by=user,
            change_summary=f"Conflict resolved: {strategy}"
        )
        
        return {
            'status': 'resolved',
            'version': notebook.version,
            'content': content
        }
