// Third-party
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  type XYPosition,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type ReactFlowInstance,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// First-party
import {
  NodeCreateMenu,
  FlowNodeMenuEntries,
  type FlowNodeMenuEntry,
  type AnyFlowNode,
} from './reactFlowNodes/picker';
import { WebAudioRuntime } from './engine';
import { Transport, TransportRuntime } from './scheduler';
import type { MetroNodeData } from './reactFlowNodes/metro';
import type { NoteNodeData } from './reactFlowNodes/note';
import type { OutputNodeData } from './reactFlowNodes/output';
import type { FilterNodeData } from './reactFlowNodes/filter';
import type { LfoNodeData } from './reactFlowNodes/lfo';

// Set up initial data
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

type MenuState = {
  screenPosition: XYPosition;
  flowPosition: XYPosition;
} | null;

const nodeTypes: NonNullable<ReactFlowProps['nodeTypes']> = Object.fromEntries(
  FlowNodeMenuEntries.map((entry) => [entry.type, entry.node] as const),
);

export default function App() {
  // Set up main variables
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    // NOTE: runtime / transport are started on user input
    runtimeRef.current = new WebAudioRuntime(audioContextRef.current);
    const runtimeContext = new TransportRuntime(runtimeRef.current);
    transportRef.current = new Transport(runtimeContext);
    return () => {
      transportRef.current!.stop();
    };
  }, []);

  // Generic react boilerplate for the ReactFlow graph
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [menu, setMenu] = useState<MenuState>(null);
  const updateNodeData = useCallback(
    (
      nodeId: string,
      updater: (data: AnyFlowNode['data']) => AnyFlowNode['data'],
    ) => {
      setNodes((nodesSnapshot) =>
        nodesSnapshot.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: updater(node.data as AnyFlowNode['data']),
              }
            : node,
        ),
      );
    },
    [],
  );
  // More boilerplate to set up callbacks
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback((params: Connection) => {
    // For now, we have a one-to-one mapping with patch graph node handles
    //  and source handles
    const result = runtimeRef.current?.connect(
      {
        nodeHandle: params.source,
        portName: params.sourceHandle!,
      },
      {
        nodeHandle: params.target,
        portName: params.targetHandle!,
      },
    );
    if (result?.isOk()) {
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot));
    }
  }, []);
  // Must be nullable because we are creating the instance in this component
  // So we dont have access to it until the comoponent is created
  // This is then set in `onInit()`
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const runtimeRef = useRef<WebAudioRuntime | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);

  // Menu creation / distruction callbacks
  const onPaneContextMenu: NonNullable<ReactFlowProps['onPaneContextMenu']> =
    useCallback(
      (event) => {
        event.preventDefault();
        const screenPosition = { x: event.clientX, y: event.clientY };
        const flowPosition = reactFlowRef.current!.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        setMenu({
          screenPosition,
          flowPosition,
        });
      },
      [setMenu],
    );
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  // Menu click callback
  const onMenuSelect = (entry: FlowNodeMenuEntry) => {
    setMenu(null);
    // TODO: Create a proper union type for this
    // And then create the nodeData with the corresponding type
    let nodeData: AnyFlowNode['data'];
    let nodeId: string;
    // We are kind of mapping flow nodes to patch graph nodes in this menu
    switch (entry.type) {
      case 'metro':
        {
          const data = { bpm: 120 };
          const result = runtimeRef.current!.createNode({
            type: 'metro',
            data,
          });
          if (result.isErr()) return;
          nodeData = {
            data: data,
            onBpmChange: (bpm: number) => {
              runtimeRef.current?.setParamImmediate(result.value, 'bpm', bpm);
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as MetroNodeData),
                data: {
                  ...(nodeData as MetroNodeData).data,
                  bpm,
                },
              }));
            },
          };
          nodeId = result.value;
        }
        break;
      case 'note':
        {
          const data = { frequency: 440, duration: 0.5 };
          const result = runtimeRef.current!.createNode({ type: 'note', data });
          if (result.isErr()) return;
          nodeData = {
            frequency: data.frequency,
            duration: data.duration,
            onFrequencyChange: (frequency: number) => {
              runtimeRef.current?.setParamImmediate(
                result.value,
                'frequency',
                frequency,
              );
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as NoteNodeData),
                frequency,
              }));
            },
            onDurationChange: (duration: number) => {
              runtimeRef.current?.setParamImmediate(
                result.value,
                'duration',
                duration,
              );
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as NoteNodeData),
                duration,
              }));
            },
          };
          nodeId = result.value;
        }
        break;
      case 'filter':
        {
          const data = { cutoff: 440 };
          const result = runtimeRef.current!.createNode({
            type: 'filter',
            data,
          });
          if (result.isErr()) return;
          nodeData = {
            data: data,
            onCutoffChange: (cutoff) => {
              runtimeRef.current?.setParamImmediate(
                result.value,
                'cutoff',
                cutoff,
              );
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as FilterNodeData),
                data: {
                  ...(nodeData as FilterNodeData).data,
                  cutoff,
                },
              }));
            },
          };
          nodeId = result.value;
        }
        break;
      case 'lfo':
        {
          const data = { frequency: 50, gain: 1 };
          const result = runtimeRef.current!.createNode({ type: 'lfo', data });
          if (result.isErr()) return;
          nodeData = {
            data: data,
            onFrequencyChange: (frequency: number) => {
              runtimeRef.current?.setParamImmediate(
                result.value,
                'frequency',
                frequency,
              );
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as LfoNodeData),
                data: {
                  ...(nodeData as LfoNodeData).data,
                  frequency,
                },
              }));
            },
            onGainChange: (gain: number) => {
              runtimeRef.current?.setParamImmediate(result.value, 'gain', gain);
              updateNodeData(result.value, (nodeData) => ({
                ...(nodeData as LfoNodeData),
                data: {
                  ...(nodeData as LfoNodeData).data,
                  gain,
                },
              }));
            },
          };
          nodeId = result.value;
        }
        break;
      case 'audioOutput':
        {
          const result = runtimeRef.current!.createNode({ type: 'output' });
          if (result.isErr()) return;
          const data: OutputNodeData = { destination: 'default' };
          nodeData = data;
          nodeId = result.value;
        }
        break;
    }
    setNodes((nodes) =>
      nodes.concat({
        id: nodeId,
        type: entry.type,
        position: menu!.flowPosition,
        data: nodeData,
      }),
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <button
        id="transport-start"
        onClick={() => {
          transportRef.current?.start();
          setPlaying(true);
        }}
      >
        Start
      </button>
      <button
        id="transport-stop"
        onClick={() => {
          transportRef.current?.stop();
          setPlaying(false);
        }}
      >
        Stop
      </button>
      <label>{playing ? 'PLAYING' : 'STOPPED'}</label>
      <ReactFlow
        onInit={(instance) => {
          reactFlowRef.current = instance;
        }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background />
      </ReactFlow>
      {menu && (
        <NodeCreateMenu
          position={menu.screenPosition}
          onSelect={onMenuSelect}
        />
      )}
    </div>
  );
}
