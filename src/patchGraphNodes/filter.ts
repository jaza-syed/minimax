import type { PatchGraphNode, PatchGraphPort } from '@/types';

export interface FilterData {
  cutoff: number;
}

export class FilterPatchGraphNode implements PatchGraphNode {
  kind: string;
  ports: Map<string, PatchGraphPort>;
  filter: BiquadFilterNode;

  constructor(context: AudioContext, data: FilterData) {
    this.kind = 'filter';
    this.filter = context.createBiquadFilter(); // gain defaults to 1
    this.filter.frequency.value = data.cutoff;
    this.ports = new Map([
      [
        'inlet',
        {
          type: 'audio-inlet',
          node: this.filter,
          inletIndex: 0,
        },
      ],
      [
        'outlet',
        {
          type: 'audio-outlet',
          node: this.filter,
          outletIndex: 0,
        },
      ],
      [
        'cutoff',
        {
          type: 'audio-param',
          param: this.filter.frequency,
        },
      ],
    ]);
  }
}
