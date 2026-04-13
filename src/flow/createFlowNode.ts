import type { XYPosition } from '@xyflow/react';
import type { Runtime } from '@/types';
import { flowNodeDefaults } from './nodeDefaults';
import type {
  AnyFlowNode,
  FlowNodeByType,
  FlowNodeMenuElement,
  FlowNodeType,
} from './nodeRegistry';

export type UpdateNodeData = <K extends FlowNodeType>(
  nodeId: string,
  type: K,
  updater: (data: FlowNodeByType[K]['data']) => FlowNodeByType[K]['data'],
) => void;

type CreateFlowNodeArgs = {
  element: FlowNodeMenuElement;
  position: XYPosition;
  runtime: Runtime;
  updateNodeData: UpdateNodeData;
};

export function createFlowNode({
  element,
  position,
  runtime,
  updateNodeData,
}: CreateFlowNodeArgs): AnyFlowNode | null {
  switch (element.type) {
    case 'metro': {
      const data = { ...flowNodeDefaults.metro };
      const result = runtime.createNode({ type: 'metro', data });
      if (result.isErr()) return null;

      const nodeId = result.value;
      return {
        id: nodeId,
        type: 'metro',
        position,
        data: {
          data,
          onBpmChange: (bpm) => {
            runtime.setParamImmediate(nodeId, 'bpm', bpm);
            updateNodeData(nodeId, 'metro', (nodeData) => ({
              ...nodeData,
              data: {
                ...nodeData.data,
                bpm,
              },
            }));
          },
        },
      };
    }
    case 'note': {
      const data = { ...flowNodeDefaults.note };
      const result = runtime.createNode({ type: 'note', data });
      if (result.isErr()) return null;

      const nodeId = result.value;
      return {
        id: nodeId,
        type: 'note',
        position,
        data: {
          frequency: data.frequency,
          duration: data.duration,
          onFrequencyChange: (frequency) => {
            runtime.setParamImmediate(nodeId, 'frequency', frequency);
            updateNodeData(nodeId, 'note', (nodeData) => ({
              ...nodeData,
              frequency,
            }));
          },
          onDurationChange: (duration) => {
            runtime.setParamImmediate(nodeId, 'duration', duration);
            updateNodeData(nodeId, 'note', (nodeData) => ({
              ...nodeData,
              duration,
            }));
          },
        },
      };
    }
    case 'filter': {
      const data = { ...flowNodeDefaults.filter };
      const result = runtime.createNode({ type: 'filter', data });
      if (result.isErr()) return null;

      const nodeId = result.value;
      return {
        id: nodeId,
        type: 'filter',
        position,
        data: {
          data,
          onCutoffChange: (cutoff) => {
            runtime.setParamImmediate(nodeId, 'cutoff', cutoff);
            updateNodeData(nodeId, 'filter', (nodeData) => ({
              ...nodeData,
              data: {
                ...nodeData.data,
                cutoff,
              },
            }));
          },
        },
      };
    }
    case 'lfo': {
      const data = { ...flowNodeDefaults.lfo };
      const result = runtime.createNode({ type: 'lfo', data });
      if (result.isErr()) return null;

      const nodeId = result.value;
      return {
        id: nodeId,
        type: 'lfo',
        position,
        data: {
          data,
          onFrequencyChange: (frequency) => {
            runtime.setParamImmediate(nodeId, 'frequency', frequency);
            updateNodeData(nodeId, 'lfo', (nodeData) => ({
              ...nodeData,
              data: {
                ...nodeData.data,
                frequency,
              },
            }));
          },
          onGainChange: (gain) => {
            runtime.setParamImmediate(nodeId, 'gain', gain);
            updateNodeData(nodeId, 'lfo', (nodeData) => ({
              ...nodeData,
              data: {
                ...nodeData.data,
                gain,
              },
            }));
          },
        },
      };
    }
    case 'audioOutput': {
      const result = runtime.createNode({ type: 'output' });
      if (result.isErr()) return null;

      return {
        id: result.value,
        type: 'audioOutput',
        position,
        data: { ...flowNodeDefaults.audioOutput },
      };
    }
  }
}
