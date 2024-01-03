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

    // #### Fixed Datasets ###
    const players = [];

    const player1 = new MotionVisualization("samples/liebers_1/fixed.csv", "threeCanvas1");
    players.push(player1);
    
    const player2 = new MotionVisualization("samples/liebers_2/fixed.csv", "threeCanvas2");
    players.push(player2);
    
    const player3 = new MotionVisualization("samples/liebers_3/fixed.csv", "threeCanvas3");
    players.push(player3);
    
    const player4 = new MotionVisualization("samples/IVRUADST/fixed.csv", "threeCanvas4");
    players.push(player4);
    
    const player5 = new MotionVisualization("samples/Vrnet/Vrnet_traffic_cop.csv", "threeCanvas5");
    players.push(player5);
    
    const player6 = new MotionVisualization("samples/r_miller/fixed.csv", "threeCanvas6");
    players.push(player6);

    const player1_orig = new MotionVisualization("samples/liebers_1/original.csv", "threeCanvas_orig1");
    players.push(player1_orig);
    
    const player2_orig = new MotionVisualization("samples/liebers_2/original.csv", "threeCanvas_orig2");
    players.push(player2_orig);
    
    const player3_orig = new MotionVisualization("samples/liebers_3/original.csv", "threeCanvas_orig3");
    players.push(player3_orig);
    
    const player4_orig = new MotionVisualization("samples/IVRUADST/original.csv", "threeCanvas_orig4");
    players.push(player4_orig);
    
    const player5_orig = new MotionVisualization("samples/bsor/..csv", "threeCanvas_orig5");
    players.push(player5_orig);
    
    const player6_orig = new MotionVisualization("samples/r_miller/original.csv", "threeCanvas_orig6");
    players.push(player6_orig);
        
    for (const player of players) {
    const controller = new PlaybackController(player);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);