import {PlaybackController} from './PlaybackController'

document.addEventListener('DOMContentLoaded', () => {
    setupCSVLinks();
});

function setupCSVLinks(): void {
    const csvLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('#csvFileList a');
    csvLinks.forEach(link => {
        link.addEventListener('click', (e: MouseEvent) => {
            e.preventDefault();
            const target = e.target as HTMLAnchorElement;
            const csvFilePath = target.getAttribute('data-csv');
            if (csvFilePath) {
                loadAnimation(csvFilePath);
            }
        });
    });
}

function loadAnimation(csvFilePath: string): void {
    // In TypeScript, you might have to cast the `window.fetch` as any to avoid type issues
    (window.fetch as any)('animation.html')
        .then((response: Response) => response.text())
        .then((html: string) => {
            const animationContainer = document.getElementById('animation');
            if (animationContainer) {
                animationContainer.innerHTML = html;
                new PlaybackController(csvFilePath);
            }
        })
        .catch((error: Error) => {
            console.error('Error loading the animation:', error);
        });
}