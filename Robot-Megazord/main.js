const robotPreprocessor = require("../Robot-Preprocessor/preprocess.js");
const robotAudioAnalyzer = require("../Robot-Audio/analyzeaudio.js");
const robotEditAudio = require("../Robot-Edit-Audio/editaudio.js");
const robotShowman = require("../Robot-Showman/remakeanime.js");


(async function (){
    await robotPreprocessor();
    await robotAudioAnalyzer();
    await robotEditAudio();
    await robotShowman();
})();