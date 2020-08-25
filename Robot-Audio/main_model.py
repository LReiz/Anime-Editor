import preprocessaudio
import mlaudio
import cnn_mlaudio
import train_cnn_model
import findcuts

JSON_AUDIO_PATH = "Robot-Audio/json-docs/processed-audio-data.json"
JSON_AUDIO_TO_ANALYZE_PATH = "Robot-Audio/json-docs/processed-anime-audio-data.json"

# set to False if you want to process/train
AUDIO_PROCESSED = True
MODEL_TRAINED = True


if __name__ == "__main__":
    # TRAIN MODEL ------------------------------------
    if not AUDIO_PROCESSED:
        preprocessaudio.preprocess_dataset_audio(JSON_AUDIO_PATH)

    if not MODEL_TRAINED:
        train_cnn_model.train_model(JSON_AUDIO_PATH)        # CNN model
        MODEL_TRAINED = True

    # USE MODEL --------------------------------------
    if MODEL_TRAINED:
        preprocessaudio.preprocess_audio_to_analyze(JSON_AUDIO_TO_ANALYZE_PATH)
        model = cnn_mlaudio.load_trained_model()
        cnn_mlaudio.use_model(model, JSON_AUDIO_PATH, JSON_AUDIO_TO_ANALYZE_PATH)
        findcuts.group_audio_segments()
