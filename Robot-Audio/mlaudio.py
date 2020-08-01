from sklearn.model_selection import train_test_split
import tensorflow.keras as keras
import numpy as np
import json


def load_data(json_audio_path):
    with open(json_audio_path, "r") as filePath:
        data = json.load(filePath)

    inputs = np.array(data["mfccs"])
    targets = np.array(data["labels"])
    classes = np.array(data["classes"])

    return inputs, targets, classes

def train_model(json_audio_path):
    # load data
    inputs, targets, classes = load_data(json_audio_path)

    input_layer_size = inputs.shape[1] * inputs.shape[2]
    output_layer_size = classes.shape[0]
    hidden_layer_1_size = int((input_layer_size + output_layer_size)/2)
    hidden_layer_2_size = int((hidden_layer_1_size)/2)
    hidden_layer_3_size = int((hidden_layer_2_size)/4)

    # split the data into train and test
    inputs_train, inputs_test, targets_train, targets_test = train_test_split(inputs, targets, test_size=0.3)

    # build the network architecture
    model = keras.Sequential([
        # input layer
        keras.layers.Flatten(input_shape=(inputs.shape[1], inputs.shape[2])),

        # 1st hidden layer
        keras.layers.Dense(hidden_layer_1_size, activation="relu", kernel_regularizer=keras.regularizers.l2(0.001)),
        keras.layers.Dropout(0.3),

        # 2nd hidden layer
        keras.layers.Dense(hidden_layer_2_size, activation="relu", kernel_regularizer=keras.regularizers.l2(0.001)),
        keras.layers.Dropout(0.3),
        
        # 3rd hidden layer
        keras.layers.Dense(hidden_layer_3_size, activation="relu", kernel_regularizer=keras.regularizers.l2(0.001)),
        keras.layers.Dropout(0.3),

        # output layer
        keras.layers.Dense(output_layer_size, activation="softmax")

    ])

    
    # compiler network
    optimizer = keras.optimizers.Adam(learning_rate=0.0001)
    model.compile(optimizer=optimizer,
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])

    model.summary()

    # train network
    model.fit(inputs_train, targets_train,
              validation_data=(inputs_test, targets_test),
              epochs=100,
              batch_size=32)
