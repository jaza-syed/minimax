import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

// Set up node data type
export type OutputNodeData = {
  destination: string;
};
export type OutputFlowNode = Node<OutputNodeData, 'audioOutput'>;

// Actual component
export function OutputNode({ id: _id, data }: NodeProps<OutputFlowNode>) {
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
      {/* Set the input on the right*/}
      <Handle type="target" position={Position.Left} id="input" />
      <div style={{ fontWeight: 600, marginBottom: 8 }}>OUTPUT</div>

      <label style={{ display: 'block', width: '100%', fontSize: 12 }}>
        {data.destination}
        {/* TODO: Add connection callbacks */}
      </label>
    </div>
  );
}
