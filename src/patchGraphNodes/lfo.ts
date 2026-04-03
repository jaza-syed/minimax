import type { PatchGraphNode, PatchGraphPort } from '@/types';

export interface LfoData {
  frequency: number;
  gain: number;
}

export class LfoPatchGraphNode implements PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  osc: OscillatorNode;
  gain: GainNode;

  constructor(context: AudioContext, data: LfoData) {
    this.kind = 'lfo';
    this.osc = context.createOscillator();
    this.osc.frequency.value = data.frequency;
    this.gain = context.createGain();
    this.osc.connect(this.gain);
    this.osc.start();
    this.ports = new Map([
      [
        'output',
        {
          type: 'audio-outlet',
          node: this.gain,
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
