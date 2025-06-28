class ProgressTracker {
  #progress: number | null = null;
  #message: string = '';
  #indicatorElement: HTMLElement;
  #messageElement: HTMLElement;

  constructor(indicatorElement: HTMLElement, messageElement: HTMLElement) {
    this.#indicatorElement = indicatorElement;
    this.#messageElement = messageElement;
  }

  set(progress: number, message: string | null = null) {
    this.#indicatorElement.classList.remove('disappear');
    this.#indicatorElement.classList.add('appear');

    if (!this.#progress || progress > this.#progress) {
      this.#progress = progress;
      if (message) {
        this.#message = message;
      }
      console.info(this.#message, this.#progress);
      this.#indicatorElement.style.setProperty(
        '--progress',
        `${this.#progress}`,
      );
      this.#messageElement.innerText = this.#message;
    }
  }

  reset() {
    this.#progress = 0;
    this.#message = '';

    this.#indicatorElement.style.setProperty('--progress', '0');

    this.#indicatorElement.classList.remove('appear');
    this.#indicatorElement.classList.add('disappear');
  }
}

export const mapLoadingProgress = new ProgressTracker(
  document.getElementById('canvasLoadingIndicator')!,
  document.getElementById('canvasLoadingMessage')!,
);
