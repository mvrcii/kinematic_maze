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

    const motionPlayers = [];

    // Fixed Datasets
    const player1 = new MotionVisualization("samples/liebers_1/fixed.csv", 1);
    motionPlayers.push(player1);

    const player2 = new MotionVisualization("samples/liebers_2/fixed.csv", 2);
    motionPlayers.push(player2);

    const player3 = new MotionVisualization("samples/liebers_3/fixed.csv", 3);
    motionPlayers.push(player3);

    const player4 = new MotionVisualization("samples/IVRUADST/fixed.csv", 4);
    motionPlayers.push(player4);

    const player5 = new MotionVisualization("samples/Vrnet/Vrnet_traffic_cop.csv", 5);
    motionPlayers.push(player5);

    const player6 = new MotionVisualization("samples/r_miller/fixed.csv", 6);
    motionPlayers.push(player6);

    // Negative Samples
    const negative_player7 = new MotionVisualization(
        "negative_samples/vr-controllers_quat_swap_ruf_and_rub.csv", 7)
    motionPlayers.push(negative_player7);

    const negative_player8 = new MotionVisualization(
        "negative_samples/vr-controllers_euler_to_quat_mapping_zyx.csv", 8);
    motionPlayers.push(negative_player8);

    const negative_player9 = new MotionVisualization(
        "negative_samples/vr-controllers_euler_to_quat_intrinsic.csv", 9);
    motionPlayers.push(negative_player9);

    // const negative_player10 = new MotionVisualization("samples/IVRUADST/original.csv", 10);
    // motionPlayers.push(negative_player10);
    //
    // const negative_player11 = new MotionVisualization("samples/bsor/..csv", 11);
    // motionPlayers.push(negative_player11);
    //
    // const negative_player12 = new MotionVisualization("samples/r_miller/original.csv", 12);
    // motionPlayers.push(negative_player12);

    for (const motionPlayer of motionPlayers) {
        const controller = new PlaybackController(motionPlayer);
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);