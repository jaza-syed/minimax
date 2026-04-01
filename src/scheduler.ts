import type {
  ScheduleWindow,
  Scheduler,
  ScheduleRuntimeContext,
  Runtime,
} from './types';

// Little wrapper around the runtime exposing only what the scheduler needs
export class TransportRuntime implements ScheduleRuntimeContext {
  constructor(private runtime: Runtime) {}
  now(): number {
    return this.runtime.now();
  }
  schedule(window: ScheduleWindow, transportStartTime: number): void {
    this.runtime.schedule(window, transportStartTime);
  }
  reset(time: number) {
    this.runtime.reset(time);
  }
}

export class Transport implements Scheduler {
  // Time transport was started from 0 on the web audio clock
  private transportStartTime: number = 0;
  // Private state for ticker
  private timeoutId: number | null = null;

  constructor(
    private readonly runtimeContext: ScheduleRuntimeContext,
    private lookahead: number = 0.3,
    private tickInterval: number = 0.2,
    private startLeadTime: number = 0.005,
    // Time events have already been scheduled for in transport space
    private scheduledUntil: number = 0,
    // Playing or not
    private isRunning_: boolean = false,
  ) {}

  start(): void {
    if (this.isRunning_) {
      return;
    }
    this.isRunning_ = true;

    // Restart from transport time 0
    this.scheduledUntil = 0;
    this.transportStartTime = this.runtimeContext.now() + this.startLeadTime;
    this.runtimeContext.reset(0);
    this.tick();
  }

  stop(): void {
    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isRunning_ = false;
  }

  private async tick(): Promise<void> {
    if (!this.isRunning_) {
      return;
    }

    // Schedule the window
    const endTime =
      this.runtimeContext.now() - this.transportStartTime + this.lookahead;
    this.runtimeContext.schedule(
      { startTime: this.scheduledUntil, endTime },
      this.transportStartTime,
    );
    this.scheduledUntil = endTime;

    // Schedule next tick
    this.timeoutId = window.setTimeout(() => {
      this.tick();
    }, this.tickInterval * 1000);
  }
}
