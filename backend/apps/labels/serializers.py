import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Label, NotebookLabel
from apps.workspaces.models import WorkspaceMember
from apps.notebooks.models import Notebook
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class LabelSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(read_only=True)
    created_by = UserSerializer(read_only=True)
    notebook_count = serializers.SerializerMethodField()

    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'description', 'workspace', 'notebook_count', 'created_by', 'created_at']

    def get_notebook_count(self, obj):
        return obj.notebook_labels.count()

class LabelCreateSerializer(serializers.ModelSerializer):
    workspace = serializers.PrimaryKeyRelatedField(queryset=WorkspaceMember.objects.none()) # Placeholder, will be set in __init__

    class Meta:
        model = Label
        fields = ['name', 'color', 'description', 'workspace']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user:
            # Limit workspace choices to those the user is a member of
            from apps.workspaces.models import Workspace
            self.fields['workspace'].queryset = Workspace.objects.filter(members__user=request.user)

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty.")
        if len(value) > 50:
            raise serializers.ValidationError("Name cannot exceed 50 characters.")
        return value

    def validate_color(self, value):
        if not re.match(r'^#(?:[0-9a-fA-F]{3}){1,2}$', value):
            raise serializers.ValidationError("Invalid hex color format.")
        return value

    def validate_workspace(self, value):
        user = self.context['request'].user
        if not WorkspaceMember.objects.filter(workspace=value, user=user).exists():
            raise serializers.ValidationError("You are not a member of this workspace.")
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class NotebookLabelSerializer(serializers.ModelSerializer):
    label = LabelSerializer(read_only=True)
    notebook = serializers.SerializerMethodField()
    added_by = serializers.StringRelatedField()

    class Meta:
        model = NotebookLabel
        fields = ['id', 'label', 'notebook', 'added_by', 'added_at']

    def get_notebook(self, obj):
        return {
            "id": obj.notebook.id,
            "title": obj.notebook.title
        }

class AddLabelToNotebookSerializer(serializers.Serializer):
    label_id = serializers.IntegerField()

    def validate_label_id(self, value):
        notebook_id = self.context.get('notebook_id')
        try:
            notebook = Notebook.objects.get(pk=notebook_id)
        except Notebook.DoesNotExist:
            raise serializers.ValidationError("Notebook not found.")

        try:
            label = Label.objects.get(pk=value)
        except Label.DoesNotExist:
            raise serializers.ValidationError("Label not found.")

        if label.workspace_id != notebook.workspace_id:
            raise serializers.ValidationError("Label must belong to the same workspace as the notebook.")
        
        return value
