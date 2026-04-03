import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { type MetroData } from '@/patchGraphNodes/metro';

// Set up node data type
export type MetroNodeData = {
  data: MetroData;
  onBpmChange: (pm: number) => void;
};
export type MetroFlowNode = Node<MetroNodeData, 'metro'>;

// Actual component
export function MetroNode({ data }: NodeProps<MetroFlowNode>) {
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
      {/* Set the output on the right*/}
      <Handle type="source" position={Position.Right} id="event-out" />
      {/* Set the title */}
      <div style={{ fontWeight: 600, marginBottom: 8 }}>METRO</div>
      {/* BPM input */}
      <label style={{ display: 'block', fontSize: 12 }}>
        BPM: {data.data.bpm}
        {/* Link the input to the actual data type */}
        <input
          className="nodrag"
          type="range"
          min={60}
          max={240}
          value={data.data.bpm}
          onChange={(event) => data.onBpmChange(Number(event.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
