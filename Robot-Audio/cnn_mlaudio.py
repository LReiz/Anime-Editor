import numpy as np
import tensorflow.keras as keras
import json
import train_cnn_model as tcm
import preprocessaudio


def predict_segment_of_audio(model, input_segment):
    input_segment = input_segment[np.newaxis, ...]
    input_segment = input_segment[..., np.newaxis]
    prediction = model.predict(input_segment)

    predicted_index = np.argmax(prediction, axis=1)
    if prediction[0][predicted_index] >= 0.6:
        return predicted_index
    else:
        return -1

def load_trained_model():
    # load model from a json file
    json_model_file = open(tcm.SAVED_MODEL_PATH, "r")
    loaded_model_json = json_model_file.read()
    loaded_model = keras.models.model_from_json(loaded_model_json)
    
    json_model_file.close()

    # load weights into the model
    loaded_model.load_weights(tcm.SAVED_WEGHTS_PATH)
    print("Model loaded")

    return loaded_model


def use_model(model, json_audio_path, json_audio_to_analyze_path):
    _, _, classes = tcm.load_data(json_audio_path)

    with open(json_audio_to_analyze_path, "r") as json_data:
        audio_to_analyze = json.load(json_data)

    inputs = np.array(audio_to_analyze["mfccs"])
    labels = np.array(audio_to_analyze["labels"]).tolist()

    for segment_index in range(len(inputs)):
        class_index = predict_segment_of_audio(model, inputs[segment_index])
        if(class_index > -1):
            labels[segment_index] = classes[class_index][0]
            print(classes[class_index][0])
        else:
            labels[segment_index] = "None"
            print("None")

    data = {
        "mfccs": inputs.tolist(),
        "labels": labels
    }
    preprocessaudio.save_audio_data(json_audio_to_analyze_path, data)
    print("Anime Audio Classified")
