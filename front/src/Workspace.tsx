import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls,
  BackgroundVariant,
  type Node as ReactFlowNode,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Edge as FlowEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { LayerBox } from './LayerBox';
import { Button } from '@mantine/core';
import { useGraphStore } from './store';
import { GRID_SIZE } from './config';

// Define nodeTypes outside component to prevent recreation
const nodeTypes: NodeTypes = {
  default: LayerBox
};

export function Workspace() {
  const nodes = useGraphStore(state => state.nodes);
  const edges = useGraphStore(state => state.edges);
  const selectedId = useGraphStore(state => state.selectedId);
  const { updateNodes, updateEdges, setSelectedId, deleteNode, addEdge } = useGraphStore();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => updateNodes(applyNodeChanges(changes, nodes)),
    [nodes, updateNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => updateEdges(applyEdgeChanges(changes, edges)),
    [edges, updateEdges]
  );

  const handleConnect: OnConnect = useCallback((params) => {
    if (!params.source || !params.target) return;

    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    if (!sourceNode || !targetNode) return;

    // Create the edge
    const newEdge: FlowEdge = {
      id: `${sourceNode.id}-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: params.sourceHandle || undefined,
      targetHandle: params.targetHandle || undefined,
      type: 'default'
    };
    addEdge(newEdge);
  }, [nodes, addEdge]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: ReactFlowNode) => {
    setSelectedId(node.id);
  }, [setSelectedId]);

  const onPaneClick = useCallback(() => {
    setSelectedId(null);
  }, [setSelectedId]);

  const handleDelete = useCallback(() => {
    if (selectedId) deleteNode(selectedId);
  }, [selectedId, deleteNode]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={GRID_SIZE} size={1}/>
        <Controls />
        <Panel position="top-right" style={{ padding: '10px' }}>
          <Button
            color="red"
            onClick={handleDelete}
            disabled={!selectedId}
            style={{ opacity: selectedId ? 1 : 0.5 }}
          >
            Delete Selected Node
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

Workspace.displayName = 'Workspace';
