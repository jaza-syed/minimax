import type { NoteEvent } from '../audio/types';
import { ClockNode, NoteNode } from '../nodes/nodes';
import type { ScheduleWindow } from '../scheduler/scheduler';

export class AudioGraph {
  private readonly clock: ClockNode;
  private readonly note: NoteNode;

  constructor() {
    this.clock = new ClockNode();
    this.note = new NoteNode();
  }

  reset(startTime: number): void {
    this.clock.reset(startTime);
  }

  schedule(window: ScheduleWindow): NoteEvent[] {
    const triggers = this.clock.schedule(window);
    const notes = this.note.onTrigger(triggers);
    return notes;
  }
}

// export type PortType = 'audio' | 'number' | 'boolean' | 'string' | 'trigger'

// export type PortValue = number | boolean | string | number[]

// export interface PortDefinition {
//     name: string
//     type: PortType
//     defaultValue?: PortValue
// }

// export interface NodeAttributes {
//     type: string
//     position: { x: number; y: number }
//     state: Record<string, unknown>
// }

// export interface EdgeAttributes {
//     sourcePort: string
//     targetPort: string
// }
