from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notebook, NotebookVersion
from apps.workspaces.models import Workspace, WorkspaceMember

User = get_user_model()

class NotebookListSerializer(serializers.ModelSerializer):
    workspace = serializers.SerializerMethodField()
    created_by = serializers.StringRelatedField()
    last_modified_by = serializers.StringRelatedField()

    class Meta:
        model = Notebook
        fields = ['id', 'title', 'workspace', 'version', 'created_by', 'last_modified_by', 'updated_at', 'is_deleted']

    def get_workspace(self, obj):
        return {
            "id": obj.workspace.id,
            "name": obj.workspace.name
        }

class NotebookDetailSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()
    last_modified_by = serializers.StringRelatedField()

    class Meta:
        model = Notebook
        fields = ['id', 'workspace', 'title', 'content', 'version', 'content_hash', 'created_by', 'last_modified_by', 'created_at', 'updated_at', 'is_deleted']
        read_only_fields = ['workspace', 'version', 'content_hash', 'created_by', 'last_modified_by', 'created_at', 'updated_at']

class NotebookCreateSerializer(serializers.ModelSerializer):
    workspace_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Notebook
        fields = ['title', 'content', 'workspace_id']

    def validate_workspace_id(self, value):
        user = self.context['request'].user
        if not WorkspaceMember.objects.filter(workspace_id=value, user=user, role__in=['OWNER', 'ADMIN', 'EDITOR']).exists():
            raise serializers.ValidationError("You do not have permission to create notebooks in this workspace.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        workspace_id = validated_data.pop('workspace_id')
        workspace = Workspace.objects.get(id=workspace_id)
        
        notebook = Notebook.objects.create(
            workspace=workspace,
            created_by=user,
            last_modified_by=user,
            **validated_data
        )
        
        # Create first version
        NotebookVersion.objects.create(
            notebook=notebook,
            version_number=1,
            content=notebook.content,
            change_summary="Initial creation",
            created_by=user
        )
        
        return notebook

class NotebookUpdateSerializer(serializers.ModelSerializer):
    change_summary = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Notebook
        fields = ['title', 'content', 'change_summary']

    def update(self, instance, validated_data):
        user = self.context['request'].user
        new_content = validated_data.get('content', instance.content)
        change_summary = validated_data.pop('change_summary', 'Updated notebook')
        
        # Only create new version if content changed
        if new_content != instance.content:
            instance.version += 1
            instance.last_modified_by = user
            
            # Create version entry
            NotebookVersion.objects.create(
                notebook=instance,
                version_number=instance.version,
                content=new_content,
                change_summary=change_summary,
                created_by=user
            )
        
        return super().update(instance, validated_data)

class NotebookVersionSerializer(serializers.ModelSerializer):
    created_by = serializers.StringRelatedField()

    class Meta:
        model = NotebookVersion
        fields = ['id', 'version_number', 'change_summary', 'created_by', 'created_at']
