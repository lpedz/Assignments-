from django.urls import path
from . import views

urlpatterns = [
    path('add/', views.add_numbers, name='add_numbers'),
    path('register/', views.register_user, name='register_user'),
    path('subtract/', views.subtract_numbers, name='subtract_numbers'),
    path('multiply/', views.multiply_numbers, name='multiply_numbers'),
    path('divide/', views.divide_numbers, name='divide_numbers'),
]
