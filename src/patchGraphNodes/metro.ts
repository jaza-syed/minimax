import type {
  PatchGraphNode,
  PatchGraphPort,
  ScheduledSourceNode,
  TriggerEvent,
  ScheduleWindow,
  AnyEvent,
  PatchGraphPortName,
} from '@/types';

export interface MetroData {
  bpm: number;
}

export class MetroPatchGraphNode
  implements PatchGraphNode, ScheduledSourceNode
{
  kind: string;
  ports: Map<string, PatchGraphPort>;
  bpm: number;
  private nextTickTime: number | null = null;

  constructor({ bpm }: MetroData) {
    this.kind = 'metro';
    this.bpm = bpm;
    this.ports = new Map([
      [
        'event-out',
        {
          type: 'event-outlet',
          event: 'trigger',
        },
      ],
    ]);
  }

  reset(startTime: number) {
    this.nextTickTime = startTime;
  }

  schedule(
    window: ScheduleWindow,
  ): { outlet: PatchGraphPortName; event: AnyEvent }[] {
    // Schedule is a half-open interval [startTime, endTime)
    const events: TriggerEvent[] = [];

    // Schedule events inside the window
    let nextTickTime = this.nextTickTime ?? window.startTime;
    while (nextTickTime < window.startTime) {
      nextTickTime += 60 / this.bpm;
    }

    // Schedule events inside the window
    // events.push({ time: nextTickTime })
    while (nextTickTime < window.endTime) {
      events.push({ kind: 'trigger', time: nextTickTime });
      nextTickTime += 60 / this.bpm;
    }

    // Update state when scheduling pass is complete
    this.nextTickTime = nextTickTime;
    return events.map((event) => {
      return {
        outlet: 'event-out',
        event: event,
      };
    });
  }
}
