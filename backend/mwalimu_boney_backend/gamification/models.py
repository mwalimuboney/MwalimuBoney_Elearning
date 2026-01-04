from django.db import models
from django.contrib.auth.models import User
from school.models import School

class Badge(models.Model):
    """Defines a static achievement/badge."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    required_xp = models.IntegerField(default=0)
    image_url = models.URLField() # Link to the badge icon

class UserBadge(models.Model):
    """Tracks which badges a specific user has earned."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')

class XPLog(models.Model):
    """Logs every instance of XP awarded for auditing."""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.IntegerField()
    reason = models.CharField(max_length=255) # e.g., "Lesson Complete", "Quiz Passed"
    awarded_at = models.DateTimeField(auto_now_add=True)

class UserProfileXP(models.Model):
    """Tracks the total XP for each user."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile_xp')
    total_xp = models.IntegerField(default=0)

    def add_xp(self, amount, reason):
        """Add XP to the user and log the event."""
        self.total_xp += amount
        self.save()
        XPLog.objects.create(user=self.user, amount=amount, reason=reason)


class XPAction(models.Model):
    """Defines actions that can award XP."""
    name = models.CharField(max_length=100, unique=True) # e.g., "Complete Lesson"
    xp_amount = models.IntegerField()

    def __str__(self):
        return f"{self.name} (+{self.xp_amount} XP)"

