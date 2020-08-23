const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require('fs');

const FINAL_AUDIO_PATH = "temp/final-audio/";
const FINAL_VIDEO_PATH = "temp/final-video/";
const FINAL_ANIME_PATH = "animes-edited/";
const FINAL_VIDEO_FRAMES = "temp/final-video-frames/";
const TEMP_AUDIOS_CUTS_PATH = "temp/audio-cuts/";

const ANIME_FINAL_NAME = "AnimeBom.mp4";

async function joinAudioCuts() {
    audiosToConcat = "concat:"
    audioCuts = fs.readdirSync(TEMP_AUDIOS_CUTS_PATH);

    for(i = 0; i < audioCuts.length; i++) {
        console.log(audioCuts[i])
        audiosToConcat += `${TEMP_AUDIOS_CUTS_PATH}${audioCuts[i]}|`
    }

    console.log("Joining cuts...");
    await exec(`ffmpeg -i "${audiosToConcat}" ${FINAL_AUDIO_PATH}finalaudio.mp3`);
    console.log("Audio final pronto!");
}

async function joinVideoFrames() {
    console.log("Juntando os frames em um vídeo...")
    await exec(`ffmpeg -r 30 -f image2 -s 1920x1080 -i ${FINAL_VIDEO_FRAMES}%d.png -pix_fmt yuv420p ${FINAL_VIDEO_PATH}no-audio-video.mp4`);
    console.log("Video final pronto!")
}

async function makeEditedAnimesFolder() {
    console.log("Creating more temporary folderssss.........!!!!")
    try {
        fs.mkdirSync(`${FINAL_ANIME_PATH}`);
    } catch (error) {
        console.log("Temporary folder not created: " + error);
    }
}

async function joinAudioAndVideo() {
    finalAudiosArray = fs.readdirSync(FINAL_AUDIO_PATH);
    finalVideosArray = fs.readdirSync(FINAL_VIDEO_PATH);
    finalAudioPath = `${FINAL_AUDIO_PATH}${finalAudiosArray[0]}`;
    finalVideoPath = `${FINAL_VIDEO_PATH}${finalVideosArray[0]}`;

    if(fs.existsSync(`${FINAL_ANIME_PATH}${ANIME_FINAL_NAME}`)) {
        fs.unlinkSync(`${FINAL_ANIME_PATH}${ANIME_FINAL_NAME}`);
    }

    console.log("Joining final video and audio...")
    await exec(`ffmpeg -i ${finalVideoPath} -i ${finalAudioPath} -c:v copy -c:a aac -strict experimental -map 0:v:0 -map 1:a:0 ${FINAL_ANIME_PATH}${ANIME_FINAL_NAME}`);
}

async function deleteTemporaryFolders() {
    await fs.rmdir(`./temp`, { recursive: true }, () => { console.log("Pasta temp removida!") });
}

async function main() {
    console.log("Robot: Showman");
    
    await joinAudioCuts();
    await joinVideoFrames();
    await makeEditedAnimesFolder();
    await joinAudioAndVideo();
    await deleteTemporaryFolders();
    console.log("Edição finalizada!!! Espero que seu anime não seja mais tão ruim. Tentei o meu melhor.")
}


module.exports = main