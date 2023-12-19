import {Reactor} from "./events";

class BaseElement {
    reactor: Reactor;
    dom: HTMLElement;

    constructor(dom: HTMLElement) {
        this.reactor = new Reactor();
        this.dom = dom;
    }
}


class TimelineElement extends BaseElement {
    constructor(dom: HTMLProgressElement) {
        super(dom);
        this.dom = dom;
        this.reactor.registerEvent('sweepRequest');

        this.dom.addEventListener('click', (event: MouseEvent) => {
            const bounds = this.dom.getBoundingClientRect();
            // Make sure to check if pageX is defined on the event, or use clientX as a fallback
            const pos = (event.pageX ?? event.clientX) - bounds.left; // Position cursor
            const requestedPosition = pos / bounds.width; // Round %
            this.reactor.dispatchEvent("sweepRequest", requestedPosition);
        });
    }

    update(progress: any): void {
        this.dom.setAttribute("value", progress)
    }
}

class TimerElement extends BaseElement {
    update(datetime: Date): void {
        this.dom.innerHTML = datetime.toLocaleTimeString("de-DE");
    }
}

export {BaseElement, TimelineElement, TimerElement};