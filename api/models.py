from django.db import models

# Create your models here.
from django.db import models

class PredictionLog(models.Model):
    text_input = models.TextField()
    prediction = models.CharField(max_length=50)
    llm_analysis = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.prediction} - {self.text_input[:30]}"
