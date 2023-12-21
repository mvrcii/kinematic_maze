import {MotionVisualization} from './MotionVisualization';
import {PlaybackController} from './PlaybackController';


function getQueryVariable(variable: string, defaultDataset: string) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return defaultDataset
}

function initializeApp() {
    const defaultDataset = 'liebers_2';
    const dataset = getQueryVariable('dataset', defaultDataset);

    // // Set the title to the selected dataset
    // const titleElement = document.getElementById('dataset_title');
    // if (titleElement) {
    //     titleElement.textContent = `VR Dashboard - ${dataset}`;
    // }


    const player1 = new MotionVisualization("samples/" + dataset + "/original.csv", "threeCanvas1");
    const player2 = new MotionVisualization("samples/" + dataset + "/fixed.csv", "threeCanvas2");
    const controller = new PlaybackController(player1, player2);

}

document.addEventListener('DOMContentLoaded', initializeApp);