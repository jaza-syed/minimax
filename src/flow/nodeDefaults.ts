import type { MetroData } from '@/patchGraphNodes/metro';
import type { NoteData } from '@/patchGraphNodes/note';
import type { FilterData } from '@/patchGraphNodes/filter';
import type { LfoData } from '@/patchGraphNodes/lfo';
import type { OutputNodeData } from '../reactFlowNodes/output';

export type FlowNodeDefaults = {
  metro: MetroData;
  note: NoteData;
  audioOutput: OutputNodeData;
  filter: FilterData;
  lfo: LfoData;
};

export const flowNodeDefaults: FlowNodeDefaults = {
  metro: { bpm: 120 },
  note: { frequency: 440, duration: 0.5 },
  audioOutput: { destination: 'default' },
  filter: { cutoff: 440 },
  lfo: { frequency: 50, gain: 1 },
};
