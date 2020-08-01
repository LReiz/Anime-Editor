from sklearn.model_selection import train_test_split
import numpy as np
import tensorflow.keras as keras
import json

SAVED_MODEL_PATH = "Robot-Audio/model/model.json"
SAVED_WEGHTS_PATH = "Robot-Audio/model/model_weights.h5"

def prepare_datasets(x, y, test_size, validation_size):

    # create train/test split
    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=test_size)

    # create train/validation split
    x_train, x_validation, y_train, y_validation = train_test_split(x_train, y_train, test_size=validation_size)

    # 3d array (tensorflow expects 3d arrays for CNN)
    x_train = x_train[..., np.newaxis]
    x_test = x_test[..., np.newaxis]
    x_validation = x_validation[..., np.newaxis]

    return x_train, x_validation, x_test, y_train, y_validation, y_test

def build_model(input_shape, number_of_classes):
    # CREATE MODEL
    model = keras.Sequential()

    # 1st convolutional layer
    model.add(keras.layers.Conv2D(32, (3, 3), activation="relu", input_shape=input_shape)) # number of kernels, grid size, activation funcion, input shape
    model.add(keras.layers.MaxPool2D((3, 3), strides=(2, 2), padding="same"))       # grid size, stride(vertical and horizontal), padding
    model.add(keras.layers.BatchNormalization())        # this will speed up training

    # 2nd convolutional layer
    model.add(keras.layers.Conv2D(32, (3, 3), activation="relu", input_shape=input_shape)) 
    model.add(keras.layers.MaxPool2D((3, 3), strides=(2, 2), padding="same"))
    model.add(keras.layers.BatchNormalization())

    # 3rd convolutional layer
    model.add(keras.layers.Conv2D(32, (2, 2), activation="relu", input_shape=input_shape)) 
    model.add(keras.layers.MaxPool2D((2, 2), strides=(2, 2), padding="same"))
    model.add(keras.layers.BatchNormalization())

    # flatten the output and feed it into dense layer
    model.add(keras.layers.Flatten())
    model.add(keras.layers.Dense(64, activation="relu", kernel_regularizer=keras.regularizers.l2(0.001)))    # number of neurons, activation funcion
    model.add(keras.layers.Dropout(0.3))    # dropout for avoiding overfitting

    # output layer
    model.add(keras.layers.Dense(number_of_classes, activation="softmax"))

    return model


def load_data(dataset_path):
    with open(dataset_path, "r") as filePath:
        data = json.load(filePath)

    inputs = np.array(data["mfccs"])
    targets = np.array(data["labels"])
    classes = np.array(data["classes"])

    return inputs, targets, classes


def train_model(json_audio_path):
    # load data
    inputs, targets, classes = load_data(json_audio_path)

    # create train, validation and test sets
    x_train, x_validation, x_test, y_train, y_validation, y_test = prepare_datasets(inputs, targets, 0.25, 0.2)

    # build the CNN net
    input_shape = (x_train.shape[1], x_train.shape[2], x_train.shape[3])
    model = build_model(input_shape, classes.shape[0])

    # compile the network
    optimizer = keras.optimizers.Adam(learning_rate=0.0001)
    model.compile(optimizer=optimizer,
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])

    #train the CNN
    model.fit(x_train, y_train, validation_data=(x_validation, y_validation), batch_size=32, epochs=100)

    # evavaluate the CNN on the test set
    test_error, test_accuracy = model.evaluate(x_test, y_test, verbose=1)
    print("Accuracy on test set: {}".format(test_accuracy))

    rights_array = [0]*len(classes)
    mistakes_array = [0]*len(classes)
    # make prediction on a sample
    for i in range(len(x_test)):
        x = x_test[i]
        y = y_test[i]

        predicted_index = predict_for_debugging(model, classes, x, y)

        if predicted_index == y:
            rights_array[y] += 1
        if predicted_index != y:
            mistakes_array[y] += 1
    
    print("Rights: {}".format(rights_array))
    print("Mistakes: {}".format(mistakes_array))

    save_model(model)

def save_model(model):
    model_json = model.to_json()

    with open(SAVED_MODEL_PATH, "w") as json_model_file:
        json_model_file.write(model_json)

    model.save_weights(SAVED_WEGHTS_PATH)
    print("Model saved")

def predict_for_debugging(model, classes, x, y):
    x = x[np.newaxis, ...]

    prediction = model.predict(x)

    # extract index with higher probability
    predicted_index = np.argmax(prediction, axis=1)
    if prediction[0][predicted_index] >= 0.6:
        print("Expected output: {}, Predicted output: {} --> array: {}".format(classes[y], classes[predicted_index], prediction))
        return predicted_index
    else:
        print("Expected output: {}, Predicted output: Normal Conversation --> array: {}".format(classes[y], prediction))
        return -1

