import {ParsedData, setupCSVUploadHandler} from './csv-handler';
import {initializeThreeJS} from "./threejs-visualizer";


export function setupVisualization(parsedDataInput: ParsedData) {
    initializeThreeJS(parsedDataInput);
}

document.addEventListener('DOMContentLoaded', () => {
    setupCSVUploadHandler();
});


