const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require('fs');

FINAL_VIDEO_PATH = "temp/final-video/";
FINAL_AUDIO_PATH = "temp/final-audio/";
FINAL_ANIME_PATH = "animes-edited/";

async function makeEditedAnimesFolder() {
    try {
        fs.mkdirSync(`${FINAL_ANIME_PATH}`);
    } catch (error) {
        console.log("Temporary folder not created: " + error);
    }
}

async function joinAudioAndVideo() {
    finalAudiosArray = fs.readdirSync(FINAL_AUDIO_PATH)
    finalVideosArray = fs.readdirSync(FINAL_VIDEO_PATH)
    finalAudioPath = `${FINAL_AUDIO_PATH}${finalAudiosArray[0]}`
    finalVideoPath = `${FINAL_VIDEO_PATH}${finalVideosArray[0]}`

    exec(`ffmpeg -i ${finalVideoPath} -i ${finalAudioPath} -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 ${FINAL_ANIME_PATH}AnimeBom.mp4`);
}

async function main() {
    await makeEditedAnimesFolder();
    await joinAudioAndVideo();
}

main();