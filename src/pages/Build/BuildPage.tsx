import React, { useState, useRef, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

import {
  Workflow,
  Sparkles,
  ArrowRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sliders,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

import { useWorkflow } from '@/context/ProjectContext';
import {
  NodePalette,
  WorkflowPropertiesPanel,
  WorkflowStatusBar,
  CustomWorkflowNode,
} from '@/components/workflow';
import { workflowToReactFlow } from '@/services/workflow';
import type { NodeCategory, NodeSubtype, CustomNodeData } from '@/types/workflow';

const nodeTypes = {
  custom: CustomWorkflowNode,
};

export const BuildPage: React.FC = () => {
  const navigate = useNavigate();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const {
    workflow,
    validation,
    selectedNodeId,
    setSelectedNodeId,
    addNode,
    removeNode,
    updateNodeConfig,
    connectNodes,
    removeConnection,
    saveWorkflow,
    resetToStarter,
  } = useWorkflow();

  const [isPaletteOpen, setIsPaletteOpen] = useState(true);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Sync React Flow nodes & edges from serializable workflow
  const { nodes: rfNodes, edges: rfEdges } = useMemo(() => {
    return workflowToReactFlow(workflow);
  }, [workflow]);

  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>(rfNodes);
  const [edges, setEdges] = useState<Edge[]>(rfEdges);

  // Update internal React Flow state when workflow changes from context
  React.useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
  }, [rfNodes, rfEdges]);

  // Node position / selection changes
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    []
  );

  // Edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setEdges((eds) => applyEdgeChanges(changes, eds));
      changes.forEach((c) => {
        if (c.type === 'remove') {
          removeConnection(c.id);
        }
      });
    },
    [removeConnection]
  );

  // Connection creation
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      const edgeId = `edge-${params.source}-${params.target}-${params.sourceHandle || 'def'}`;
      connectNodes({
        id: edgeId,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
      });
    },
    [connectNodes]
  );

  // Node Selection
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNodeId(node.id);
      setIsPropertiesOpen(true);
    },
    [setSelectedNodeId]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, [setSelectedNodeId]);

  // Drag and Drop from Node Palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const category = event.dataTransfer.getData('application/reactflow/category') as NodeCategory;
      const subtype = event.dataTransfer.getData('application/reactflow/subtype') as NodeSubtype;

      if (!category || !subtype || !reactFlowInstance || !reactFlowWrapper.current) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNode(category, subtype, position);
    },
    [reactFlowInstance, addNode]
  );

  // Selected node lookup for Properties Panel
  const selectedNodeDescriptor = useMemo(() => {
    if (!selectedNodeId) return null;
    return workflow.nodes.find((n) => n.id === selectedNodeId) || null;
  }, [workflow.nodes, selectedNodeId]);

  // Handler for Save with user feedback
  const handleSave = () => {
    saveWorkflow();
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 2500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] -my-4 -mx-4 md:-mx-8 overflow-hidden bg-surface-subtle">
      {/* Top Header */}
      <div className="px-6 py-3 bg-white border-b border-surface-border flex items-center justify-between shrink-0">
        <PageHeader
          stepNumber="01"
          title="BUILD YOUR SAFETY AI"
          subtitle="Wire the AI workflow that turns safety data into a safety decision."
          badge={<Badge variant="primary">STARTER WORKFLOW</Badge>}
          className="p-0 border-none space-y-0"
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/teach')}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Next: Teach
              </Button>
            </div>
          }
        />
      </div>

      {/* Main Studio Area: Left Palette | Center Canvas | Right Properties */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* Left: Node Palette */}
        {isPaletteOpen ? (
          <div className="w-64 xl:w-72 shrink-0 h-full flex flex-col z-10 transition-all shadow-subtle">
            <NodePalette
              onAddNode={(cat, sub) => {
                addNode(cat, sub);
              }}
            />
          </div>
        ) : (
          <div className="absolute left-3 top-3 z-20">
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="p-2 rounded-md bg-white border border-surface-border shadow-subtle text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              title="Open Node Palette"
            >
              <PanelLeftOpen className="w-4 h-4 text-brand-primary" />
              <span>Palette</span>
            </button>
          </div>
        )}

        {/* Center: React Flow Canvas */}
        <div ref={reactFlowWrapper} className="flex-1 h-full relative overflow-hidden bg-slate-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            fitView
            minZoom={0.2}
            maxZoom={1.8}
            deleteKeyCode={['Backspace', 'Delete']}
            className="w-full h-full"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1.2} color="#cbd5e1" />
            <Controls className="!bg-white !border !border-surface-border !shadow-sm !rounded-md" />
            <MiniMap
              nodeStrokeColor="#0F513E"
              nodeColor="#e2e8f0"
              maskColor="rgba(241, 245, 249, 0.7)"
              className="!border !border-surface-border !rounded-md hidden lg:block"
            />

            {/* Canvas Header Overlay */}
            <Panel position="top-left" className="m-3 flex items-center gap-2">
              {isPaletteOpen && (
                <button
                  type="button"
                  onClick={() => setIsPaletteOpen(false)}
                  className="p-1.5 rounded bg-white/90 backdrop-blur border border-surface-border text-slate-600 hover:text-slate-900 shadow-xs text-xs"
                  title="Collapse Palette"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              )}
            </Panel>

            {/* Notification Toast */}
            {saveSuccessNotification && (
              <Panel position="top-center" className="m-4">
                <div className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
                  <span>✓ Workflow saved locally!</span>
                </div>
              </Panel>
            )}

            {/* Empty State Overlay */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                <div className="max-w-md w-full bg-white/95 backdrop-blur-sm p-6 rounded-xl border border-surface-border shadow-lg text-center pointer-events-auto space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-brand-primary flex items-center justify-center mx-auto border border-emerald-200">
                    <Workflow className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-foreground uppercase tracking-wider font-mono">
                      BUILD YOUR AI SAFETY WORKFLOW
                    </h3>
                    <p className="text-xs text-surface-foreground-muted mt-1 leading-relaxed">
                      Drag a component from the left panel onto the canvas, or click below to restore the standard safety pipeline.
                    </p>
                  </div>
                  <div className="p-2.5 rounded bg-surface-subtle text-[11px] font-mono text-slate-600 border border-surface-border">
                    Suggested starting point: Camera → AI Model → Safety Condition → Action
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={resetToStarter}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Load Starter Workflow
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </ReactFlow>
        </div>

        {/* Right: Properties Panel */}
        {isPropertiesOpen ? (
          <div className="w-72 xl:w-80 shrink-0 h-full flex flex-col z-10 transition-all shadow-subtle">
            <WorkflowPropertiesPanel
              selectedNode={selectedNodeDescriptor}
              onClose={() => setSelectedNodeId(null)}
              onUpdateConfig={updateNodeConfig}
              onDeleteNode={removeNode}
            />
          </div>
        ) : (
          <div className="absolute right-3 top-3 z-20">
            <button
              type="button"
              onClick={() => setIsPropertiesOpen(true)}
              className="p-2 rounded-md bg-white border border-surface-border shadow-subtle text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold"
              title="Open Properties Panel"
            >
              <Sliders className="w-4 h-4 text-brand-primary" />
              <span>Properties</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom: Workflow Status & Validation Bar */}
      <WorkflowStatusBar
        nodeCount={workflow.nodes.length}
        connectionCount={workflow.connections.length}
        validation={validation}
        nodes={workflow.nodes}
        onSave={handleSave}
        onRestoreStarter={resetToStarter}
        onContinue={() => {
          saveWorkflow();
          navigate('/teach');
        }}
      />
    </div>
  );
};

