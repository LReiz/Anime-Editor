import librosa
import os
import json

AUDIO_DATASET_PATH = "train-audios"
VIDEOS_TO_ANALYZE_PATH = "animes-to-edit/"
SAMPLE_RATE = 22050
SECONDS_PER_SEGMENT = 1
NUMBER_OF_MFCCS = 30


def preprocess_dataset_audio(json_path, n_mfcc=NUMBER_OF_MFCCS, n_fft=2048, hop_length=512):
    data = {
        "classes": [],
        "mfccs": [],        # inputs
        "labels": []        # targets
    }

    for i, (dirpath, dirnames, filenames) in enumerate(os.walk(AUDIO_DATASET_PATH)):
        numSamplesPerSegment = int(SECONDS_PER_SEGMENT*SAMPLE_RATE)
        if dirpath is not AUDIO_DATASET_PATH:
            # create class based on actul directory name
            className = dirpath.split("\\")[-1]
            data["classes"].append(className)
            print("Processing {}".format(className))

            for file in filenames:
                filePath = os.path.join(dirpath, file)
                signal, sr = librosa.load(filePath, sr = SAMPLE_RATE)
                
                for segment in range(0, len(signal), numSamplesPerSegment):
                    startSample = segment
                    endSample = segment + numSamplesPerSegment

                    if(endSample < len(signal)):
                        mfcc = librosa.feature.mfcc(signal[startSample: endSample],
                                                    sr=sr, n_fft=n_fft,
                                                    n_mfcc=n_mfcc, hop_length=hop_length)

                        mfcc = mfcc.T
                        data["mfccs"].append(mfcc.tolist())
                        data["labels"].append(i-1)      # we excluding main dirpath (AUDIO_DATASET_PATH) from labels
                        print("{}, segment: {}".format(filePath, (int((segment)/numSamplesPerSegment)+1)))

    save_audio_data(json_path, data)


def preprocess_audio_to_analyze(json_path, n_mfcc=NUMBER_OF_MFCCS, n_fft=2048, hop_length=512):
    
    data = {
        "mfccs": [],
        "labels": []
    }
    
    for dirpath, dirnames, filenames in os.walk(VIDEOS_TO_ANALYZE_PATH):
        
        for file in filenames:
            video_file = dirpath + "/" + file

            signal, sr = librosa.load(video_file, sr = SAMPLE_RATE)
            numSamplesPerSegment = int(SECONDS_PER_SEGMENT*SAMPLE_RATE)
                        
            for segment in range(0, len(signal), numSamplesPerSegment):

                startSample = segment
                endSample = segment + numSamplesPerSegment

                if(endSample < len(signal)):
                    mfcc = librosa.feature.mfcc(signal[startSample: endSample],
                                                sr=sr, n_fft=n_fft,
                                                n_mfcc=n_mfcc, hop_length=hop_length)

                    mfcc = mfcc.T
                    data["mfccs"].append(mfcc.tolist())
                    data["labels"].append(-1)
                    print("{}, segment: {}".format(video_file, (int((segment)/numSamplesPerSegment)+1)))
                
    save_audio_data(json_path, data)

def save_audio_data(json_path, data):
    with open(json_path, "w") as json_data_path:
        json.dump(data, json_data_path, indent=4)
