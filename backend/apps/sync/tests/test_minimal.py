from django.test import TestCase
from django.contrib.auth import get_user_model
import diff_match_patch as dmp_module

User = get_user_model()

class MinimalTest(TestCase):
    def test_dmp_import(self):
        dmp = dmp_module.diff_match_patch()
        self.assertIsNotNone(dmp)

    def test_user_creation(self):
        user = User.objects.create_user(username='minuser', password='password')
        self.assertIsNotNone(user.pk)

    def test_workspace_creation(self):
        user = User.objects.create_user(username='wuser', password='password')
        from apps.workspaces.models import Workspace
        ws = Workspace.objects.create(name='Test WS', owner=user)
        self.assertIsNotNone(ws.pk)

    def test_notebook_creation(self):
        user = User.objects.create_user(username='nuser', password='password')
        from apps.workspaces.models import Workspace
        ws = Workspace.objects.create(name='Test WS 2', owner=user)
        from apps.notebooks.models import Notebook
        nb = Notebook.objects.create(title='Test NB', content='Line 1', workspace=ws, created_by=user)
        self.assertIsNotNone(nb.pk)

    def test_sync_service_init(self):
        from apps.sync.services import SyncService
        service = SyncService()
        self.assertIsNotNone(service)

    def test_notebook_conflict_import(self):
        from apps.sync.models import NotebookConflict
        self.assertIsNotNone(NotebookConflict)
