import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

// Set up node data type
export type MetroNodeData = {
  bpm: number;
  onBpmChange: (id: string, bpm: number) => void;
};
export type MetroFlowNode = Node<MetroNodeData, 'metro'>;

// Actual component
export function MetroNode({ id, data }: NodeProps<MetroFlowNode>) {
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
      <Handle type="source" position={Position.Right} id="tick" />
      {/* Set the title */}
      <div style={{ fontWeight: 600, marginBottom: 8 }}>METRO</div>
      {/* BPM input */}
      <label style={{ display: 'block', fontSize: 12 }}>
        BPM
        {/* Link the input to the actual data type */}
        <input
          type="number"
          min={1}
          value={data.bpm}
          onChange={(event) => data.onBpmChange(id, Number(event.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
