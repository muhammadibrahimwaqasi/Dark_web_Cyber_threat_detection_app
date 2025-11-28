from django.contrib import admin
from .models import PredictionLog

@admin.register(PredictionLog)
class PredictionLogAdmin(admin.ModelAdmin):
    list_display = ("text_input", "prediction", "created_at")
    search_fields = ("text_input", "prediction")
