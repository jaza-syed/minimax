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
} from './reactFlowNodes/picker';
import { WebAudioRuntime } from './engine';
import { Transport, TransportRuntime } from './scheduler';

// Set up initial data
const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

type MenuState = {
  screenPosition: XYPosition;
  flowPosition: XYPosition;
} | null;

const nodeTypes = Object.fromEntries([
  FlowNodeMenuEntries.map((entry) => [entry.type, entry.node]),
]);

export default function App() {
  // Generic react boilerplate for the ReactFlow graph
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [menu, setMenu] = useState<MenuState>(null);
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
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );
  // Must be nullable because we are creating the instance in this component
  // So we dont have access to it until the comoponent is created
  // This is then set in `onInit()`
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const runtimeRef = useRef<WebAudioRuntime | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

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
    // TODO: Type-safe version
    let data;
    switch (entry.type) {
      case 'metro':
        data = { bpm: 120 };
        break;
      case 'note':
        data = { duration: 0.25, frequency: 440 };
        break;
      case 'audioOutput':
        data = {};
        break;
    }
    setNodes((nodes) =>
      nodes.concat({
        id: crypto.randomUUID(),
        type: entry.type,
        position: menu!.flowPosition,
        data: data,
      }),
    );
    setMenu(null);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
