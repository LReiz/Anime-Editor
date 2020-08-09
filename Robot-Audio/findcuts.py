import json

JSON_AUDIO_TO_ANALYZE_PATH = "Robot-Audio/json-docs/processed-anime-audio-data.json"
JSON_AUDIO_FINAL_CUTS = "Robot-Audio/json-docs/audio-final-cuts.json"

# in priority order
LABELS_WEIGHTS = {
    "GritoBriga": 1,
    "GritoDesesperoComico": 1,
    "Choro": 2,
    "Briga": 2,
    "None": 1,

}

def load_classified_audio_data(json_classified_audio):
    with open(json_classified_audio, "r") as json_file:
        classified_audio = json.load(json_file)

    return classified_audio["labels"]

def group_audio_segments():
    audio_segments_labels = load_classified_audio_data(JSON_AUDIO_TO_ANALYZE_PATH)
    cleaned_audio_segments_labels = clean_labels_array(audio_segments_labels)
    grouped_audio_labels = find_groups_in_array(cleaned_audio_segments_labels)

    save_cuts(grouped_audio_labels)
    

def find_mistakes_in_array(array):
    check_array = [False]*len(array)

    for segment_index in range(len(array)):
        segment_label = array[segment_index]

        if segment_label == "None":
            check_array[segment_index] = True
        else:
            if segment_index + LABELS_WEIGHTS[segment_label] < len(array):
                segments_counter = 1
                segments_to_check = [segment_index]
                for off_set in range(1, LABELS_WEIGHTS[segment_label] + 1):
                    if array[segment_index + off_set] == segment_label:
                        segments_counter += 1
                        segments_to_check.append(segment_index + off_set)
                if segments_counter >= LABELS_WEIGHTS[segment_label]:
                    for index_to_check in segments_to_check:
                        check_array[index_to_check] = True

    return check_array

def substitute_mistakes_in_array(array, check_array):
    for segment_index in range(len(array)):
        if check_array[segment_index] == False:
            array[segment_index] = "None"

    return array

def clean_labels_array(array):
    check_array = find_mistakes_in_array(array)
    cleaned_array = substitute_mistakes_in_array(array, check_array)

    return cleaned_array

def find_groups_in_array(array):
    check_array = [False]*len(array)

    for label in LABELS_WEIGHTS.keys():
        for segment_index in range(len(array)):
            if label == "None":
                continue
            if array[segment_index] == label:
                check_array[segment_index] = True
                segments_to_substitute = []
                for off_set in range(1, LABELS_WEIGHTS[label]+1):
                    if array[segment_index + off_set] == array[segment_index]:
                        for index in segments_to_substitute:
                            array[index] = label
                            check_array[index] = True
                        break
                    if check_array[segment_index + off_set == True]:
                        break
                    segments_to_substitute.append(segment_index+off_set)
    return array

def save_cuts(array):
    cuts_data = {
        "cut_strings": [],
        "cut_labels": [],
    }

    array.append("None")
    last_end = 0
    for start in range(len(array)):
        if start < last_end:
            continue
        for end in range(start+1, len(array)):
            last_end = end
            if array[end] != array[start] or end == len(array)-1:
                duration = end - start
                cuts_data["cut_strings"].append("{} -t {}".format(start, duration))
                cuts_data["cut_labels"].append(array[start])
                break


    with open(JSON_AUDIO_FINAL_CUTS, "w") as json_path_data:
        json.dump(cuts_data, json_path_data, indent=3)
        
group_audio_segments()