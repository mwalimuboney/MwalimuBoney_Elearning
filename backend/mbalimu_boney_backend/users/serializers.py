# users/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the public profile data."""
    # Read-only fields from the core User model
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    # Count of users following this profile
    follower_count = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        # Fields accessible to the public
        fields = ['username', 'first_name', 'last_name', 'role', 'title', 'bio', 'follower_count']
        read_only_fields = ['role', 'follower_count']

    def get_follower_count(self, obj):
        return obj.followers.count()


class RegistrationSerializer(serializers.ModelSerializer):
    """Serializer used for new user registration."""
    role = serializers.HiddenField(default='STUDENT')
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name', 'role')
        extra_kwargs = {'password': {'write_only': True}}
    
    # Override create to handle user and profile creation securely
    def create(self, validated_data):
        # Pop the password for secure hashing
        password = validated_data.pop('password')
        
        # Create the core User object
        user = User.objects.create_user(**validated_data, password=password)
        
        # Create the associated UserProfile with the default 'STUDENT' role
        UserProfile.objects.create(user=user, role='STUDENT')
        
        return user