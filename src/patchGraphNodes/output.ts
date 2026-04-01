import type { PatchGraphNode, PatchGraphPort } from '@/types';

export class OutputPatchGraphNode implements PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  passthrough: GainNode;

  constructor(context: AudioContext) {
    this.kind = 'audioOutput';
    this.passthrough = context.createGain(); // gain defaults to 1
    this.passthrough.connect(context.destination);
    this.ports = new Map([
      [
        'inlet',
        {
          type: 'audio-inlet',
          node: this.passthrough,
          inletIndex: 0,
        },
      ],
    ]);
  }
}
