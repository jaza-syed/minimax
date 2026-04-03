import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { type LfoData } from '@/patchGraphNodes/lfo';

// Set up node data type
export type LfoNodeData = {
  data: LfoData;
  onFrequencyChange: (frequency: number) => void;
  onGainChange: (gain: number) => void;
};
export type LfoFlowNode = Node<LfoNodeData, 'lfo'>;

// Actual component
export function LfoNode({ data }: NodeProps<LfoFlowNode>) {
  return (
    // Basic styling
    <div
      style={{
        width: 180,
        padding: 12,
        border: '1px solid #444',
        borderRadius: 8,
        background: 'white',
      }}
    >
      {/* Handles */}
      <Handle type="source" position={Position.Right} id="output" />
      <Handle type="target" position={Position.Top} id="frequency" />
      {/* Set the title */}
      <div style={{ fontWeight: 600, marginBottom: 8 }}>lfo</div>
      {/* BPM input */}
      <label style={{ display: 'block', fontSize: 12 }}>
        Frequency: {data.data.frequency}
        {/* Link the input to the actual data type */}
        <input
          className="nodrag"
          type="range"
          min={60}
          max={12000}
          value={data.data.frequency}
          onChange={(event) =>
            data.onFrequencyChange(Number(event.target.value))
          }
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
      <label style={{ display: 'block', fontSize: 12 }}>
        gain: {data.data.gain}
        {/* Link the input to the actual data type */}
        <input
          className="nodrag"
          type="range"
          min={0}
          max={1000}
          value={data.data.gain}
          onChange={(event) => data.onGainChange(Number(event.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
