const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require('fs');

const JSON_AUDIO_CUTS_PATH = "../Robot-Audio/json-docs/audio-final-cuts.json";
const ANIME_AUDIO_PATH = "temp/audios-to-analyze/";
const TEMP_AUDIOS_CUTS_PATH = "temp/audio-cuts/";
const FINAL_AUDIO_PATH = "temp/final-audio/";
const MEMES_AUDIO_DURATION = 90;        // in seconds

async function createTempFolders() {
    console.log("Creating more temporary folders........");
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
    json_audio_cuts = require(JSON_AUDIO_CUTS_PATH);
    const { cut_strings } = json_audio_cuts;
    const { cut_labels } = json_audio_cuts;

    audioToCut = fs.readdirSync(ANIME_AUDIO_PATH)

    for(i = 0; i < cut_strings.length; i++) {
        if(cut_labels[i] == "None") {
            console.log("Cutting anime audio...");
            let cutID = ("0000" + i).slice(-5)
            await exec(`ffmpeg -i ${ANIME_AUDIO_PATH}${audioToCut[0]} -ss ${cut_strings[i]} ${TEMP_AUDIOS_CUTS_PATH}cut${cutID}.mp3`);
        }
    }
}

async function substituteAudio() {
    json_audio_cuts = require(JSON_AUDIO_CUTS_PATH);
    const { cut_strings } = json_audio_cuts;
    const { cut_labels } = json_audio_cuts;

    audioCuts = fs.readdirSync(TEMP_AUDIOS_CUTS_PATH);

    for(i = 0; i < cut_strings.length; i++) {
        if(cut_labels[i] != "None") {
            cutDuration = getCutDuration(cut_strings[i]);
            // take meme audio, cut it and copy it to cuts directory (TEMP_AUDIOS_CUTS_PATH)
            memeAudioTracks = fs.readdirSync(`meme-audios/${cut_labels[i]}/`);
            memeAudioPath = `meme-audios/${cut_labels[i]}/${memeAudioTracks[0]}`;
        
            memeCutStartSecond = Math.floor(Math.random() * (MEMES_AUDIO_DURATION - cutDuration));

            console.log("Substituting audio cuts...");
            let cutID = ("0000" + i).slice(-5)
            await exec(`ffmpeg -i ${memeAudioPath} -ss ${memeCutStartSecond} -t ${cutDuration} ${TEMP_AUDIOS_CUTS_PATH}cut${cutID}.mp3`);
        }
    }
}

function getCutDuration(cutString) {
    sliced_string = cutString.split(" ")
    duration = sliced_string[sliced_string.length -1]
    return duration
}



async function main() {
    console.log("Robot: Edit Audio");

    await createTempFolders();
    await cutAudio();
    await substituteAudio();

}


module.exports = main