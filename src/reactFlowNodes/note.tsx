import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';

// Set up node data type
export type NoteNodeData = {
  frequency: number;
  duration: number;
  onFrequencyChange: (id: string, frequency: number) => void;
  onDurationChange: (id: string, duration: number) => void;
};
export type NoteFlowNode = Node<NoteNodeData, 'note'>;

// Actual component
export function NoteNode({ id, data }: NodeProps<NoteFlowNode>) {
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
      <Handle type="target" position={Position.Left} id="tick" />
      <Handle type="source" position={Position.Right} id="audio" />
      <Handle type="target" position={Position.Left} id="frequency" />
      <div style={{ fontWeight: 600, marginBottom: 8 }}>NOTE</div>
      {/* Parameters */}
      <label style={{ display: 'block', fontSize: 12 }}>
        Frequency
        {/* TODO: need to handle how this changes if the frequency LFO input 
            is set I think I want it to be added to the LFO output, so I don't 
             need a builtin offset in the oscillator 
          */}
        <input
          type="number"
          min={0.01}
          value={data.frequency}
          onChange={(event) =>
            data.onFrequencyChange(id, Number(event.target.value))
          }
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
      <label style={{ display: 'block', fontSize: 12 }}>
        Duration
        <input
          type="number"
          min={60}
          max={16000}
          value={data.duration}
          onChange={(event) =>
            data.onDurationChange(id, Number(event.target.value))
          }
          style={{ display: 'block', width: '100%', marginTop: 4 }}
        />
      </label>
    </div>
  );
}
