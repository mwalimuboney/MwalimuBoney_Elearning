# users/permissions.py
from rest_framework import permissions
from .models import UserProfile # Import the UserProfile model

class IsTeacherOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Teachers and Administrators access.
    """
    def has_permission(self, request, view):
        # 1. Check if the user is authenticated
        if not request.user.is_authenticated:
            return False

        # 2. Check the user's role from their profile
        try:
            profile = request.user.profile
            return profile.role in ['TEACHER', 'ADMINISTRATOR']
        except UserProfile.DoesNotExist:
            # Should not happen if profile creation is handled correctly
            return False

class IsOwnerOrAdminOrTeacher(permissions.BasePermission):
    """
    Custom permission to allow the owner of an object, or any Teacher/Admin 
    to view/edit it. Used for deleting/altering resources.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        # Safe access to profile
        is_teacher_or_admin = False
        if user.is_authenticated:
            try:
                profile = user.profile
                is_teacher_or_admin = profile.role in ['TEACHER', 'ADMINISTRATOR']
            except UserProfile.DoesNotExist:
                pass

        # Read permissions are allowed to any request (e.g., viewing a resource)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions (PUT, POST, DELETE) are only allowed to the owner, teacher, or admin.
        # 1. Check if the user is the owner
        if hasattr(obj, 'uploader') and obj.uploader == user:
            return True
        
        # 2. Check if the user is a Teacher or Admin
        if is_teacher_or_admin:
            return True
            
        return False