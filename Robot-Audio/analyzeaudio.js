const util = require("util");
const exec = util.promisify(require("child_process").exec);

AUDIO_ROBOT_PATH = "Robot-Audio/main_model.py"

async function callAudioRobot() {
    console.log("Audio recognition model in process...")
    await exec(`python ${AUDIO_ROBOT_PATH}`);
    console.log("Audio recognition finished")
}

module.exports = callAudioRobot