import type { PatchGraphNode, PatchGraphPort, AnyEvent } from '@/types';

export interface NoteData {
  frequency: number;
  duration: number;
}

export class NotePatchGraphNode implements PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  passthrough: GainNode;
  frequency: number;
  duration: number;

  constructor(context: AudioContext, data: NoteData) {
    this.kind = 'note';
    this.passthrough = context.createGain(); // gain defaults to 1
    this.frequency = data.frequency;
    this.duration = data.duration;
    this.ports = new Map([
      [
        'audio-out',
        {
          type: 'audio-outlet',
          node: this.passthrough,
          outletIndex: 0,
        },
      ],
      [
        'event-in',
        {
          type: 'event-inlet',
          event: 'trigger',
        },
      ],
    ]);
  }

  onEvent(port: string, event: AnyEvent, context: AudioContext) {
    if (port != 'event-in' || event.kind != 'trigger') {
      console.log(
        `Note received invalid event port=${port} kind=${event.kind}`,
      );
      return;
    }
    const osc = context.createOscillator();
    osc.frequency.value = this.frequency;
    osc.connect(this.passthrough);
    osc.start(event.time);
    osc.stop(event.time + this.duration);
  }
}
