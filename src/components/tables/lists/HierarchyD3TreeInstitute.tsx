import React, { useRef, useEffect, useState, useMemo } from 'react';
import Tree from 'react-d3-tree';
import Label from '../../form/Label';
import { Select, SelectTrigger } from '../../ui/cn/select';
import { SelectItem, SelectContent, SelectValue } from '../../ui/cn/select';
import { CreateHierarchyNodeModal } from '../../modals/CreateHierarchyNodeModal';
import { useParams } from 'react-router-dom';

// ---------------------------
// Types
// ---------------------------
interface TreeNode {
  internal_node_id: string;
  name: string;
  description?: string;
  parent_id?: string | null;
  is_active?: boolean;
  level?: number;
  project?: {
    name?: string;
  };
  children?: TreeNode[];
}

// react-d3-tree data format
interface D3TreeNode {
  name: string;
  attributes: {
    internal_node_id: string;
    description?: string;
    project?: string;
    level?: number;
    is_active: boolean;
  };
  children?: D3TreeNode[];
}

interface HierarchyD3TreeProps {
  data: TreeNode[];
  isLoading?: boolean;
}

// ---------------------------
// Data Conversion Helper
// ---------------------------
/**
 * Converts TreeNode format to react-d3-tree format
 */
function convertToD3Tree(nodes: TreeNode[]): D3TreeNode[] {
  return nodes.map((node) => ({
    name: node.name || 'Unnamed Node',
    attributes: {
      internal_node_id: node.internal_node_id,
      description: node.description || '',
      project: node.project?.name || '',
      level: node.level ?? 0,
      is_active: node.is_active ?? true,
    },
    children: node.children && node.children.length > 0
      ? convertToD3Tree(node.children)
      : undefined,
  }));
}

// ---------------------------
// Custom Node Renderer
// ---------------------------
interface CustomNodeProps {
  nodeDatum: D3TreeNode & { __rd3t?: { collapsed?: boolean } };
  toggleNode: () => void;
  setModalOpen: (open: boolean) => void;
  setSelectedParentNodeId: (id: string) => void;
}

