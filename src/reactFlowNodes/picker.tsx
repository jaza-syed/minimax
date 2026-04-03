import {
  type XYPosition,
  type NodeProps,
  type Node as FlowNode,
} from '@xyflow/react';
import { type NoteFlowNode, NoteNode } from './note';
import { type MetroFlowNode, MetroNode } from './metro';
import { type OutputFlowNode, OutputNode } from './output';
import { type LfoFlowNode, LfoNode } from './lfo';
import { type FilterFlowNode, FilterNode } from './filter';

import './picker.css';

// Type-safe picker catalog by inferring "type" and "data" from the flow
// node types
export type AnyFlowNode =
  | MetroFlowNode
  | NoteFlowNode
  | OutputFlowNode
  | FilterFlowNode
  | LfoFlowNode;

export type FlowNodeMenuEntry = AnyFlowNode extends infer N
  ? N extends FlowNode
    ? {
        type: NonNullable<N['type']>;
        label: string;
        node: React.ComponentType<NodeProps<N>>;
      }
    : never
  : never;

export const FlowNodeMenuEntries: FlowNodeMenuEntry[] = [
  { type: 'metro', label: 'Metro', node: MetroNode },
  { type: 'note', label: 'Note', node: NoteNode },
  { type: 'audioOutput', label: 'AudioOutput', node: OutputNode },
  { type: 'filter', label: 'Filter', node: FilterNode },
  { type: 'lfo', label: 'LFO', node: LfoNode },
];

// UI component
export type FlowNodeMenuProps = {
  onSelect: (entry: FlowNodeMenuEntry) => void;
  position: XYPosition;
};

export function NodeCreateMenu({ onSelect, position }: FlowNodeMenuProps) {
  function makeEntry(entry: FlowNodeMenuEntry) {
    return (
      <button
        key={entry.type}
        type="button"
        className="picker-menu__item"
        onClick={() => {
          onSelect(entry);
        }}
      >
        {entry.label}
      </button>
    );
  }

  return (
    <div
      className="picker-menu"
      style={{ position: 'fixed', left: position.x, top: position.y }}
    >
      {FlowNodeMenuEntries.map(makeEntry)}
    </div>
  );
}
