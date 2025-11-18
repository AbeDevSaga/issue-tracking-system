import React, { useMemo, useRef, useEffect, useState } from 'react';
import { ArrowDownRight, CornerDownRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HierarchyNode } from '../../../redux/services/hierarchyNodeApi';
import { Card } from '../../ui/cn/card';
import Badge from '../../ui/badge/Badge';

// ---------------------------
// Types
// ---------------------------
interface TreeNode extends HierarchyNode {
  children?: TreeNode[];
}

// ---------------------------
// Hierarchy Builder Function
// ---------------------------
/**
 * Builds a hierarchical tree structure from a flat array of nodes.
 * 
 * @param flatNodes - Flat array of hierarchy nodes (may contain duplicates)
 * @returns Array of root nodes with nested children
 * 
 * Features:
 * - Normalizes duplicates using hierarchy_node_id as unique key
 * - Handles nodes with parent_id and children properties
 * - Returns only root nodes (nodes without parent_id or parent_id is null)
 */
export function buildHierarchyTree(flatNodes: HierarchyNode[]): TreeNode[] {
  if (!flatNodes || flatNodes.length === 0) {
    return [];
  }

  // Step 1: Normalize duplicates - use Map to keep only the latest occurrence
  const nodeMap = new Map<string, TreeNode>();
  
  flatNodes.forEach((node) => {
    const nodeId = node.hierarchy_node_id;
    if (nodeId) {
      // If node already exists, merge children if present
      const existingNode = nodeMap.get(nodeId);
      if (existingNode) {
        // Merge children if both have them
        if (node.children && existingNode.children) {
          existingNode.children = [...existingNode.children, ...node.children];
        } else if (node.children) {
          existingNode.children = node.children;
        }
        // Update other properties if needed
        Object.assign(existingNode, node);
      } else {
        // Create new node with empty children array
        nodeMap.set(nodeId, {
          ...node,
          children: node.children ? [...node.children] : [],
        });
      }
    }
  });

  // Step 2: Build parent-child relationships
  const nodes = Array.from(nodeMap.values());
  const childrenMap = new Map<string, TreeNode[]>();

  nodes.forEach((node) => {
    const parentId = node.parent_id;
    
    if (parentId && nodeMap.has(parentId)) {
      // Node has a parent
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(node);
    }
  });

  // Step 3: Attach children to their parents
  childrenMap.forEach((children, parentId) => {
    const parent = nodeMap.get(parentId);
    if (parent) {
      parent.children = children;
    }
  });

  // Step 4: Return only root nodes (nodes without parent_id or parent_id is null/undefined)
  const rootNodes = nodes.filter(
    (node) => !node.parent_id || node.parent_id === null
  );

  return rootNodes;
}

// ---------------------------
// Hierarchy Node Component (Recursive)
// ---------------------------
interface HierarchyNodeItemProps {
  node: TreeNode;
  level: number;
  isLast: boolean;
  path: string[];
}

