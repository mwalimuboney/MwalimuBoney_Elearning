"""
URL configuration for mwalimu_boney_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

# core/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from courses.views import RteImageUploadView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('courses.urls')), # Our main API entry point
    path('api/', include('users.urls')), # <-- New user/auth routes
    path('api/', include('chat.urls')), # <-- New chat moderation routes
    path('exams/', include('exams.urls')),
    path('api/', include('assessment.urls')),
    path('communications/', include('communications.urls')),
    path('progress/', include('progress.urls')),
    
    # Djoser handles: /auth/users/ (create), /auth/users/me/, etc.
    path('auth/', include('djoser.urls')),
    
    # Simple JWT endpoints for token management
    path('auth/jwt/create/', TokenObtainPairView.as_view(), name='jwt_create'), # Custom login URL
    path('auth/jwt/refresh/', TokenRefreshView.as_view(), name='jwt_refresh'), # Token refresh
    path('ai/', include('ai_features.urls')), # New AI/Extraction endpoints
    # RTE image upload uses a ViewSet; map the POST action to 'create'
    path('courses/upload-rte-image/', RteImageUploadView.as_view({'post': 'create'}), name='rte_image_upload'),
]