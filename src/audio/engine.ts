import type { AudioEngine, NoteEvent } from './types';

export class WebAudioEngine implements AudioEngine {
  ctx: AudioContext;

  constructor(context: AudioContext) {
    this.ctx = context;
  }

  // `resume` starts the audio context if it's paused (e.g. no user interaction)
  async resume() {
    await this.ctx.resume();
  }

  now() {
    return this.ctx.currentTime;
  }

  scheduleNote(event: NoteEvent): void {
    const osc = this.ctx.createOscillator();
    osc.frequency.value = event.frequency;
    osc.connect(this.ctx?.destination);
    osc.start(event.time);
    osc.stop(event.time + event.duration);
  }
}
