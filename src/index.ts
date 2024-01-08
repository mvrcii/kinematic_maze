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
    Array.from(document.getElementsByClassName('motion-player')).forEach(dom => {
        new PlaybackController(new MotionVisualization(dom as HTMLDivElement));
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);