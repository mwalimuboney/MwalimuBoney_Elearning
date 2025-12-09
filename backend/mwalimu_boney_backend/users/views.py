from django.shortcuts import render
# users/views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, RegistrationSerializer
from .models import UserProfile
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User

# --- Public Endpoints ---
class UserRegistrationView(generics.CreateAPIView):
    """Allows new users to register. Default role is STUDENT."""
    serializer_class = RegistrationSerializer
    # This view is public (unauthenticated)

class PublicProfileDetail(generics.RetrieveAPIView):
    """View a user's public profile data."""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'user_id' # Allows lookup by the core User ID

# --- Authenticated Endpoints ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_follow(request, user_id):
    """Allows a logged-in user to follow or unfollow another user."""
    user_to_follow = get_object_or_404(User, id=user_id)
    
    # Get the profile of the logged-in user
    follower_profile = request.user.profile
    
    if follower_profile.follows.filter(id=user_to_follow.id).exists():
        # Already following, so unfollow
        follower_profile.follows.remove(user_to_follow)
        message = f"You unfollowed {user_to_follow.username}"
    else:
        # Not following, so follow
        follower_profile.follows.add(user_to_follow)
        message = f"You are now following {user_to_follow.username}"
        
    return Response({'status': message}, status=status.HTTP_200_OK)
