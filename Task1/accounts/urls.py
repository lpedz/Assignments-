from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('refresh/', views.refresh_token_view, name='token-refresh'),
    path('profile/', views.profile_view, name='profile'),
]
