# FILE: mwalimu_boney_backend/admin.py (Centralized Admin Configuration)

from django.contrib import admin

# --- Import ALL Models from ALL Apps ---

# EXAMS App Models
from exams.models import Exam, ExamRegistration, ExamAttempt, SecurityViolation

# COMMUNICATIONS App Models
from communications.models import Announcement, Conversation, Message

# PROGRESS App Models
from progress.models import CourseProgress, LessonCompletion, QuizAttempt, ProgressMetric

# GAMIFICATION App Models (import only actual models present)
try:
    from gamification.models import Badge, UserBadge, XPLog
except Exception:
    Badge = UserBadge = XPLog = None


# =========================================================================
# I. EXAMS APP ADMIN CONFIGURATION
# =========================================================================

class ExamRegistrationInline(admin.TabularInline):
    """Inline view to manage registrations directly on the Exam detail page."""
    model = ExamRegistration
    extra = 0
    fields = ('student', 'status', 'shortlist_reason')
    raw_id_fields = ('student',) # Use raw_id_fields for user lookups


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'school', 'start_time', 'end_time', 
        'is_active', 'requires_registration'
    )
    list_filter = ('school', 'is_active', 'requires_registration')
    search_fields = ('title', 'school__name')
    date_hierarchy = 'start_time'
    inlines = [ExamRegistrationInline]


@admin.register(ExamRegistration)
class ExamRegistrationAdmin(admin.ModelAdmin):
    list_display = (
        'exam', 'student', 'status', 'registered_at'
    )
    list_filter = ('exam__school', 'status')
    list_editable = ('status',)
    raw_id_fields = ('student', 'exam')


@admin.register(ExamAttempt)
class ExamAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'exam', 'status', 'score', 
        'total_violations', 'start_time'
    )
    list_filter = ('exam__school', 'status', 'is_passed')
    search_fields = ('student__username', 'exam__title')
    raw_id_fields = ('student', 'exam')


@admin.register(SecurityViolation)
class SecurityViolationAdmin(admin.ModelAdmin):
    list_display = (
        'attempt', 'violation_type', 'timestamp', 'is_reviewed'
    )
    list_filter = ('violation_type', 'is_reviewed')
    list_editable = ('is_reviewed',)


# =========================================================================
# II. COMMUNICATIONS APP ADMIN CONFIGURATION
# =========================================================================

class MessageInline(admin.TabularInline):
    """Inline view for messages within a conversation (read-only for review)."""
    model = Message
    extra = 0
    fields = ('sender', 'content', 'timestamp')
    readonly_fields = ('sender', 'content', 'timestamp')


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'sender', 'scope_type', 'target_school', 'is_urgent'
    )
    list_filter = ('scope_type', 'is_urgent')
    search_fields = ('title', 'content')
    raw_id_fields = ('sender', 'target_school', 'target_class', 'target_user')


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('subject', 'school', 'last_message_at')
    list_filter = ('school',)
    filter_horizontal = ('participants',) # Better UI for ManyToManyField
    inlines = [MessageInline]


# =========================================================================
# III. PROGRESS APP ADMIN CONFIGURATION
# =========================================================================

class LessonCompletionInline(admin.TabularInline):
    """Show completed lessons on the CourseProgress detail page."""
    model = LessonCompletion
    extra = 0
    fields = ('lesson', 'is_completed', 'completion_date')
    readonly_fields = ('completion_date',)
    raw_id_fields = ('lesson',)


@admin.register(CourseProgress)
class CourseProgressAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'course', 'status', 'completion_percentage', 'completion_date', 'certificate_awarded'
    )
    list_filter = ('status', 'certificate_awarded', 'course')
    list_editable = ('status', 'completion_percentage', 'certificate_awarded')
    inlines = [LessonCompletionInline]
    raw_id_fields = ('student', 'course')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = (
        'student', 'quiz', 'score', 'percentage_score', 'is_passed'
    )
    list_filter = ('quiz', 'is_passed')
    date_hierarchy = 'attempt_end_time'
    raw_id_fields = ('student', 'quiz')


@admin.register(ProgressMetric)
class ProgressMetricAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'metric_type', 'value', 'calculated_on')
    list_filter = ('metric_type',)
    raw_id_fields = ('student', 'course')


# =========================================================================
# IV. GAMIFICATION APP ADMIN CONFIGURATION
# =========================================================================

class UserBadgeInline(admin.TabularInline):
    """Shows badges earned by the user on the UserProfileXP detail page."""
    model = UserBadge
    extra = 0
    fields = ('badge', 'earned_at')
    readonly_fields = ('earned_at',)
    raw_id_fields = ('badge',)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'required_xp', 'image_url')

if UserBadge is not None:
    try:
        admin.site.register(UserBadge)
    except Exception:
        pass

if XPLog is not None:
    try:
        admin.site.register(XPLog)
    except Exception:
        pass