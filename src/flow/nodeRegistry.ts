import { type ReactFlowProps } from '@xyflow/react';
import { type NoteFlowNode, NoteNode } from '../reactFlowNodes/note';
import { type MetroFlowNode, MetroNode } from '../reactFlowNodes/metro';
import { type OutputFlowNode, OutputNode } from '../reactFlowNodes/output';
import { type LfoFlowNode, LfoNode } from '../reactFlowNodes/lfo';
import { type FilterFlowNode, FilterNode } from '../reactFlowNodes/filter';

export interface FlowNodeByType {
  metro: MetroFlowNode;
  note: NoteFlowNode;
  audioOutput: OutputFlowNode;
  filter: FilterFlowNode;
  lfo: LfoFlowNode;
}

export type FlowNodeType = keyof FlowNodeByType;
export type AnyFlowNode = FlowNodeByType[FlowNodeType];

export type FlowNodeMenuElement<K extends FlowNodeType = FlowNodeType> = {
  type: K;
  label: string;
};

export const FlowNodeMenuElements: FlowNodeMenuElement[] = [
  { type: 'metro', label: 'Metro' },
  { type: 'note', label: 'Note' },
  { type: 'audioOutput', label: 'AudioOutput' },
  { type: 'filter', label: 'Filter' },
  { type: 'lfo', label: 'LFO' },
];

export const flowNodeTypes = {
  metro: MetroNode,
  note: NoteNode,
  audioOutput: OutputNode,
  filter: FilterNode,
  lfo: LfoNode,
} satisfies NonNullable<ReactFlowProps['nodeTypes']>;

export function isFlowNodeOfType<K extends FlowNodeType>(
  node: AnyFlowNode,
  type: K,
): node is FlowNodeByType[K] {
  return node.type === type;
}
