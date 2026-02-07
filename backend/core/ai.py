import os
import google.generativeai as genai
from decouple import config
import logging

logger = logging.getLogger(__name__)

def get_gemini_model():
    """Configures and returns the Gemini model."""
    try:
        api_key = config('GEMINI_API_KEY', default=os.environ.get('GEMINI_API_KEY'))
        if not api_key:
            logger.error("GEMINI_API_KEY not found in environment variables.")
            return None

        genai.configure(api_key=api_key)
        
        # Priority list of models to try
        preferred_models = [
            'models/gemini-2.5-flash-lite-preview-09-2025',
            'models/gemini-2.5-flash-preview-09-2025',
            'models/gemini-2.0-flash-lite-001',
            'models/gemini-flash-latest',
        ]
        
        available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
        
        model_name = None
        for p in preferred_models:
            if p in available_models:
                model_name = p
                break
        
        if not model_name:
            # Fallback to any flash model
            for m in available_models:
                if 'flash' in m.lower():
                    model_name = m
                    break
        
        if not model_name and available_models:
            model_name = available_models[0]
            
        if not model_name:
            logger.error("No suitable Gemini model found.")
            return None

        logger.info(f"Using Gemini model: {model_name}")
        return genai.GenerativeModel(model_name)
    except Exception as e:
        logger.error(f"Error configuring Gemini: {e}")
        return None

def generate_comment_response(user_comment: str, player_name: str, user_name: str) -> str:
    """
    Generates a humorous, ironic response to a user comment on a football player's profile.
    Tries multiple models if one fails (especially on Quota QuotaExceeded).
    """
    
    # Priority list of models to try
    models_to_try = [
        'models/gemini-2.5-flash-lite-preview-09-2025',
        'models/gemini-2.5-flash-preview-09-2025',
        'models/gemini-2.0-flash-lite-001',
        'models/gemini-2.0-flash',
        'models/gemini-flash-latest',
    ]

    api_key = config('GEMINI_API_KEY', default=os.environ.get('GEMINI_API_KEY'))
    if not api_key:
        logger.error("GEMINI_API_KEY not found.")
        return ""
    
    try:
        genai.configure(api_key=api_key)
    except Exception as e:
        logger.error(f"Failed to configure Gemini: {e}")
        return ""

    prompt = f"""
Jesteś administratorem strony o polskiej Ekstraklasie "Grill Ekstraklasa".
Masz styl: lekka ironia + piłkarski humor, ale bez przesady. Twoja odpowiedź ma poprawić UX, a nie eskalować konflikt.

Kontekst:
- Piłkarz: {player_name}
- Użytkownik: {user_name}
- Komentarz użytkownika: "{user_comment}"

Zasady:
1) Odpowiedź maksymalnie 2 zdania (zwięźle; najlepiej 1 zdanie).
2) Zero wulgaryzmów, zero wyzwisk, zero personalnych ataków. Nie powtarzaj wulgarnego cytatu z komentarza.
3) Jeśli komentarz jest pozytywny: odpowiedz pozytywnie i z humorem (może być lekka szpilka do Ekstraklasy jako ligi).
4) Jeśli komentarz jest negatywny: odpowiedz lekko szyderczo, ale kulturalnie; żart kieruj w stronę sytuacji/gry, nie w stronę użytkownika.
5) Jeśli komentarz jest neutralny: odpowiedz neutralnie z lekką ironią.
6) Odnieś się konkretnie do treści komentarza (bez ogólników).

Twoja odpowiedź (sam tekst, bez nagłówków):
""".strip()

    import datetime
    # Ensure logs directory exists
    os.makedirs('logs', exist_ok=True)
    log_file = "logs/gemini_responses.log"

    for model_name in models_to_try:
        print(f"DEBUG: Trying Gemini model: {model_name}")
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(
                prompt,
                generation_config={
                    # Keep it short and punchy.
                    "max_output_tokens": 90,
                    "temperature": 0.7,
                },
            )
            text = response.text.strip()
            
            print(f"DEBUG: Success with {model_name}. Response: {text}")
            
            # Helper to log to file
            with open(log_file, "a", encoding="utf-8") as f:
                timestamp = datetime.datetime.now().isoformat()
                f.write(f"[{timestamp}] MODEL: {model_name}\nPROMPT: {user_comment}\nRESPONSE: {text}\n{'-'*20}\n")

            # Clean up response
            if text.startswith("Komentarz AI:") or text.startswith("AI:"): 
                text = text.split(":", 1)[1].strip()
            return text

        except Exception as e:
            err_msg = str(e)
            print(f"DEBUG: Failed with {model_name}: {err_msg}")
            # Only continue loop if it is likely a temporary/quota error, but here we assume any error -> try next
            with open(log_file, "a", encoding="utf-8") as f:
                timestamp = datetime.datetime.now().isoformat()
                f.write(f"[{timestamp}] MODEL: {model_name} FAILED\nERROR: {err_msg}\n{'-'*20}\n")
            continue
    
    print("DEBUG: All models failed.")
    return ""
