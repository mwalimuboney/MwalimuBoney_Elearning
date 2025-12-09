# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # For Login
from .views import UserRegistrationView, PublicProfileDetail, toggle_follow

urlpatterns = [
    # AUTHENTICATION
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # Returns JWT Access/Refresh Token
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # PROFILES AND SOCIAL
    path('profiles/<int:user_id>/', PublicProfileDetail.as_view(), name='public_profile'),
    path('profiles/<int:user_id>/follow/', toggle_follow, name='toggle_follow'),
]