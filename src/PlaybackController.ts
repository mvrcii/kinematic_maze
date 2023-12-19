import {MotionVisualization} from "./MotionVisualization";
import {TimelineElement, TimerElement} from "./timer";

export function getQueryVariable(variable: any) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        const pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
}

export class PlaybackController {
    motionVisualization: MotionVisualization

    playButton: HTMLButtonElement | null
    timerElement: TimerElement
    timelineElement: TimelineElement

    constructor(csvPath: string) {
        this.playButton = document.querySelector("#playPause") as HTMLButtonElement;
        this.timerElement = new TimerElement(document.querySelector("#timer") as HTMLElement);
        this.timelineElement = new TimelineElement(document.querySelector("#timeline") as HTMLProgressElement);

        this.playButton?.addEventListener("click", (event) => this.playPause());
        this.timelineElement.reactor.addEventListener("sweepRequest",
            (position: any) => this.onSweep(position));

        this.motionVisualization = new MotionVisualization(csvPath);
        this.motionVisualization.reactor.addEventListener("step", () => this.onStep());
    }

    onSweep(position: any) {
        this.motionVisualization.sweep(position);
    }

    onStep() {
        if (this.motionVisualization.isEverythingLoadedAndReady()) {
            this.timerElement.update(new Date(this.getCurrentSceneTimestamp()));
            this.timelineElement.update(this.motionVisualization.progress());
        }
    }

    getCurrentSceneTimestamp() {
        return this.motionVisualization.getCurrentTimestamp()
    }

    playPause() {
        this.motionVisualization.pauseContinue();
    }
}