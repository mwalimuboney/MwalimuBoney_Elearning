# gamification/services.py

from django.db import transaction
from users.models import UserProfile
from .models import XPLog, Badge, UserBadge

class XPService:
    
    XP_POINTS = {
        'LESSON_COMPLETE': 50,
        'QUIZ_PASSED': 100,
        'COURSE_COMPLETE': 500,
        'DAILY_LOGIN': 5
    }

    @staticmethod
    def award_xp(user, action_key, context_id=None):
        """Awards XP, logs the transaction, and checks for level/badge milestones."""
        
        points = XPService.XP_POINTS.get(action_key, 0)
        if points == 0:
            return
            
        with transaction.atomic():
            profile = UserProfile.objects.select_for_update().get(user=user)
            
            # 1. Award Points and Log
            profile.xp += points
            profile.save(update_fields=['xp'])
            
            XPLog.objects.create(
                user=user,
                amount=points,
                reason=action_key,
                # Context ID (e.g., the Lesson ID or Course ID) could be stored here
            )
            
            # 2. Check for Badges/Level Up (Simplified Check)
            XPService._check_badges(user, profile)
            
        return points

    @staticmethod
    def _check_badges(user, profile):
        # Find badges the user hasn't earned yet, but now qualifies for
        qualifying_badges = Badge.objects.filter(
            required_xp__lte=profile.xp
        ).exclude(
            userbadge__user=user
        )

        for badge in qualifying_badges:
            UserBadge.objects.create(user=user, badge=badge)
            # You would trigger a real-time notification here (via Channels)
            print(f"!!! {user.username} earned new badge: {badge.name}")