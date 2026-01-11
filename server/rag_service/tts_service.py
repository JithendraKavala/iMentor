# server/rag_service/tts_service.py
import torch
from TTS.api import TTS
import logging
from pydub import AudioSegment
import io
import os

import config # Ensure config is imported

logger = logging.getLogger(__name__)

# --- Model Configuration ---
# Using the dedicated Indian English model.
MODEL_NAME = "tts_models/en/ljspeech/vits--neon"

_tts_instance = None

def get_tts_model():
    """
    Lazy loads the Coqui TTS model.
    """
    global _tts_instance
    if not config.ENABLE_TTS:
        logger.debug("TTS is disabled via ENABLE_TTS=false.")
        return None

    if _tts_instance is None:
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Initializing Coqui TTS with Indian English model '{MODEL_NAME}' on device: {device}")
            _tts_instance = TTS(MODEL_NAME).to(device)
            logger.info("Coqui TTS Indian English model loaded successfully.")
        except Exception as e:
            logger.critical(f"FATAL: Could not initialize Coqui TTS model. Error: {e}", exc_info=True)
            _tts_instance = None # Ensure it stays None on failure
            raise e
            
    return _tts_instance

def synthesize_speech(text: str, speaker: str) -> AudioSegment:
    """
    Synthesizes speech and applies pitch shifting to create three distinct voices.
    """
    tts = get_tts_model()
    if tts is None:
        if not config.ENABLE_TTS:
             raise RuntimeError("TTS is disabled in configuration.")
        else:
             raise RuntimeError("TTS service failed to initialize.")
    
    try:
        wav_buffer = io.BytesIO()
        
        tts.tts_to_file(
            text=text,
            speaker=None,
            file_path=wav_buffer,
            speed=1.1
        )
        wav_buffer.seek(0)
        
        audio_segment = AudioSegment.from_file(wav_buffer, format="wav")

        # --- REFINED Pitch Shifting for Three Distinct Voices ---
        # A semitone is a musical interval. We shift by fractions of a semitone for subtle changes.
        # The formula for semitone shift is 2**(semitones/12).
        
        if speaker.upper() == 'A':
            # Speaker A (Learner): Higher pitch to simulate a female voice.
            # Shift up by +2 semitones.
            semitones = 2.0
            new_sample_rate = int(audio_segment.frame_rate * (2.0 ** (semitones / 12.0)))
            
        elif speaker.upper() == 'B':
            # Speaker B (Expert): Lower pitch for a deep, authoritative male voice.
            # Shift down by -2 semitones.
            semitones = -2.0
            new_sample_rate = int(audio_segment.frame_rate * (2.0 ** (semitones / 12.0)))

        else: # Speaker C (Host)
            # Speaker C (Host): Slightly lower pitch for a standard, neutral male voice, distinct from the expert.
            # Shift down by -0.5 semitones.
            semitones = -0.5
            new_sample_rate = int(audio_segment.frame_rate * (2.0 ** (semitones / 12.0)))
        
        pitched_segment = audio_segment._spawn(audio_segment.raw_data, overrides={'frame_rate': new_sample_rate})
        return pitched_segment.set_frame_rate(audio_segment.frame_rate)

    except Exception as e:
        logger.error(f"Error during TTS synthesis for speaker {speaker}: {e}", exc_info=True)
        raise IOError(f"Failed to synthesize audio for speaker {speaker}.")