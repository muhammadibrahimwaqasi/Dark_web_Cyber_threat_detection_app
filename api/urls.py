from django.urls import path
from . import views

urlpatterns = [
    path('', views.api_root, name='api_root'),
    path('status/', views.api_status, name='api_status'),
    path('predict/', views.predict_threat, name='predict_threat'),
    path('analyze/', views.analyze_with_ai, name='analyze_with_ai'),
    path('stats/', views.get_stats, name='get_stats'),
]
