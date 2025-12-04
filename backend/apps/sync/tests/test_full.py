from django.test import TestCase
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save

User = get_user_model()

class SyncFlowTests(TestCase):
    def _setup_data(self):
        # Imports
        from apps.notebooks.models import Notebook
        from apps.workspaces.models import Workspace, WorkspaceMember
        from apps.sync.services import SyncService, EditingSessionService, PatchService
        from apps.activity.signals import log_notebook_activity, log_member_activity
        
        # Disconnect signals
        try:
            post_save.disconnect(log_notebook_activity, sender=Notebook)
            post_save.disconnect(log_member_activity, sender=WorkspaceMember)
        except Exception:
            pass

        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password')
        self.workspace = Workspace.objects.create(name='Test Workspace', owner=self.user)
        self.notebook = Notebook.objects.create(
            title='Test Notebook',
            content='Line 1\nLine 2\nLine 3',
            workspace=self.workspace,
            created_by=self.user
        )
        self.sync_service = SyncService()
        self.patch_service = PatchService()
        self.EditingSessionService = EditingSessionService

    def test_start_editing_session(self):
        self._setup_data()
        session = self.EditingSessionService.start_editing_session(self.notebook, self.user)
        self.assertIsNotNone(session)
        self.assertEqual(session.base_version, self.notebook.version)
        self.assertTrue(session.is_active)

    def test_apply_patch_no_conflict(self):
        self._setup_data()
        session = self.EditingSessionService.start_editing_session(self.notebook, self.user)
        
        new_content = 'Line 1\nLine 2 Modified\nLine 3'
        patch = self.patch_service.generate_patch(self.notebook.content, new_content)
        
        result = self.sync_service.apply_patch_to_notebook(
            self.notebook.id, self.user, session.session_token, patch
        )
        
        self.assertEqual(result['status'], 'success')
        self.notebook.refresh_from_db()
        self.assertEqual(self.notebook.content, new_content)
        self.assertEqual(self.notebook.version, 2)

    def test_auto_merge(self):
        self._setup_data()
        session = self.EditingSessionService.start_editing_session(self.notebook, self.user)
        
        # Simulate server change
        self.notebook.content = 'Line 1\nLine 2\nLine 3 Modified Server'
        self.notebook.version += 1
        self.notebook.save()
        
        # User changes Line 1
        client_content = 'Line 1 Modified Client\nLine 2\nLine 3'
        patch = self.patch_service.generate_patch(session.base_content, client_content)
        
        result = self.sync_service.apply_patch_to_notebook(
            self.notebook.id, self.user, session.session_token, patch
        )
        
        self.assertEqual(result['status'], 'auto_merged')
        self.notebook.refresh_from_db()
        expected_content = 'Line 1 Modified Client\nLine 2\nLine 3 Modified Server'
        self.assertEqual(self.notebook.content, expected_content)

    def test_conflict_detection(self):
        self._setup_data()
        from apps.sync.models import NotebookConflict
        
        session = self.EditingSessionService.start_editing_session(self.notebook, self.user)
        
        # Simulate server change on Line 2
        self.notebook.content = 'Line 1\nLine 2 Server Change\nLine 3'
        self.notebook.version += 1
        self.notebook.save()
        
        # User changes Line 2 differently
        client_content = 'Line 1\nLine 2 Client Change\nLine 3'
        patch = self.patch_service.generate_patch(session.base_content, client_content)
        
        result = self.sync_service.apply_patch_to_notebook(
            self.notebook.id, self.user, session.session_token, patch
        )
        
        print(f"DEBUG: Result status: {result['status']}")
        if result['status'] == 'auto_merged':
            print(f"DEBUG: Merged content: {result['content']}")
        
        self.assertEqual(result['status'], 'conflict')
        self.assertIn('conflict_id', result)
        
        conflict = NotebookConflict.objects.get(id=result['conflict_id'])
        self.assertEqual(conflict.resolution_strategy, 'PENDING')

    def test_resolve_conflict(self):
        self._setup_data()
        from apps.sync.models import NotebookConflict
        
        session = self.EditingSessionService.start_editing_session(self.notebook, self.user)
        
        # Setup conflict
        self.notebook.content = 'Line 1\nLine 2 Server\nLine 3'
        self.notebook.version += 1
        self.notebook.save()
        
        client_content = 'Line 1\nLine 2 Client\nLine 3'
        patch = self.patch_service.generate_patch(session.base_content, client_content)
        
        result = self.sync_service.apply_patch_to_notebook(
            self.notebook.id, self.user, session.session_token, patch
        )
        conflict_id = result['conflict_id']
        
        # Resolve
        resolve_result = self.sync_service.resolve_conflict(
            conflict_id, self.user, 'YOURS'
        )
        
        self.assertEqual(resolve_result['status'], 'resolved')
        self.notebook.refresh_from_db()
        self.assertEqual(self.notebook.content, client_content)

    def test_manual_conflict_creation(self):
        self._setup_data()
        from apps.sync.models import NotebookConflict
        
        conflict = NotebookConflict.objects.create(
            notebook=self.notebook,
            user=self.user,
            server_version=1,
            client_version=1,
            base_content='base',
            your_content='yours',
            their_content='theirs',
            conflict_blocks=[],
            resolution_strategy='PENDING'
        )
        self.assertIsNotNone(conflict.pk)
