from rest_framework import serializers
from apps.sync.models import NotebookConflict
from apps.notebooks.models import Notebook

class StartEditingSerializer(serializers.Serializer):
    notebook_id = serializers.IntegerField(read_only=True)
    session_token = serializers.UUIDField(read_only=True)
    base_version = serializers.IntegerField(read_only=True)
    base_content = serializers.CharField(read_only=True)
    current_version = serializers.IntegerField(read_only=True)

class ApplyPatchSerializer(serializers.Serializer):
    session_token = serializers.UUIDField()
    patch = serializers.CharField(max_length=1024*1024, allow_blank=True)  # 1MB max
    client_id = serializers.CharField(required=False)

class NotebookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notebook
        fields = ['id', 'title']

class ConflictSerializer(serializers.ModelSerializer):
    notebook = NotebookSerializer(read_only=True)
    
    class Meta:
        model = NotebookConflict
        fields = [
            'id', 'notebook', 'user', 
            'server_version', 'client_version', 
            'conflict_blocks', 'your_content', 
            'their_content', 'base_content', 
            'created_at'
        ]

class ResolveConflictSerializer(serializers.Serializer):
    resolution_strategy = serializers.ChoiceField(choices=NotebookConflict.RESOLUTION_CHOICES)
    final_content = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        if data['resolution_strategy'] == 'MANUAL' and 'final_content' not in data:
            raise serializers.ValidationError("final_content is required for MANUAL strategy")
        return data
