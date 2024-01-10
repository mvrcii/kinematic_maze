import {MotionVisualization} from "./MotionVisualization";
import {TimelineElement} from "./timer";

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
    motionVis: MotionVisualization

    // playButton: HTMLButtonElement | null
    // timerElement: TimerElement
    timelineElement: TimelineElement

    constructor(motionVis: MotionVisualization) {
        // this.playButton = document.querySelector("#playPause" + playerIdx) as HTMLButtonElement;
        // this.timerElement = new TimerElement(document.querySelector("#timer" + playerIdx) as HTMLElement);

        this.timelineElement = new TimelineElement(motionVis);

        // this.playButton?.addEventListener("click", (event) => this.playPause());
        this.timelineElement.reactor.addEventListener("sweepRequest",
            (position: any) => this.onSweep(position));

        this.motionVis = motionVis;

        if (!motionVis.playerDom.classList.contains('readonly')) {
            this.motionVis.reactor.addEventListener("step", () => this.onStep());
        }
    }

    onSweep(position: any) {
        this.motionVis.sweep(position);
    }

    onStep() {
        if (this.motionVis.isEverythingLoadedAndReady()) {
            // this.timerElement.update(new Date(this.getCurrentSceneTimestamp()));
            this.timelineElement.update(this.motionVis.progress());
        }

    }

    getCurrentSceneTimestamp() {
        return this.motionVis.getCurrentTimestamp()
    }

    playPause() {
        this.motionVis.pauseContinue();

    }
}