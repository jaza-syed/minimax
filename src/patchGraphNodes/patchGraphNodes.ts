import type { MetroData } from './metro';
import type { NoteData } from './note';
import type { LfoData } from './lfo';
import type { FilterData } from './filter';

export type PatchNodeData =
  | { type: 'metro'; data: MetroData }
  | { type: 'note'; data: NoteData }
  | { type: 'lfo'; data: LfoData }
  | { type: 'output' }
  | { type: 'filter'; data: FilterData };