const HierarchyNodeItem: React.FC<HierarchyNodeItemProps> = ({
  node,
  level,
  isLast,
  path,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasChildren = node.children && node.children.length > 0;
  const indentLevel = level * 50; // 24px per level

  // Calculate content height when expanded or children change
  useEffect(() => {
    if (contentRef.current) {
      if (isExpanded) {
        // Temporarily remove maxHeight to measure actual height
        const currentMaxHeight = contentRef.current.style.maxHeight;
        contentRef.current.style.maxHeight = 'none';
        const height = contentRef.current.scrollHeight;
        contentRef.current.style.maxHeight = currentMaxHeight;
        
        // Use requestAnimationFrame to ensure smooth transition
        requestAnimationFrame(() => {
          setContentHeight(height);
        });
      } else {
        // Set height to 0 when collapsing
        setContentHeight(0);
      }
    }
  }, [isExpanded, node.children]);

  // Update height when content changes dynamically (e.g., children are added/removed)
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (contentRef.current && isExpanded) {
          const currentMaxHeight = contentRef.current.style.maxHeight;
          contentRef.current.style.maxHeight = 'none';
          const height = contentRef.current.scrollHeight;
          contentRef.current.style.maxHeight = currentMaxHeight;
          setContentHeight(height);
        }
      });
      
      resizeObserver.observe(contentRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isExpanded, node.children]);

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't toggle if clicking on the "View Details" link
    const target = e.target as HTMLElement;
    if (target.closest('a')) {
      return;
    }
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="relative">
      {/* Node Container */}
      <div
        className="flex items-start gap-2 mb-2"
        style={{ paddingLeft: `${indentLevel}px` }}
      >
        {/* Connector Lines */}
        {level > 0 && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center">
            <div
              className="w-px bg-gray-300"
              style={{
                left: `${indentLevel - 12}px`,
                height: isLast ? '50%' : '100%',
              }}
            />
          </div>
        )}

        {/* Tree Arrow - Always show for child nodes */}
        {level > 0 && (
          <CornerDownRight className="h-10 w-5 text-gray-400 flex-shrink-0 mt-1.5" />
        )}

        {/* Spacer for root nodes without arrow */}
        {level === 0 && <div className="w-4 h-4 flex-shrink-0" />}

        {/* Node Card - Clickable if has children */}
        <Card 
          className={`flex-1 bg-gray border border-gray-200 hover:border-[#094C81] transition-colors shadow-sm ${
            hasChildren ? 'cursor-pointer' : ''
          }
          ${level === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gray'}`}
          onClick={handleCardClick}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[#1E516A] text-base">
                    {node.name}
                  </h3>
                  <Badge
                    variant="light"
                    color={node.is_active ? 'success' : 'error'}
                    size="sm"
                  >
                    {node.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {hasChildren && (
                    <ArrowDownRight 
                      className={`h-4 w-4 text-gray-400 transition-transform duration-300 ease-in-out ${
                        isExpanded ? 'rotate-0' : '-rotate-45'
                      }`}
                    />
                  )}
                </div>

                {node.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {node.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-2">
                  {node.level !== undefined && (
                    <span>Level: {node.level}</span>
                  )}
                  {node.project?.name && (
                    <span>Project: {node.project.name}</span>
                  )}
                  {hasChildren && (
                    <span className="text-[#094C81]">
                      {isExpanded ? 'Click to collapse' : 'Click to expand'} ({node.children!.length} {node.children!.length === 1 ? 'child' : 'children'})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={`/org_structure/${node.hierarchy_node_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[#094C81] hover:text-[#073954] text-sm font-medium transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Children with Animation */}
      {hasChildren && (
        <div
          ref={contentRef}
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: `${contentHeight}px`,
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0)' : 'translateY(-10px)',
          }}
        >
          <div className="relative">
            {node.children!.map((child, index) => (
              <HierarchyNodeItem
                key={child.hierarchy_node_id || index}
                node={child}
                level={level + 1}
                isLast={index === node.children!.length - 1}
                path={[...path, child.hierarchy_node_id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------
// Main Hierarchy Tree Component
// ---------------------------
interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  isLoading?: boolean;
  error?: Error | { message?: string } | null;
}

const HierarchyTree: React.FC<HierarchyTreeProps> = ({
  nodes,
  isLoading = false,
  error = null,
}) => {
  // Build tree structure from flat array
  const treeNodes = useMemo(() => {
    return buildHierarchyTree(nodes);
  }, [nodes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#094C81] mx-auto mb-4"></div>
          <p className="text-[#1E516A] text-lg">Loading hierarchy tree...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-600 text-lg">Error loading hierarchy tree</p>
          <p className="text-gray-500 text-sm mt-2">
            {error?.message || 'An error occurred'}
          </p>
        </div>
      </div>
    );
  }

  if (treeNodes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
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
    <div className="space-y-2">
      {treeNodes.map((node, index) => (
        <HierarchyNodeItem
          key={node.hierarchy_node_id || index}
          node={node}
          level={0}
          isLast={index === treeNodes.length - 1}
          path={[node.hierarchy_node_id]}
        />
      ))}
    </div>
  );
};

// ---------------------------
// Export Component
// ---------------------------
export default function HierarchyNodeListTree({ data, isLoading }: { data: HierarchyNode[], isLoading: boolean }) {
  return (
    <div className="w-full">
      <HierarchyTree nodes={data} isLoading={isLoading} />
    </div>
  );
}
