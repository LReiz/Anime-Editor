const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const Jimp = require("jimp");
const { bitmap } = require("jimp");

const JSON_FINAL_AUDIO_CUTS_PATH = "../Robot-Audio/json-docs/audio-final-cuts.json";
const FINAL_VIDEO_PATH = "temp/final-video/";
const FINAL_VIDEO_FRAMES = "temp/final-video-frames/";
const FINAL_AUDIO_CUTS = "temp/audio-cuts/";
const ANIME_TO_EDIT_FOLDER = "animes-to-edit/";
const MEME_IMAGES_PATH = "meme-images/";
const MEME_FRAMES_PATH = "temp/meme-frames/";
const FPS = 30;

async function createTemporaryFolders() {
    console.log("TEMPORARY FOLDERSSSS........");
    try {
        fs.mkdirSync(`${MEME_FRAMES_PATH}`);
    } catch (error) {
        console.log("Temporary Folder not created" + error);
    }

    // frames
    try {
        fs.mkdirSync(`${FINAL_VIDEO_FRAMES}`);
    } catch (error) {
        console.log("Temporary Folder not created" + error);
    }

    // final video folder
    try {
        fs.mkdirSync(`${FINAL_VIDEO_PATH}`);
    } catch (error) {
        console.log("Temporary folder not created: " + error);
    }
}

async function extractFramesFromAnime() {
    console.log("Extraindo frames do Anime (essa parte pode demorar infinito)")
    animeToEdit = fs.readdirSync(`${ANIME_TO_EDIT_FOLDER}`);

    await exec(`ffmpeg -i ${ANIME_TO_EDIT_FOLDER}${animeToEdit[0]} ${FINAL_VIDEO_FRAMES}%d.png`);
}

async function editVideoBasedOnAudio() {
    console.log("Editando imagem de acordo com o Áudio analizado... (dependendo do quão irritante é seu anime, essa parte também vai demorar pra cacete)")
    json_final_audio_cuts = require(`${JSON_FINAL_AUDIO_CUTS_PATH}`);
    var { cut_strings } = json_final_audio_cuts;
    var { cut_labels } = json_final_audio_cuts;

    for(index = 0; index < cut_labels.length; index++) {
        if(cut_labels[index] == "Choro" && (Math.random() * (100)) < 100) {
            // substitute video and audio from cut
            console.log(`Label - ${cut_labels[index]}`);
            
            imageFiles = fs.readdirSync(`${MEME_IMAGES_PATH}${cut_labels[index]}`);

            memeFile = await extractFramesFromMeme(imageFiles, `${MEME_IMAGES_PATH}${cut_labels[index]}/`);
            firstMemeSecond = await findFramesToSubstitute(cut_strings[index]);
            memePath = `${MEME_IMAGES_PATH}${cut_labels[index]}/${memeFile}`;

            if(firstMemeSecond >= 0)
                await substituteAudioCut(cut_strings[index], firstMemeSecond, memePath, index);
        }
    }
}


async function extractFramesFromMeme(videosArray, folderPath) {
    videoIndex = Math.floor(Math.random() * (videosArray.length));
    
    await exec(`ffmpeg -i ${folderPath}${videosArray[videoIndex]} ${MEME_FRAMES_PATH}%d.png`);
    
    return videosArray[videoIndex];
}


async function findFramesToSubstitute(cutString) {
    animeFrames = fs.readdirSync(`${FINAL_VIDEO_FRAMES}`);
    durationAnimeCut = cutString.split(" ")[2];
    firstAnimeFrame = cutString.split(" ")[0]*FPS;
    
    memeFrames = fs.readdirSync(`${MEME_FRAMES_PATH}`);
    durationMemeVideo = Math.floor(memeFrames.length/FPS);
    firstMemeFrame = Math.floor(Math.random() * (durationMemeVideo - durationAnimeCut))*FPS;
    
    for(let i = 0; i < durationAnimeCut*FPS; i++) {
        console.log(`cut - ${i}`);
        if(firstMemeFrame >= 0) {
            animeImage = await Jimp.read(`${FINAL_VIDEO_FRAMES}${firstAnimeFrame+i+1}.png`);
            memeImage = await Jimp.read(`${MEME_FRAMES_PATH}${firstMemeFrame+i+1}.png`);
            drawOnFrame(animeImage, memeImage, `${firstAnimeFrame+i+1}.png`);
        }

    }
    
    return Math.floor(firstMemeFrame/FPS);
}

async function drawOnFrame(animeImage, memeImage, animeFramePath) {

    var newFrame = await animeImage.composite(memeImage, 50, 10, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.4,
        opacityDest: 1
    })
    
    newFrame.write(`${FINAL_VIDEO_FRAMES}${animeFramePath}`);

}

async function substituteAudioCut(cutString, firstSecond, memePath, cutIndex) {
    durationMemeCut = cutString.split(" ")[2];
    let cutID = ("0000" + cutIndex).slice(-5)
    try {
        fs.unlinkSync(`${FINAL_AUDIO_CUTS}cut${cutID}.mp3`);
    } catch (error) {
        
    }

    await exec(`ffmpeg -i ${memePath} -ss ${firstSecond} -t ${durationMemeCut} ${FINAL_AUDIO_CUTS}cut${cutID}.mp3`);
}

async function main() {
    console.log("Robot: Edit Video")

    await createTemporaryFolders();
    await extractFramesFromAnime();
    await editVideoBasedOnAudio();
}



module.exports = main