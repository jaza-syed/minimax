import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { type FilterData } from '@/patchGraphNodes/filter';

// Set up node data type
export type FilterNodeData = {
  data: FilterData;
  onCutoffChange: (cutoff: number) => void;
};
export type FilterFlowNode = Node<FilterNodeData, 'filter'>;

// Actual component
export function FilterNode({ data }: NodeProps<FilterFlowNode>) {
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
      <Handle type="source" position={Position.Right} id="outlet" />
      <Handle type="target" position={Position.Left} id="inlet" />
      <Handle type="target" position={Position.Top} id="cutoff" />
      {/* Set the title */}
      <div style={{ fontWeight: 600, marginBottom: 8 }}>filter</div>
      {/* BPM input */}
      <label style={{ display: 'block', fontSize: 12 }}>
        BPM: {data.data.cutoff}
        {/* Link the input to the actual data type */}
        <input
          className="nodrag"
          type="range"
          min={60}
          max={12000}
          value={data.data.cutoff}
          onChange={(event) => data.onCutoffChange(Number(event.target.value))}
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
