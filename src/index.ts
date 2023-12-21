import {MotionVisualization} from './MotionVisualization';
import {PlaybackController} from './PlaybackController';


function getQueryVariable(variable: string) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

function initializeApp() {
    const player1 = new MotionVisualization("samples/" + getQueryVariable("dataset") + "/original.csv", "threeCanvas1");
    const player2 = new MotionVisualization("samples/" + getQueryVariable("dataset") + "/fixed.csv", "threeCanvas2");
    const controller = new PlaybackController(player1, player2);

}

document.addEventListener('DOMContentLoaded', initializeApp);