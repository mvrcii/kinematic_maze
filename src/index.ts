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
    
    const elements = document.getElementsByClassName('threeCanvas');
    console.log("elements: " + elements.length)
    let number = 1;
    while (number <= elements.length){
        console.log("number: " + number)
        const element = document.getElementById('threeCanvas' + number);
        const path = element?.getAttribute('source_path') || '';
        const player = new MotionVisualization(path, number);
        const controller = new PlaybackController(player);
        console.log("path: " + path)
        number += 1;
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);