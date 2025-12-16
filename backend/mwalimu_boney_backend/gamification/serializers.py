
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    UserProfileXP, 
    Badge, 
    UserBadge, 
    XPAction
)

User = get_user_model()

# =========================================================================
# 1. PROFILE & XP TRACKING
# =========================================================================

class UserProfileXPSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying a user's current XP, Level, and Rank.
    Used for the Student Dashboard or profile view.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    
    # Optional: You might dynamically calculate the XP needed for the next level
    xp_to_next_level = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfileXP
        fields = [
            'id', 'user', 'username', 'level', 'current_xp', 
            'xp_to_next_level', 'last_level_up_date', 'current_rank'
        ]
        read_only_fields = ['user', 'current_xp', 'level']

    def get_xp_to_next_level(self, obj):
        """
        Calculates the XP required to reach the next level based on the leveling curve.
        NOTE: This requires access to the leveling configuration (e.g., a static config or another model).
        """
        # Placeholder logic: Assumes a static service or function provides the needed XP
        # Example: NextLevelXP = LevelingConfig.get_required_xp(obj.level + 1)
        # return NextLevelXP - obj.current_xp
        
        # Simple placeholder return value for demonstration
        return 1000 - (obj.current_xp % 1000) 


# =========================================================================
# 2. BADGE SERIALIZERS
# =========================================================================

class BadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying badge metadata (title, description, icon).
    """
    class Meta:
        model = Badge
        fields = [
            'id', 'name', 'description', 'icon_url', 'required_action_key', 
            'required_count', 'is_active'
        ]

class UserBadgeSerializer(serializers.ModelSerializer):
    """
    Serializer for listing badges earned by a specific user.
    Includes the badge details and the date it was earned.
    """
    badge_detail = BadgeSerializer(source='badge', read_only=True)
    
    class Meta:
        model = UserBadge
        fields = ['id', 'user', 'badge', 'badge_detail', 'awarded_at']
        read_only_fields = ['user', 'badge', 'awarded_at']

# =========================================================================
# 3. CONFIGURATION SERIALIZERS (Admin Only)
# =========================================================================

class XPActionSerializer(serializers.ModelSerializer):
    """
    Serializer for managing the configuration of XP awarded for specific actions.
    (Admin-only view).
    """
    class Meta:
        model = XPAction
        fields = [
            'id', 'action_key', 'description', 'xp_value', 
            'level_required', 'is_repeatable'
        ]
        
    def validate_action_key(self, value):
        """Ensure the action key uses a consistent format (e.g., uppercase underscore)."""
        if not value.isupper() or ' ' in value:
            raise serializers.ValidationError("Action key must be uppercase with underscores (e.g., 'QUIZ_PASS').")
        return value
    

class LeaderboardSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying user rankings on the leaderboard.
    Exposes username, school, xp, and level.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = UserProfileXP
        fields = [
            'id', 'user', 'username', 'school', 'school_name', 
            'level', 'current_xp', 'current_rank'
        ]
        read_only_fields = ['user', 'school', 'level', 'current_xp', 'current_rank']

