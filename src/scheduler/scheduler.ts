import type { AudioGraph } from '../graph/graph';
import type { WebAudioEngine } from '../audio/engine';

export type ScheduleWindow = {
  startTime: number;
  endTime: number;
};

export class Scheduler {
  private transportStartTime: number = 0;
  private timeoutId: number | null = null;

  constructor(
    private readonly engine: WebAudioEngine,
    private readonly audioGraph: AudioGraph,
    private lookahead: number = 0.3,
    private tickInterval: number = 0.2,
    private scheduledUntil: number = 0,
    // Gives the engine some lead time before the first event is due
    private startLeadTime: number = 0.01,
    private isRunning_: boolean = false,
  ) {}

  start(): void {
    if (this.isRunning_) {
      return;
    }
    this.isRunning_ = true;
    // Always starts from the start
    this.scheduledUntil = 0;
    this.transportStartTime = this.engine.now() + this.startLeadTime;
    this.audioGraph.reset(0);
    this.tick();
  }

  stop(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning_ = false;
  }

  async tick(): Promise<void> {
    if (!this.isRunning_) {
      return;
    }

    const endTime =
      this.engine.now() - this.transportStartTime + this.lookahead;
    const scheduleWindow: ScheduleWindow = {
      startTime: this.scheduledUntil,
      endTime,
    };
    const notes = this.audioGraph.schedule(scheduleWindow);
    for (const note of notes) {
      note.time += this.transportStartTime;
      this.engine.scheduleNote(note);
    }
    this.scheduledUntil = scheduleWindow.endTime;

    this.timeoutId = window.setTimeout(() => {
      this.tick();
    }, this.tickInterval * 1000);
  }

  isRunning(): boolean {
    return this.isRunning_;
  }
}
