from rest_framework import serializers
from django.utils.timesince import timesince
from apps.accounts.serializers import UserSerializer
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)
    action_display = serializers.SerializerMethodField()
    relative_time = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id', 'actor', 'action_type', 'action_display',
            'target_type', 'target_id', 'target_title',
            'metadata', 'created_at', 'relative_time'
        ]

    def get_action_display(self, obj):
        actor_name = obj.actor.email if obj.actor else 'Unknown User'
        if obj.actor and (obj.actor.first_name or obj.actor.last_name):
            actor_name = f"{obj.actor.first_name} {obj.actor.last_name}".strip()
            
        action_verb = obj.get_action_type_display().lower()
        # Handle specific grammar if needed, but for now simple concatenation
        # The choices are like 'Created workspace', so "Nitish created workspace" works.
        # But choices are 'Created workspace', so we might want to lower case it.
        
        # Adjusting verb based on choice text
        # If choice is "Created workspace", we want "Nitish created workspace 'Title'"
        
        return f"{actor_name} {action_verb} '{obj.target_title}'"

    def get_relative_time(self, obj):
        return timesince(obj.created_at)
