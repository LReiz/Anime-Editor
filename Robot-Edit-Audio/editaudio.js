const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require('fs');

const JSON_AUDIO_CUTS = require("../Robot-Audio/json-docs/audio-final-cuts.json");
const ANIME_AUDIO_PATH = "temp/audios-to-analyze/";
const TEMP_AUDIOS_CUTS_PATH = "temp/audio-cuts/";
const FINAL_AUDIO_PATH = "temp/final-audio/";
const MEMES_AUDIO_DURATION = 90;        // in seconds

async function createTempFolders() {
    // cuts folder
    try {
        fs.mkdirSync(`${TEMP_AUDIOS_CUTS_PATH}`);
    } catch (error) {
        console.log("Temporary folder not created: " + error);
    }

    // final audio folder
    try {
        fs.mkdirSync(`${FINAL_AUDIO_PATH}`);
    } catch (error) {
        console.log("Temporary folder not created: " + error);
    }
}

async function cutAudio() {
    const { cut_strings } = JSON_AUDIO_CUTS;
    const { cut_labels } = JSON_AUDIO_CUTS;

    audioToCut = fs.readdirSync(ANIME_AUDIO_PATH)

    for(i = 0; i < cut_strings.length; i++) {
        if(cut_labels[i] == "None") {
            await exec(`ffmpeg -i ${ANIME_AUDIO_PATH}${audioToCut[0]} -ss ${cut_strings[i]} ${TEMP_AUDIOS_CUTS_PATH}cut${i}.mp3`);
        }
    }
}

async function substituteAudio() {
    const { cut_strings } = JSON_AUDIO_CUTS;
    const { cut_labels } = JSON_AUDIO_CUTS;

    audioCuts = fs.readdirSync(TEMP_AUDIOS_CUTS_PATH);

    for(i = 0; i < cut_strings.length; i++) {
        if(cut_labels[i] != "None") {
            cutDuration = getCutDuration(cut_strings[i]);
            // take meme audio, cut it and copy it to cuts directory (TEMP_AUDIOS_CUTS_PATH)
            memeAudioTracks = fs.readdirSync(`meme-audios/${cut_labels[i]}/`);
            memeAudioPath = `meme-audios/${cut_labels[i]}/${memeAudioTracks[0]}`;
        
            memeCutStartSecond = Math.floor(Math.random() * (MEMES_AUDIO_DURATION - cutDuration));
            await exec(`ffmpeg -i ${memeAudioPath} -ss ${memeCutStartSecond} -t ${cutDuration} ${TEMP_AUDIOS_CUTS_PATH}cut${i}.mp3`);
        }
    }
}

function getCutDuration(cutString) {
    sliced_string = cutString.split(" ")
    duration = sliced_string[sliced_string.length -1]
    return duration
}

async function joinAudioCuts() {
    audiosToConcat = "concat:"
    audioCuts = fs.readdirSync(TEMP_AUDIOS_CUTS_PATH);

    for(i = 0; i < audioCuts.length; i++) {
        audiosToConcat += `${TEMP_AUDIOS_CUTS_PATH}${audioCuts[i]}|`
    }

    console.log(audiosToConcat)
    exec(`ffmpeg -i "${audiosToConcat}" ${FINAL_AUDIO_PATH}finalaudio.mp3`);
}

async function main() {
    await createTempFolders();
    await cutAudio();
    await substituteAudio();
    await joinAudioCuts();
}

main();
// fs.unlinkSync(`${TEMP_AUDIOS_CUTS_PATH}cut0.mp3`)