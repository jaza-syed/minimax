import type { NoteEvent } from '../audio/types';
import type { ScheduleWindow } from '../scheduler/scheduler';

export interface TriggerEvent {
  time: number;
}

export class ClockNode {
  // time of the Next Unscheduled Tick
  private nextTickTime: number | null = null;

  constructor(private readonly bpm: number = 120) {}

  reset(startTime: number) {
    this.nextTickTime = startTime;
  }

  schedule(window: ScheduleWindow): TriggerEvent[] {
    // Schedule is a half-open interval [startTime, endTime)
    const events: TriggerEvent[] = [];

    // Get inside the window
    let nextTickTime = this.nextTickTime ?? window.startTime;
    while (nextTickTime < window.startTime) {
      nextTickTime += 60 / this.bpm;
    }

    // Schedule events inside the window
    // events.push({ time: nextTickTime })
    while (nextTickTime < window.endTime) {
      events.push({ time: nextTickTime });
      nextTickTime += 60 / this.bpm;
    }

    // Update state when scheduling pass is complete
    this.nextTickTime = nextTickTime;
    return events;
  }
}

export class NoteNode {
  constructor(
    private readonly frequency: number = 440,
    private readonly duration: number = 0.1,
  ) {}

  onTrigger(triggers: TriggerEvent[]): NoteEvent[] {
    return triggers.map((t) => {
      return {
        time: t.time,
        frequency: this.frequency,
        duration: this.duration,
      };
    });
  }
}
