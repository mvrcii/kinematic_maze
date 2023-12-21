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
    motionVis1: MotionVisualization
    motionVis2: MotionVisualization

    playButton: HTMLButtonElement | null
    timerElement: TimerElement
    timelineElement: TimelineElement

    constructor(motionVis1: MotionVisualization, motionVis2: MotionVisualization) {
        this.playButton = document.querySelector("#playPause") as HTMLButtonElement;
        this.timerElement = new TimerElement(document.querySelector("#timer") as HTMLElement);
        this.timelineElement = new TimelineElement(document.querySelector("#timeline") as HTMLProgressElement);

        this.playButton?.addEventListener("click", (event) => this.playPause());
        this.timelineElement.reactor.addEventListener("sweepRequest",
            (position: any) => this.onSweep(position));

        this.motionVis1 = motionVis1;
        this.motionVis1.reactor.addEventListener("step", () => this.onStep());
        this.motionVis2 = motionVis2;
        this.motionVis2.reactor.addEventListener("step", () => this.onStep());
    }

    onSweep(position: any) {
        this.motionVis1.sweep(position);
        this.motionVis2.sweep(position)
    }

    onStep() {
        if (this.motionVis1.isEverythingLoadedAndReady()) {
            this.timerElement.update(new Date(this.getCurrentSceneTimestamp()));
            this.timelineElement.update(this.motionVis1.progress());
        }
        if (this.motionVis2.isEverythingLoadedAndReady()) {
            this.timerElement.update(new Date(this.getCurrentSceneTimestamp()));
            this.timelineElement.update(this.motionVis2.progress());
        }
    }

    getCurrentSceneTimestamp() {
        return this.motionVis1.getCurrentTimestamp()
    }

    playPause() {
        this.motionVis1.pauseContinue();
        this.motionVis2.pauseContinue();
    }
}