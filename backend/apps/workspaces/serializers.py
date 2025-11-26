from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Workspace, WorkspaceMember
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceMember
        fields = ['id', 'user', 'role', 'joined_at']

class WorkspaceListSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField()
    member_count = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'slug', 'owner', 'member_count', 'my_role']

    def get_member_count(self, obj):
        return obj.members.count()

    def get_my_role(self, obj):
        if hasattr(obj, 'my_membership') and obj.my_membership:
            return obj.my_membership[0].role
            
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                member = obj.members.get(user=request.user)
                return member.role
            except WorkspaceMember.DoesNotExist:
                return None
        return None

class WorkspaceDetailSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = WorkspaceMemberSerializer(many=True, read_only=True)
    notebook_count = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ['id', 'name', 'slug', 'description', 'owner', 'created_at', 'updated_at', 'members', 'notebook_count']

    def get_notebook_count(self, obj):
        return obj.notebooks.filter(is_deleted=False).count()

class WorkspaceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ['name', 'description']

    def create(self, validated_data):
        user = self.context['request'].user
        workspace = Workspace.objects.create(owner=user, **validated_data)
        return workspace

class AddMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=WorkspaceMember.ROLE_CHOICES)

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value
