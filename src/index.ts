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

    let number = 1;
    
    while (number <= document.getElementsByClassName('motion-player').length){
        const path = document.getElementById('motion-player' + number)?.getAttribute('data-source-path') || '';
        const player = new MotionVisualization(path, number);
        const controller = new PlaybackController(player);
        number += 1;
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);