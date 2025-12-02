from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from .models import ShareLink
from apps.notebooks.models import Notebook
from apps.accounts.serializers import UserSerializer
from apps.notebooks.serializers import NotebookListSerializer

class ShareLinkSerializer(serializers.ModelSerializer):
    notebook = NotebookListSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = ShareLink
        fields = [
            'id', 'notebook', 'token', 'access_level', 'expires_at',
            'max_uses', 'use_count', 'is_active', 'created_by',
            'created_at', 'share_url'
        ]

    def get_share_url(self, obj):
        # TODO: Use settings for base URL
        return f"http://localhost:3000/shared/{obj.token}"

class CreateShareLinkSerializer(serializers.ModelSerializer):
    notebook = serializers.PrimaryKeyRelatedField(queryset=Notebook.objects.all())
    expires_in_days = serializers.IntegerField(required=False, min_value=1)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = ShareLink
        fields = ['notebook', 'access_level', 'expires_in_days', 'password', 'max_uses']

    def validate_notebook(self, value):
        user = self.context['request'].user
        # Check if user has edit permission on the notebook
        # Assuming creator or workspace member with edit rights
        # For now, checking if user is creator or has access via workspace
        # This logic might need to be more robust based on workspace permissions
        if value.created_by != user:
             # TODO: Check workspace permissions if not creator
             pass
        return value

    def create(self, validated_data):
        expires_in_days = validated_data.pop('expires_in_days', None)
        password = validated_data.pop('password', None)
        
        if expires_in_days:
            validated_data['expires_at'] = timezone.now() + timedelta(days=expires_in_days)
        
        if password:
            validated_data['password_hash'] = make_password(password)
            
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class UpdateShareLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShareLink
        fields = ['is_active', 'expires_at', 'max_uses']

class AccessSharedNotebookSerializer(serializers.Serializer):
    password = serializers.CharField(required=False, write_only=True)
