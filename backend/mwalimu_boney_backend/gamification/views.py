# gamification/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from users.models import UserProfile 
from .serializers import LeaderboardSerializer
from .models import GamificationSettings
from .serializers import GamificationSettingsSerializer


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = LeaderboardSerializer # Serializer exposes username, school, xp, level

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated or not user.profile.school_id:
            return UserProfile.objects.none()
            
        school = user.profile.school
        
        # 1. Filter by School (Scope)
        # 2. Annotate with total badges earned (optional)
        # 3. Order by XP (the main ranking metric)
        return UserProfile.objects.filter(school=school, role='STUDENT') \
                .order_by('-xp')


class GamificationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage gamification settings per school.
    Only accessible by school administrators.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GamificationSettingsSerializer

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated or user.profile.role != 'ADMINISTRATOR' or not user.profile.school_id:
            return GamificationSettings.objects.none()
            
        school = user.profile.school
        
        return GamificationSettings.objects.filter(school=school)   
    
    def perform_create(self, serializer):
        user = self.request.user
        school = user.profile.school
        serializer.save(school=school)
    def perform_update(self, serializer):
        user = self.request.user
        school = user.profile.school
        serializer.save(school=school)
    def perform_destroy(self, instance):
        instance.delete()


class GamificationAdminViewSet(viewsets.ModelViewSet):
    """
    Admin-level ViewSet to manage all gamification settings across schools.
    Only accessible by superusers.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GamificationSettingsSerializer
    queryset = GamificationSettings.objects.all()

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated or not user.is_superuser:
            return GamificationSettings.objects.none()
            
        return GamificationSettings.objects.all()
    