const CustomNode: React.FC<CustomNodeProps> = ({
  nodeDatum,
  toggleNode,
  setModalOpen,
  setSelectedParentNodeId,
}) => {
  console.log(nodeDatum,"this is the node datum");
  const hasChildren = nodeDatum.children && nodeDatum.children.length > 0;
  const isActive = nodeDatum.attributes.is_active;
  const project = nodeDatum.attributes.project;
  const level = nodeDatum.attributes.level ?? 0;
  const isCollapsed = nodeDatum.__rd3t?.collapsed ?? false;

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/issue_flow/${nodeDatum.attributes.internal_node_id}`;
  };

  // Card dimensions
  const descriptionHeight = nodeDatum.attributes.description ? 20 : 0;
  const cardWidth = 300; // Between 220-260px
  const padding = 40;
  const titleHeight = 20;
  const statusBadgeHeight = 10;
  const projectHeight = project ? 18 : 10;
  const buttonHeight = 26;
  const buttonSpacing = 8; // Spacing between buttons
  const spacing =0;
  
  // Calculate card height: padding + title row + spacing + project + spacing + button1 + buttonSpacing + button2 + padding
  const cardHeight = padding + Math.max(titleHeight, statusBadgeHeight) + 
                      (project ? spacing + projectHeight : 0) + 
                      spacing + buttonHeight + buttonSpacing + buttonHeight + padding;

  return (
    <g>
      {/* Expand/Collapse Button - Top Left (outside card) */}
      {hasChildren && (
        <g transform={`translate(-${cardWidth / 2 + 20}, -${cardHeight / 2 - 12})`}>
          <foreignObject x={-10} y={-10} width={20} height={20}>
            <button
              onClick={toggleNode}
              className="w-5 h-5 rounded-full bg-[#094C81] hover:bg-[#073954] text-white font-semibold flex items-center justify-center transition-colors duration-200 cursor-pointer text-sm"
            >
              {isCollapsed ? '+' : '−'}
            </button>
          </foreignObject>
        </g>
      )}

      {/* Level Indicator - Top Right (outside card) */}
      {level > 0 && (
        <g transform={`translate(${cardWidth / 2 + 20}, -${cardHeight / 2 - 12})`}>
          <foreignObject x={0} y={0} width={28} height={18}>
            <div className="w-7 h-[18px] rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-[10px] font-semibold text-gray-600">L{level}</span>
            </div>
          </foreignObject>
        </g>
      )}

      {/* Main Card using foreignObject for Tailwind styling */}
      <foreignObject
        x={-cardWidth / 2}
        y={-cardHeight / 2}
        width={cardWidth}
        height={cardHeight}
      >
        <div
          className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-lg hover:border-[#094C81] hover:shadow-xl transition-all duration-200 cursor-pointer p-5 flex flex-col"
        >
          {/* Header Row: Title and Status Badge */}
          <div className="flex items-start justify-between mb-3">
            {/* Title - Top Left */}
            <h3 className="text-[#094C81] text-base font-semibold flex-1 pr-2 line-clamp-2">
              {nodeDatum.name.length > 28
                ? `${nodeDatum.name.substring(0, 28)}...`
                : nodeDatum.name}
            </h3>

            {/* Status Badge - Top Right */}
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap ${
                isActive
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Description - Centered */}
          {nodeDatum.attributes.description && (
            <div className="mb-3" style={{ height: descriptionHeight }}>
              <p className="text-gray-600 font-bold text-center text-sm line-clamp-2">
                {nodeDatum.attributes.description.length > 50
                  ? `${nodeDatum.attributes.description.substring(0, 50)}...`
                  : nodeDatum.attributes.description}
              </p>
            </div>
          )}

          {/* Buttons Container */}
          <div className="flex flex-row justify-center gap-3">
            {/* Details Button */}
            <button
              onClick={handleViewDetailsClick}
              className="w-full bg-[#094C81] hover:bg-[#073954] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-xs"
            >
              Details
            </button>
            {/* Add Child Node Button */}
            <button
              onClick={() => {
                setSelectedParentNodeId(nodeDatum.attributes.internal_node_id);
                setModalOpen(true);
              }}
              className="w-full bg-[#094C81] hover:bg-[#073954] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-xs"
            >
              Add Child Node
            </button>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};


// ---------------------------
// Main Component
// ---------------------------
const HierarchyD3TreeInstitute: React.FC<HierarchyD3TreeProps> = ({
  data,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedRootNodeId, setSelectedRootNodeId] = useState<string>('');
  const [selectedParentNodeId, setSelectedParentNodeId] = useState<string | null>(null);
  // params id
  const { id:project_id } = useParams<{ id: string }>();
  if (!project_id) {
    throw new Error('Project ID is required');

  }
  console.log(data,"this is the data");
  const [isModalOpen, setModalOpen] = useState(false);
  // Build tree from flat list using the simple technique
  const buildTree = (nodes: TreeNode[]): TreeNode[] => {
    if (!nodes || nodes.length === 0) return [];

    const nodeMap = new Map<string, TreeNode>();

    // Initialize map with each node's id and empty children array
    nodes.forEach((node) => {
      nodeMap.set(node.internal_node_id, {
        ...node,
        children: [], // Initialize with empty children array
      });
    });

    const tree: TreeNode[] = [];

    // Build parent-child relationships
    nodes.forEach((node) => {
      const nodeId = node.internal_node_id;
      if (!nodeId) return;

      const currentNode = nodeMap.get(nodeId);
      if (!currentNode) return;

      if (node.parent_id) {
        // Node has a parent - add it to parent's children
        const parent = nodeMap.get(node.parent_id);
        if (parent && parent.children) {
          parent.children.push(currentNode);
        }
      } else {
        // No parent_id means root node
        tree.push(currentNode);
      }
    });

    return tree;
  };

  // Build tree and get root nodes
  const { d3TreeData, rootNodeOptions } = useMemo(() => {
    if (!data || data.length === 0) {
      return { d3TreeData: null, rootNodeOptions: [] };
    }
    
    
    // Build tree from flat list
    const treeNodes = buildTree(data);
    
    
    // Log each root node and its full hierarchy
    const logHierarchy = (node: TreeNode, depth = 0, prefix = '') => {
      const indent = '  '.repeat(depth);
      const nodeInfo = `${indent}${prefix}${node.name} (Level ${node.level}, ID: ${node.internal_node_id}, Children: ${node.children?.length || 0})`;
      
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const isLast = index === node.children!.length - 1;
          const childPrefix = isLast ? '└─ ' : '├─ ';
          logHierarchy(child, depth + 1, childPrefix);
        });
      }
    };
    
    if (treeNodes && treeNodes.length > 0) {
      treeNodes.forEach((rootNode, index) => {
        logHierarchy(rootNode);
      });
    }
    
    // Convert to D3 tree format
    const converted = convertToD3Tree(treeNodes);
    
    // Create root node options for select dropdown
    const options = treeNodes.map((node) => ({
      value: node.internal_node_id,
      label: `${node.name}${node.project?.name ? ` (${node.project.name})` : ''}`,
    }));
    
     
    return {
      d3TreeData: converted,
      rootNodeOptions: options,
    };
  }, [data]);

  // Set default selected root node when data changes
  useEffect(() => {
    if (rootNodeOptions.length > 0) {
      // If no selection or current selection is not in options, select first root node
      if (!selectedRootNodeId || !rootNodeOptions.find(opt => opt.value === selectedRootNodeId)) {
        setSelectedRootNodeId(rootNodeOptions[0].value);
      }
    }
  }, [rootNodeOptions, selectedRootNodeId]);

  // Get selected root node D3 data
  const selectedD3TreeData = useMemo(() => {
    if (!d3TreeData || !selectedRootNodeId || !Array.isArray(d3TreeData)) return null;
    
    const selected = d3TreeData.find((node) => node.attributes.internal_node_id === selectedRootNodeId);
    return selected ? [selected] : null;
  }, [d3TreeData, selectedRootNodeId]);
  // Calculate translate and dimensions based on container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
        // Center the tree horizontally, position vertically near top
        setTranslate({
          x: width / 2,
          y: 80, // Top padding
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [selectedD3TreeData]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading hierarchy tree...</p>
        </div>
      </div>
    );
  }

  if (!d3TreeData || (Array.isArray(d3TreeData) && d3TreeData.length === 0)) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 text-lg font-medium">No hierarchy nodes found</p>
          <p className="text-gray-400 text-sm mt-2">
            Create a hierarchy node to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Root Node Selection */}
      

      {/* Tree Container */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[600px] bg-[#F9FBFC] rounded-lg border border-gray-200 overflow-hidden"
        style={{ position: 'relative' }}
      >
        {rootNodeOptions.length > 1 && (
        <div className=" w-[350px] rounded-lg  p-4">
          <Label className="text-[#094C81] text-sm font-medium">Select Root Node</Label>
          {/* use the shadcn select component */}
          <Select value={selectedRootNodeId} onValueChange={(value) => setSelectedRootNodeId(value)}>
            <SelectTrigger className="w-full h-10 border border-gray-300 px-4 py-3 rounded-md focus:ring focus:ring-[#094C81] focus:border-transparent transition-all duration-200 outline-none"> 
                <SelectValue placeholder="Select a root node to display" />
            </SelectTrigger>
            <SelectContent>
                {rootNodeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}
        {/* Custom styles for tree links */}
        <style>{`
          .rd3t-link {
            stroke: #94A3B8 !important;
            stroke-width: 2.5px !important;
            fill: none !important;
          }
        `}</style>
        
        {selectedD3TreeData ? (
          <>
            {/* Tree Container */}
            <div
              id="tree-container"
              className="w-full h-full"
              style={{
                width: '100%',
                height: dimensions.height || '600px',
              }}
            >
              <Tree
                data={selectedD3TreeData}
                translate={translate}
                orientation="vertical"
                pathFunc="straight"
                separation={{ siblings: 2.5, nonSiblings: 2 }}
                nodeSize={{ x: 220, y: 250 }}
                zoom={0.75}
                scaleExtent={{ min: 0.1, max: 2 }}
                enableLegacyTransitions={true}
                transitionDuration={300}
                renderCustomNodeElement={(rd3tProps: {
                  nodeDatum: unknown;
                  toggleNode: () => void;
                }) => {
                  const nodeDatum = rd3tProps.nodeDatum as D3TreeNode & { __rd3t?: { collapsed?: boolean } };
                  return (
                    <CustomNode
                      setSelectedParentNodeId={setSelectedParentNodeId}
                      setModalOpen={setModalOpen}
                      nodeDatum={nodeDatum}
                      toggleNode={rd3tProps.toggleNode}
                    />
                  );
                }}
              />
            </div>

            {/* Controls Overlay */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 border border-gray-200">
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-[#094C81] mb-2">Controls:</p>
                <p>• Scroll to zoom</p>
                <p>• Drag to pan</p>
                <p>• Click nodes to expand/collapse</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center py-12 min-h-[400px]">
            <div className="text-center">
              <p className="text-gray-500 text-lg font-medium">No root node selected</p>
              <p className="text-gray-400 text-sm mt-2">
                Please select a root node from the dropdown above.
              </p>
            </div>
          </div>
        )}
      </div>
      <CreateHierarchyNodeModal
        parent_hierarchy_node_id={selectedParentNodeId}
        project_id={project_id }
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedParentNodeId(null);
        }}
      />
    </div>
  );
};

export default HierarchyD3TreeInstitute;

