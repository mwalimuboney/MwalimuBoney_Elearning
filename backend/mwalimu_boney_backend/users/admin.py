# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile

# Define an inline admin descriptor for UserProfile model
# which acts a bit like a "stacked" style
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    fk_name = 'user'
    can_delete = False
    verbose_name_plural = 'profile'

# Extend the default UserAdmin
class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)
    
    # Add 'role' to the list display in the main user list
    list_display = BaseUserAdmin.list_display + ('get_role',)

    def get_role(self, obj):
        # Safely get the role from the profile
        return obj.profile.role if hasattr(obj, 'profile') else 'N/A'
    get_role.short_description = 'Role'


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(UserProfile) # Optionally register profile separately if needed