import RingBuffer from 'ringbufferjs';

type OnBufferUnderRun = (actualSize: number, desiredSize: number) => void

function WebAudioContext() {
  return window.AudioContext || (window as any).webkitAudioContext
}

export default class Speakers {

  onBufferUnderrun: OnBufferUnderRun

  bufferSize = 8192

  buffer = new RingBuffer<number>(this.bufferSize * 2)

  audioCtx: AudioContext | undefined

  scriptNode: ScriptProcessorNode | undefined

  isStart = false

  constructor({ onBufferUnderrun }: { onBufferUnderrun: OnBufferUnderRun }) {
    this.onBufferUnderrun = onBufferUnderrun
  }

  public getSampleRate() {
    const AudioContext = WebAudioContext()
    if (!AudioContext) {
      return 44100
    }
    let myCtx = new AudioContext()
    let sampleRate = myCtx.sampleRate
    myCtx.close()
    return sampleRate
  }

  start() {
    if (this.isStart) return
    const AudioContext = WebAudioContext()
    // Audio is not supported
    if (!AudioContext) {
      return console.error('Audio is not supported');
    }
    this.audioCtx = new AudioContext();
    this.scriptNode = this.audioCtx.createScriptProcessor(1024, 0, 2);
    this.scriptNode?.addEventListener('audioprocess', this.onaudioprocess)
    // this.scriptNode.onaudioprocess = this.onaudioprocess;
    this.scriptNode.connect(this.audioCtx.destination);
    this.isStart = true
  }

  stop() {
    if (this.scriptNode) {
      if (this.audioCtx) this.scriptNode.disconnect(this.audioCtx.destination);
      this.scriptNode.removeEventListener('audioprocess', this.onaudioprocess)
      this.scriptNode = undefined;
    }
    if (this.audioCtx) {
      this.audioCtx.close().catch(err => console.error(err));
      this.audioCtx = undefined;
    }
    this.isStart = false
  }

  writeSample = (left: number, right: number) => {
    if (!this.isStart) return
    if (this.buffer.size() / 2 >= this.bufferSize) {
      console.log(`Buffer overrun`);
      this.buffer.deqN(this.bufferSize / 2);
    }
    this.buffer.enq(left);
    this.buffer.enq(right);
  }

  onaudioprocess = (e: AudioProcessingEvent) => {
    let left = e.outputBuffer.getChannelData(0);
    let right = e.outputBuffer.getChannelData(1);
    let size = left.length;

    // We're going to buffer underrun. Attempt to fill the buffer.
    // if (this.buffer.size() < size * 2 && this.onBufferUnderrun) {
    //   this.onBufferUnderrun(this.buffer.size(), size * 2);
    // }
    let samples: number[]
    try {
      samples = this.buffer.deqN(size * 2);
    } catch (e) {
      // onBufferUnderrun failed to fill the buffer, so handle a real buffer
      // underrun

      // ignore empty buffers... assume audio has just stopped
      let bufferSize = this.buffer.size() / 2;
      if (bufferSize > 0) {
        console.log(`Buffer underrun (needed ${size}, got ${bufferSize})`);
      }
      for (let j = 0; j < size; j++) {
        left[j] = 0;
        right[j] = 0;
      }
      return;
    }
    for (let i = 0; i < size; i++) {
      left[i] = samples[i * 2];
      right[i] = samples[i * 2 + 1];
    }
  }
}
