import type { PatchGraphNode, PatchGraphPort } from '@/types';

export interface LfoData {
  frequency: number;
}

export class LfoPatchGraphNode implements PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  osc: OscillatorNode;

  constructor(context: AudioContext, data: LfoData) {
    this.kind = 'oscillator';
    this.osc = context.createOscillator();
    this.osc.frequency.value = data.frequency;
    this.osc.start();
    this.ports = new Map([
      [
        'output',
        {
          type: 'audio-outlet',
          node: this.osc,
          outletIndex: 0,
        },
      ],
      [
        'frequency',
        {
          type: 'audio-param',
          param: this.osc.frequency,
        },
      ],
    ]);
  }
}
