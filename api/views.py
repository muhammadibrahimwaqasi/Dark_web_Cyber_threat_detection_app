# api/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import os
from django.db.models import Count
from .models import PredictionLog  # 🧠 Log model

# 🔹 Load environment variables for Gemini API
from dotenv import load_dotenv  # type: ignore
import google.generativeai as genai  # type: ignore

# Load environment variables
load_dotenv()

# Initialize Gemini client
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)
    GEMINI_CONNECTED = True
else:
    GEMINI_CONNECTED = False

# 🔹 Load ML model and vectorizer once
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'cyber_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'vectorizer.pkl')

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    MODEL_STATUS = True
except Exception as e:
    print(f"⚠️ Model load error: {e}")
    model, vectorizer = None, None
    MODEL_STATUS = False


# ✅ API HEALTH STATUS
@api_view(['GET'])
def api_status(request):
    """Check API, ML model & Gemini connectivity"""
    return Response({
        "status": "ok",
        "model_loaded": MODEL_STATUS,
        "gemini_connected": GEMINI_CONNECTED
    })


# ✅ ROOT MESSAGE
@api_view(['GET'])
def api_root(request):
    return Response({"message": "Darkweb Threat API Running"})


# ✅ THREAT PREDICTION
@api_view(['POST'])
def predict_threat(request):
    """Predict threat using local ML model"""
    text = request.data.get("input", "")
    if not text:
        return Response({"error": "No input text provided"}, status=400)

    if not MODEL_STATUS:
        return Response({"error": "Model not loaded"}, status=500)

    # Predict
    X = vectorizer.transform([text])
    pred = model.predict(X)[0]
    label = "threat" if pred == 1 else "non-threat"

    # Save prediction to DB
    PredictionLog.objects.create(
        text_input=text,
        prediction=label
    )

    return Response({"input": text, "prediction": label})


# ✅ GEMINI ANALYSIS
@api_view(['POST'])
def analyze_with_ai(request):
    """Analyze and explain using Gemini AI"""
    if not GEMINI_CONNECTED:
        return Response({"error": "Gemini API not configured"}, status=500)

    text = request.data.get("input", "")
    if not text:
        return Response({"error": "No input text provided"}, status=400)

    try:
        # Get available models
        available_model_names = []
        try:
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    model_name = m.name.replace('models/', '') if m.name.startswith('models/') else m.name
                    available_model_names.append(model_name)
        except Exception:
            available_model_names = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-pro-latest"]

        preferred_models = [
            "gemini-flash-latest",
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-pro-latest",
            "gemini-2.0-flash"
        ]

        model_names_to_try = [m for m in preferred_models if m in available_model_names] + \
                             [m for m in available_model_names if m not in preferred_models]

        if not model_names_to_try:
            model_names_to_try = preferred_models

        prompt = f"""
        You are a cybersecurity analyst.
        Analyze the following message and determine:
        - Is it related to a cyber threat? (yes/no)
        - Give a 2-line reason.

        Message: {text}
        """

        # Try each model
        response = None
        for model_name in model_names_to_try:
            try:
                model_ai = genai.GenerativeModel(model_name)
                response = model_ai.generate_content(prompt)
                break
            except Exception:
                continue

        if response is None:
            raise Exception("Gemini model call failed.")

        analysis = response.text.strip() if hasattr(response, "text") else str(response)

        # Log Gemini result
        PredictionLog.objects.create(
            text_input=text,
            prediction="gemini_analysis",
            llm_analysis=analysis
        )

        return Response({
            "input": text,
            "gemini_analysis": analysis
        })

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ✅ DASHBOARD STATS API
@api_view(['GET'])
def get_stats(request):
    """Return prediction summary for dashboard graphs"""
    total = PredictionLog.objects.count()
    counts = PredictionLog.objects.values('prediction').annotate(total=Count('prediction'))
    stats = {item['prediction']: item['total'] for item in counts}

    return Response({
        "total_predictions": total,
        "stats": stats
    })
