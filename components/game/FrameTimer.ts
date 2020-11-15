const FPS = 60.098

export default class FrameTimer {

  running = true

  _requestID = 0

  readonly interval = 1e3 / FPS

  lastFrameTime = 0

  constructor(private onGenerateFrame: () => void, private onWriteFrame: () => void) {
  }

  start() {
    this.running = true;
    this.requestAnimationFrame()
  }

  stop() {
    this.running = false;
    if (this._requestID) window.cancelAnimationFrame(this._requestID);
    this.lastFrameTime = 0
  }

  requestAnimationFrame() {
    this._requestID = window.requestAnimationFrame(this.onAnimationFrame);
  }

  generateFrame() {
    this.onGenerateFrame();
    this.lastFrameTime += this.interval;
  }

  onAnimationFrame = (time: number) => {
    this.requestAnimationFrame();
    // how many ms after 60fps frame time
    let excess = time % this.interval;

    // newFrameTime is the current time aligned to 60fps intervals.
    // i.e. 16.6, 33.3, etc ...
    let newFrameTime = time - excess;

    // first frame, do nothing
    if (!this.lastFrameTime) {
      this.lastFrameTime = newFrameTime;
      return;
    }

    let numFrames = Math.round(
      (newFrameTime - this.lastFrameTime) / this.interval
    );

    // This can happen a lot on a 144Hz display
    if (numFrames === 0) {
      //console.log("WOAH, no frames");
      return;
    }

    // update display on first frame only
    this.generateFrame();
    this.onWriteFrame();

    // we generate additional frames evenly before the next
    // onAnimationFrame call.
    // additional frames are generated but not displayed
    // until next frame draw
    let timeToNextFrame = this.interval - excess;
    for (let i = 1; i < numFrames; i++) {
      setTimeout(() => {
        this.generateFrame();
      }, (i * timeToNextFrame) / numFrames);
    }
    if (numFrames > 1) console.log("SKIP", numFrames - 1, this.lastFrameTime);

    this.lastFrameTime = newFrameTime
  }
}
