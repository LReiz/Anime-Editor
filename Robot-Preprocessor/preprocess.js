const fs = require("fs")
const util = require("util");
const { Console } = require("console");
const exec = util.promisify(require("child_process").exec);

const ANIME_MAIN_DIR = "animes-to-edit/";
const TEMP_FRAMES_DIR = "temp/frames-to-analyze/";
const TEMP_AUDIOS_DIR = "temp/audios-to-analyze/";
const TEMP_VIDEOS_DIR = "temp/videos-to-analyze/";

async function createTemporaryFolders() {
    try {
        fs.mkdirSync(`${TEMP_FRAMES_DIR}`);
    } catch(error) {
        console.log("Temporary folders not created: " + error);
    }

    try {
        fs.mkdirSync(`${TEMP_AUDIOS_DIR}`);
    } catch(error) {
        console.log("Temporary folders not created: " + error);
    }

    try {
        fs.mkdirSync(`${TEMP_VIDEOS_DIR}`);
    } catch(error) {
        console.log("Temporary folders not created: " + error);
    }
}

async function extractAudiosFromVideos() {
    let animesToEdit = fs.readdirSync(`${ANIME_MAIN_DIR}`);
    let audiosToAnalyze = fs.readdirSync(`${TEMP_AUDIOS_DIR}`);
    let audioAlreadyExists = false;

    for(let i = 0; i < animesToEdit.length; i++) {
        let videoString = animesToEdit[i];
        let audioString = animesToEdit[i].split(".")[0];
        
        // Verify if file was already extracted
        for(let file = 0; file < audiosToAnalyze.length; file++) {
            if(audiosToAnalyze[file] == (audioString + ".mp3")) {
                audioAlreadyExists = true;
            }
        }

        if(!audioAlreadyExists) {
            console.log(`Extracting audio from ${videoString}`)
            await exec(`ffmpeg -i ${ANIME_MAIN_DIR}"${videoString}" -vn -ab 128 ${TEMP_AUDIOS_DIR}"${audioString}".mp3`);
        }
        console.log(`Audio extracted from ${videoString} successfully`)
    }
}

async function convertVideosToMp4() {
    let videosToEdit = fs.readdirSync(`${ANIME_MAIN_DIR}`);

    for(let i = 0; i < videosToEdit.length; i++) {
        videoString = videosToEdit[i];
        videoStringMp4 = videoString.split(".")[0];
        videoOriginalFormat = videoString.split(".")[1];

        // Verify if file is already on mp4 format, so we don't have to convert it anymore
        if(videoOriginalFormat != "mp4") {
            console.log(`Converting ${videoString} to Mp4`);
            await exec(`ffmpeg -i ${ANIME_MAIN_DIR}"${videoString}" ${TEMP_VIDEOS_DIR}"${videoStringMp4}".mp4`);
            console.log(`Video ${videoString} converted to mp4 successfully`);
        } else {
            console.log(`Coping ${videoString} to temp directory`);
            fs.copyFileSync(`${ANIME_MAIN_DIR}${videoString}`, `${TEMP_VIDEOS_DIR}${videoString}`);
            console.log(`Copy of ${videoString} finished successfully`);
        }

    }
}

async function reduceVideoFPS() {
    let videosToReduceFPS = fs.readdirSync(`${TEMP_VIDEOS_DIR}`);

    for(let i = 0; i < videosToReduceFPS.length; i++) {
        let videoString = videosToReduceFPS[i];

        if(videoString.slice(0, 5) != "fps1") {
            await exec(`ffmpeg -i ${TEMP_VIDEOS_DIR}${videoString} -filter:v fps=fps=1 "${TEMP_VIDEOS_DIR}fps1${videoString}"`);
        }
    }
}

async function separateVideoFrames() {
    let videosToSeparateFrames = fs.readdirSync(`${TEMP_VIDEOS_DIR}`);

    for(let i = 0; i < videosToSeparateFrames.length; i++) {
        let videoString = videosToSeparateFrames[i];

        if(videoString.slice(0, 4) == "fps1") {
            await exec(`ffmpeg -i ${TEMP_VIDEOS_DIR}${videoString} ${TEMP_FRAMES_DIR}%d.png`);
        }

    }
}

async function main() {

    await createTemporaryFolders();
    await extractAudiosFromVideos();
    await convertVideosToMp4();
    await reduceVideoFPS();
    await separateVideoFrames();
}

main();