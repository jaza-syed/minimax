// Third-party
import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  type XYPosition,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
  type EdgeMouseHandler,
  type NodeMouseHandler,
  type ReactFlowInstance,
  type ReactFlowProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// First-party
import {
  type AnyFlowNode,
  type FlowNodeByType,
  flowNodeTypes,
  isFlowNodeOfType,
  type FlowNodeMenuElement,
  type FlowNodeType,
} from './flow/nodeRegistry';
import { NodeCreateMenu } from './flow/NodeCreateMenu';
import {
  EdgeContextMenu,
  type EdgeContextMenuAction,
} from './flow/EdgeContextMenu';
import {
  NodeContextMenu,
  type NodeContextMenuAction,
} from './flow/NodeContextMenu';
import { createFlowNode } from './flow/createFlowNode';
import { WebAudioRuntime } from './engine';
import { Transport, TransportRuntime } from './scheduler';
import type { PatchGraphNodeHandle, PatchGraphPortId } from './types';

// Set up initial data
const initialNodes: AnyFlowNode[] = [];
const initialEdges: Edge[] = [];

type CreateMenuState = {
  screenPosition: XYPosition;
  flowPosition: XYPosition;
} | null;

type NodeContextMenuState = {
  screenPosition: XYPosition;
  nodeId: PatchGraphNodeHandle;
} | null;

type EdgeContextMenuState = {
  screenPosition: XYPosition;
  edgeId: string;
  outlet: PatchGraphPortId;
  inlet: PatchGraphPortId;
} | null;

function updateTypedNode<K extends FlowNodeType>(
  node: FlowNodeByType[K],
  updater: (data: FlowNodeByType[K]['data']) => FlowNodeByType[K]['data'],
): FlowNodeByType[K] {
  return {
    ...node,
    data: updater(node.data),
  };
}

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
  const [createMenu, setCreateMenu] = useState<CreateMenuState>(null);
  const [nodeContextMenu, setNodeContextMenu] =
    useState<NodeContextMenuState>(null);
  const [edgeContextMenu, setEdgeContextMenu] =
    useState<EdgeContextMenuState>(null);
  // updateNodeData is a helper function that allows calls `setNodes` on
  // any node type. This keeps the graph UI in sync with the audio node runtime
  const updateNodeData = useCallback(function updateNodeData<
    K extends FlowNodeType,
  >(
    nodeId: string,
    type: K,
    updater: (data: FlowNodeByType[K]['data']) => FlowNodeByType[K]['data'],
  ) {
    setNodes((nodesSnapshot) =>
      nodesSnapshot.map(
        (node): AnyFlowNode =>
          node.id === nodeId && isFlowNodeOfType(node, type)
            ? updateTypedNode(node, updater)
            : node,
      ),
    );
  }, []);
  // More boilerplate to set up callbacks
  const onNodesChange = useCallback(
    (changes: NodeChange<AnyFlowNode>[]) =>
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
  const reactFlowRef = useRef<ReactFlowInstance<AnyFlowNode, Edge> | null>(
    null,
  );
  const runtimeRef = useRef<WebAudioRuntime | null>(null);
  const transportRef = useRef<Transport | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);

  // Menu creation / distruction callbacks
  const onPaneContextMenu: NonNullable<ReactFlowProps['onPaneContextMenu']> =
    useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
      const screenPosition = { x: event.clientX, y: event.clientY };
      const flowPosition = reactFlowRef.current!.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setNodeContextMenu(null);
      setEdgeContextMenu(null);
      setCreateMenu({
        screenPosition,
        flowPosition,
      });
    }, []);
  const onNodeContextMenu: NodeMouseHandler<AnyFlowNode> = useCallback(
    (event, node) => {
      event.preventDefault();
      event.stopPropagation();
      setCreateMenu(null);
      setEdgeContextMenu(null);
      setNodeContextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        nodeId: node.id,
      });
    },
    [],
  );
  const onEdgeContextMenu: EdgeMouseHandler<Edge> = useCallback(
    (event, edge) => {
      if (!edge.sourceHandle || !edge.targetHandle) return;

      event.preventDefault();
      event.stopPropagation();
      setCreateMenu(null);
      setNodeContextMenu(null);
      setEdgeContextMenu({
        screenPosition: { x: event.clientX, y: event.clientY },
        edgeId: edge.id,
        outlet: {
          nodeHandle: edge.source,
          portName: edge.sourceHandle,
        },
        inlet: {
          nodeHandle: edge.target,
          portName: edge.targetHandle,
        },
      });
    },
    [],
  );
  const onPaneClick = useCallback(() => {
    setCreateMenu(null);
    setNodeContextMenu(null);
    setEdgeContextMenu(null);
  }, []);

  // Menu click callback
  const onMenuClick = useCallback(
    (element: FlowNodeMenuElement) => {
      setCreateMenu(null);
      if (!createMenu || !runtimeRef.current) return;

      const node = createFlowNode({
        element,
        position: createMenu.flowPosition,
        runtime: runtimeRef.current,
        updateNodeData,
      });
      if (!node) return;

      setNodes((nodes) => nodes.concat(node));
    },
    [createMenu, updateNodeData],
  );
  const onNodeContextMenuClick = useCallback(
    (action: NodeContextMenuAction) => {
      setNodeContextMenu(null);
      if (!runtimeRef.current) return;

      switch (action.type) {
        case 'delete': {
          const result = runtimeRef.current.deleteNode(action.nodeId);
          if (result.isErr()) return;

          setNodes((nodes) =>
            nodes.filter((node) => node.id !== action.nodeId),
          );
          setEdges((edges) =>
            edges.filter(
              (edge) =>
                edge.source !== action.nodeId && edge.target !== action.nodeId,
            ),
          );
          break;
        }
      }
    },
    [],
  );
  const onEdgeContextMenuClick = useCallback(
    (action: EdgeContextMenuAction) => {
      setEdgeContextMenu(null);
      if (!runtimeRef.current) return;

      switch (action.type) {
        case 'delete': {
          const result = runtimeRef.current.disconnect(
            action.outlet,
            action.inlet,
          );
          if (result.isErr()) return;

          setEdges((edges) =>
            edges.filter((edge) => edge.id !== action.edgeId),
          );
          break;
        }
      }
    },
    [],
  );

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
        nodeTypes={flowNodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onEdgeContextMenu={onEdgeContextMenu}
        onPaneContextMenu={onPaneContextMenu}
        onPaneClick={onPaneClick}
        fitView
      >
        <Background />
      </ReactFlow>
      {createMenu && (
        <NodeCreateMenu
          position={createMenu.screenPosition}
          onClick={onMenuClick}
        />
      )}
      {nodeContextMenu && (
        <NodeContextMenu
          id={nodeContextMenu.nodeId}
          position={nodeContextMenu.screenPosition}
          onClick={onNodeContextMenuClick}
        />
      )}
      {edgeContextMenu && (
        <EdgeContextMenu
          edgeId={edgeContextMenu.edgeId}
          outlet={edgeContextMenu.outlet}
          inlet={edgeContextMenu.inlet}
          position={edgeContextMenu.screenPosition}
          onClick={onEdgeContextMenuClick}
        />
      )}
    </div>
  );
}
