'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
  Panel,
  NodeResizer,
  Handle,
  Position,
  BaseEdge,
  getBezierPath,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

import type { StudyPlanGraph, StudyPlanNode, StudyPlanEdge, ProgramInfo } from '@/types/tqf';

// Color palette for prerequisite lines
const EDGE_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
];

// Get color based on edge ID hash
const getEdgeColor = (edgeId: string) => {
  let hash = 0;
  for (let i = 0; i < edgeId.length; i++) {
    hash = ((hash << 5) - hash) + edgeId.charCodeAt(i);
    hash = hash & hash;
  }
  return EDGE_COLORS[Math.abs(hash) % EDGE_COLORS.length];
};

// Preset colors for edge color picker
const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
];

// Custom edge components with strict Manhattan routing
const ManhattanEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: any) => {
  // Get color for this edge - use custom color if set, otherwise use default
  const customEdgeColor = data?.customColor;
  const edgeColor = customEdgeColor || getEdgeColor(id);
  
  // Get edit mode and waypoints from data
  const editMode = data?.editMode || false;
  const waypoints = data?.waypoints || [];
  const onWaypointDrag = data?.onWaypointDrag;
  const onEdgeSelect = data?.onEdgeSelect;
  const isSelected = data?.isSelected || false;
  
  // Get all node positions to avoid obstacles
  const allNodes = data?.allNodes || [];
  
  // Grid and node dimensions
  const nodeWidth = 200;
  const nodeHeight = 100;
  const gridSpacingX = 300; // Horizontal spacing between columns
  const gridSpacingY = 150; // Vertical spacing between rows
  
  // Mid-lane offset (middle of gap between rows)
  const midLaneOffset = gridSpacingY / 2; // 75px from row baseline
  
  // Check if a horizontal segment at given Y intersects any box
  const horizontalSegmentIntersectsBox = (y: number, x1: number, x2: number) => {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    
    return allNodes.some((node: any) => {
      if (!node.position) return false;
      const boxLeft = node.position.x;
      const boxRight = node.position.x + nodeWidth;
      const boxTop = node.position.y;
      const boxBottom = node.position.y + nodeHeight;
      
      // Check if horizontal line at Y crosses through this box
      return y >= boxTop && y <= boxBottom && 
             maxX >= boxLeft && minX <= boxRight;
    });
  };
  
  // Check if a vertical segment at given X intersects any box
  const verticalSegmentIntersectsBox = (x: number, y1: number, y2: number) => {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    return allNodes.some((node: any) => {
      if (!node.position) return false;
      const boxLeft = node.position.x;
      const boxRight = node.position.x + nodeWidth;
      const boxTop = node.position.y;
      const boxBottom = node.position.y + nodeHeight;
      
      // Check if vertical line at X crosses through this box
      return x >= boxLeft && x <= boxRight && 
             maxY >= boxTop && minY <= boxBottom;
    });
  };
  
  // Calculate mid-lane Y position between two rows
  const getMidLaneY = (y1: number, y2: number) => {
    const avgY = (y1 + y2) / 2;
    const rowIndex = Math.floor(avgY / gridSpacingY);
    // Mid-lane is at row baseline + half the gap to next row
    return rowIndex * gridSpacingY + gridSpacingY - midLaneOffset;
  };
  
  // Check if a horizontal mid-lane intersects any box, if so return a lower mid-lane
  const getSafeMidLaneY = (sourceX: number, targetX: number, y1: number, y2: number) => {
    let midLaneY = getMidLaneY(y1, y2);
    
    // Check if this mid-lane intersects any box
    let attempts = 0;
    while (horizontalSegmentIntersectsBox(midLaneY, sourceX, targetX) && attempts < 5) {
      // Drop down by the gap size (50px - small grid step)
      midLaneY += 50;
      attempts++;
    }
    
    return midLaneY;
  };
  
  // Generate strict Manhattan path with grid-aligned verticals
  const generatePath = () => {
    const path = [`M ${sourceX} ${sourceY}`];
    
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    
    // Minimum clearance distance from box edge before turning
    const clearanceDistance = 50; // 50px clearance
    
    // Determine if we're exiting from a side handle (left or right)
    const exitingFromSide = sourcePosition === Position.Left || sourcePosition === Position.Right;
    const exitingFromLeftSide = sourcePosition === Position.Left;
    const exitingFromRightSide = sourcePosition === Position.Right;
    
    // Try direct Manhattan routing first (vertical then horizontal, or horizontal then vertical)
    if (Math.abs(dx) > Math.abs(dy)) {
      // More horizontal - try horizontal first
      const horizontalBlocked = horizontalSegmentIntersectsBox(sourceY, sourceX, targetX);
      
      if (!horizontalBlocked) {
        // Direct horizontal then vertical
        if (exitingFromSide) {
          // Add horizontal clearance before turning vertical
          const clearanceX = exitingFromLeftSide 
            ? sourceX - clearanceDistance 
            : sourceX + clearanceDistance;
          path.push(`L ${clearanceX} ${sourceY}`);
          path.push(`L ${clearanceX} ${targetY}`);
          path.push(`L ${targetX} ${targetY}`);
        } else {
          path.push(`L ${targetX} ${sourceY}`);
          path.push(`L ${targetX} ${targetY}`);
        }
      } else {
        // Use mid-lane routing - check if mid-lane is safe, drop down if needed
        const midLaneY = getSafeMidLaneY(sourceX, targetX, sourceY, targetY);
        
        // Determine target approach direction
        const enteringTargetFromSide = targetPosition === Position.Left || targetPosition === Position.Right;
        const enteringTargetFromLeft = targetPosition === Position.Left;
        
        if (exitingFromSide) {
          // Add horizontal clearance before going to mid-lane
          const clearanceX = exitingFromLeftSide 
            ? sourceX - clearanceDistance 
            : sourceX + clearanceDistance;
          
          // 1. Horizontal clearance from source box
          path.push(`L ${clearanceX} ${sourceY}`);
          
          // 2. Vertical on grid to mid-lane
          path.push(`L ${clearanceX} ${midLaneY}`);
          
          if (enteringTargetFromSide) {
            // 3. Horizontal in mid-lane to target clearance point
            const targetClearanceX = enteringTargetFromLeft
              ? targetX - clearanceDistance
              : targetX + clearanceDistance;
            path.push(`L ${targetClearanceX} ${midLaneY}`);
            
            // 4. Vertical to target Y level
            path.push(`L ${targetClearanceX} ${targetY}`);
            
            // 5. Horizontal to target
            path.push(`L ${targetX} ${targetY}`);
          } else {
            // 3. Horizontal in mid-lane to target X
            path.push(`L ${targetX} ${midLaneY}`);
            
            // 4. Vertical on grid to target
            path.push(`L ${targetX} ${targetY}`);
          }
        } else {
          // 1. Vertical on grid to mid-lane
          path.push(`L ${sourceX} ${midLaneY}`);
          
          if (enteringTargetFromSide) {
            // 2. Horizontal in mid-lane to target clearance point
            const targetClearanceX = enteringTargetFromLeft
              ? targetX - clearanceDistance
              : targetX + clearanceDistance;
            path.push(`L ${targetClearanceX} ${midLaneY}`);
            
            // 3. Vertical to target Y level
            path.push(`L ${targetClearanceX} ${targetY}`);
            
            // 4. Horizontal to target
            path.push(`L ${targetX} ${targetY}`);
          } else {
            // 2. Horizontal in mid-lane to target X
            path.push(`L ${targetX} ${midLaneY}`);
            
            // 3. Vertical on grid to target
            path.push(`L ${targetX} ${targetY}`);
          }
        }
      }
    } else {
      // More vertical - try vertical first
      const verticalBlocked = verticalSegmentIntersectsBox(sourceX, sourceY, targetY);
      
      if (!verticalBlocked) {
        // Direct vertical then horizontal
        if (exitingFromSide) {
          // Add horizontal clearance before turning vertical
          const clearanceX = exitingFromLeftSide 
            ? sourceX - clearanceDistance 
            : sourceX + clearanceDistance;
          path.push(`L ${clearanceX} ${sourceY}`);
          path.push(`L ${clearanceX} ${targetY}`);
          path.push(`L ${targetX} ${targetY}`);
        } else {
          path.push(`L ${sourceX} ${targetY}`);
          path.push(`L ${targetX} ${targetY}`);
        }
      } else {
        // Use mid-lane routing - check if mid-lane is safe, drop down if needed
        const midLaneY = getSafeMidLaneY(sourceX, targetX, sourceY, targetY);
        
        // Determine target approach direction
        const enteringTargetFromSide = targetPosition === Position.Left || targetPosition === Position.Right;
        const enteringTargetFromLeft = targetPosition === Position.Left;
        
        if (exitingFromSide) {
          // Add horizontal clearance before going to mid-lane
          const clearanceX = exitingFromLeftSide 
            ? sourceX - clearanceDistance 
            : sourceX + clearanceDistance;
          
          // 1. Horizontal clearance from source box
          path.push(`L ${clearanceX} ${sourceY}`);
          
          // 2. Vertical on grid to mid-lane
          path.push(`L ${clearanceX} ${midLaneY}`);
          
          if (enteringTargetFromSide) {
            // 3. Horizontal in mid-lane to target clearance point
            const targetClearanceX = enteringTargetFromLeft
              ? targetX - clearanceDistance
              : targetX + clearanceDistance;
            path.push(`L ${targetClearanceX} ${midLaneY}`);
            
            // 4. Vertical to target Y level
            path.push(`L ${targetClearanceX} ${targetY}`);
            
            // 5. Horizontal to target
            path.push(`L ${targetX} ${targetY}`);
          } else {
            // 3. Horizontal in mid-lane to target X
            path.push(`L ${targetX} ${midLaneY}`);
            
            // 4. Vertical on grid to target
            path.push(`L ${targetX} ${targetY}`);
          }
        } else {
          // 1. Vertical on grid to mid-lane
          path.push(`L ${sourceX} ${midLaneY}`);
          
          if (enteringTargetFromSide) {
            // 2. Horizontal in mid-lane to target clearance point
            const targetClearanceX = enteringTargetFromLeft
              ? targetX - clearanceDistance
              : targetX + clearanceDistance;
            path.push(`L ${targetClearanceX} ${midLaneY}`);
            
            // 3. Vertical to target Y level
            path.push(`L ${targetClearanceX} ${targetY}`);
            
            // 4. Horizontal to target
            path.push(`L ${targetX} ${targetY}`);
          } else {
            // 2. Horizontal in mid-lane to target X
            path.push(`L ${targetX} ${midLaneY}`);
            
            // 3. Vertical on grid to target
            path.push(`L ${targetX} ${targetY}`);
          }
        }
      }
    }
    
    return path.join(' ');
  };
  
  // Use custom waypoints if available, otherwise generate from path
  const getPathPoints = () => {
    // If we have custom waypoints, use them to build the path
    if (waypoints && waypoints.length > 0) {
      return [{ x: sourceX, y: sourceY }, ...waypoints, { x: targetX, y: targetY }];
    }
    
    // Otherwise parse the generated path
    const pathStr = generatePath();
    const points: { x: number; y: number }[] = [];
    const commands = pathStr.match(/[ML]\s*[\d.-]+\s+[\d.-]+/g) || [];
    
    commands.forEach((cmd) => {
      const match = cmd.match(/[ML]\s*([\d.-]+)\s+([\d.-]+)/);
      if (match) {
        points.push({ x: parseFloat(match[1]), y: parseFloat(match[2]) });
      }
    });
    
    return points;
  };
  
  // Build path from points (either custom waypoints or generated)
  const buildPathFromPoints = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };
  
  // Create unique marker ID for this edge color
  const markerId = `arrowhead-${id}`;
  
  // Get path points for waypoint handles
  const pathPoints = getPathPoints();
  
  // Final path - use custom waypoints if available
  const finalPath = waypoints && waypoints.length > 0 
    ? buildPathFromPoints(pathPoints)
    : generatePath();
  
  // Handle waypoint drag
  const handleWaypointMouseDown = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPoint = pathPoints[index + 1]; // +1 because we skip the source point
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      let newX = startPoint.x + dx;
      let newY = startPoint.y + dy;
      
      // Snap to grid when Shift is pressed
      if (moveEvent.shiftKey) {
        const gridSize = 50; // Half grid size for finer control
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      // Update waypoint position
      if (onWaypointDrag) {
        const newWaypoints = pathPoints.slice(1, -1).map((p, i) => 
          i === index ? { x: newX, y: newY } : p
        );
        onWaypointDrag(id, newWaypoints);
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle click on edge to select it for color picking
  const handleEdgeClick = (e: React.MouseEvent) => {
    if (!editMode) return;
    e.stopPropagation();
    if (onEdgeSelect) {
      onEdgeSelect(id, edgeColor);
    }
  };
  
  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M2,2 L10,6 L2,10 L4,6 Z"
            fill={edgeColor}
          />
        </marker>
      </defs>
      {/* Invisible wider path for easier clicking */}
      {editMode && (
        <path
          d={finalPath}
          stroke="transparent"
          strokeWidth={15}
          fill="none"
          style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
          onClick={handleEdgeClick}
        />
      )}
      {/* Selection highlight when selected */}
      {isSelected && (
        <path
          d={finalPath}
          stroke="#fbbf24"
          strokeWidth={6}
          fill="none"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <path
        d={finalPath}
        stroke={edgeColor}
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#${markerId})`}
        style={{ pointerEvents: 'none' }}
      />
      {/* Draggable waypoint handles - only in edit mode */}
      {editMode && pathPoints.slice(1, -1).map((point, index) => (
        <circle
          key={`waypoint-${id}-${index}`}
          cx={point.x}
          cy={point.y}
          r={6}
          fill={edgeColor}
          stroke="white"
          strokeWidth={2}
          style={{ cursor: 'move', pointerEvents: 'all' }}
          className="waypoint-handle"
          onMouseDown={(e) => handleWaypointMouseDown(index, e)}
        />
      ))}
    </>
  );
};

const BranchingEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: any) => {
  // Create direct paths for each prerequisite that phase through course boxes
  const paths = data?.sources?.map((sourceNode: any, index: number) => {
    if (!sourceNode || !sourceNode.position) return null;
    
    // Calculate best handle positions based on relative positions
    const dx = targetX - sourceNode.position.x;
    const dy = targetY - sourceNode.position.y;
    
    // Choose handles based on relative position
    let sourcePos, targetPos;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      // More horizontal than vertical - use side handles
      sourcePos = dx > 0 ? Position.Right : Position.Left;
      targetPos = dx > 0 ? Position.Left : Position.Right;
    } else {
      // More vertical than horizontal - use top/bottom handles
      sourcePos = dy > 0 ? Position.Bottom : Position.Top;
      targetPos = dy > 0 ? Position.Top : Position.Bottom;
    }
    
    // Create direct straight line that phases through boxes
    const path = `M ${sourceNode.position.x} ${sourceNode.position.y} L ${targetX} ${targetY}`;
    
    return { path, sourcePos, targetPos };
  }).filter(Boolean) || [];
  
  return (
    <g>
      {/* Draw direct lines from each prerequisite to target */}
      {paths.map((pathData: any, index: number) => (
        <path
          key={`${id}-branch-${index}`}
          d={pathData.path}
          stroke="#3b82f6"
          strokeWidth={2}
          fill="none"
          markerEnd="url(#arrowhead)"
          style={{ pointerEvents: 'none' }} // Allow clicking through lines
        />
      ))}
    </g>
  );
};

const CourseNode = ({ 
  id,
  data, 
}: { 
  id: string;
  data: StudyPlanNode & { editMode?: boolean; onStartEdit?: (id: string) => void; onUpdateText?: (id: string, field: 'code' | 'title', value: string) => void }; 
}) => {
  const editMode = data.editMode || false;
  const onStartEdit = data.onStartEdit;
  const onUpdateText = data.onUpdateText;
  
  const [editingField, setEditingField] = useState<'code' | 'title' | null>(null);
  const [localCode, setLocalCode] = useState(data.code || '');
  const [localTitle, setLocalTitle] = useState(data.title || '');
  
  useEffect(() => {
    setLocalCode(data.code || '');
    setLocalTitle(data.title || '');
  }, [data.code, data.title]);
  
  const handleDoubleClick = (field: 'code' | 'title') => {
    if (editMode) {
      if (onStartEdit) onStartEdit(id);
      setEditingField(field);
    }
  };
  
  const handleBlur = () => {
    if (editingField && onUpdateText) {
      if (editingField === 'code') {
        onUpdateText(id, 'code', localCode);
      } else {
        onUpdateText(id, 'title', localTitle);
      }
    }
    setEditingField(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
    if (e.key === 'Escape') {
      setLocalCode(data.code || '');
      setLocalTitle(data.title || '');
      setEditingField(null);
    }
  };
  
  const getNodeStyle = () => {
    switch (data.type) {
      case 'major_elective':
        return { bg: '#EBF4FF', border: '#93C5FD', text: '#1E40AF' };
      case 'free_elective':
        return { bg: '#ECFDF5', border: '#6EE7B7', text: '#065F46' };
      default:
        return { bg: 'var(--au-card-bg)', border: 'var(--au-border-soft)', text: 'var(--au-text-main)' };
    }
  };

  const nodeStyle = getNodeStyle();

  return (
    <div 
      className="px-3 py-2 min-w-[150px] h-full flex flex-col justify-center relative"
      style={{
        background: nodeStyle.bg,
        border: `1px solid ${nodeStyle.border}`,
        borderRadius: '6px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
        color: nodeStyle.text,
      }}
    >
      {/* Handles - only visible in edit mode */}
      {editMode && (
        <>
          <Handle
            type="source"
            position={Position.Top}
            id="top"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          <Handle
            type="target"
            position={Position.Top}
            id="top"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          
          <Handle
            type="source"
            position={Position.Left}
            id="left"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          <Handle
            type="target"
            position={Position.Left}
            id="left"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          
          <Handle
            type="source"
            position={Position.Right}
            id="right"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          <Handle
            type="target"
            position={Position.Right}
            id="right"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          
          <Handle
            type="source"
            position={Position.Bottom}
            id="bottom"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
          <Handle
            type="target"
            position={Position.Bottom}
            id="bottom"
            isConnectable={true}
            style={{ background: '#3b82f6' }}
          />
        </>
      )}
      
      {/* Hidden handles for edge connections when not in edit mode */}
      {!editMode && (
        <>
          <Handle type="source" position={Position.Top} id="top" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="target" position={Position.Top} id="top" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="source" position={Position.Left} id="left" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="target" position={Position.Left} id="left" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="source" position={Position.Right} id="right" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="target" position={Position.Right} id="right" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="source" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />
          <Handle type="target" position={Position.Bottom} id="bottom" style={{ opacity: 0, pointerEvents: 'none' }} />
        </>
      )}
      
      <div className={`text-center ${editingField ? 'nodrag nowheel' : ''}`}>
        {editingField === 'code' ? (
          <input
            autoFocus
            value={localCode}
            onChange={(e) => setLocalCode(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="nodrag nowheel font-semibold text-base leading-tight w-full text-center px-1"
            style={{ background: 'white', border: '2px solid var(--au-navy)', borderRadius: '4px', outline: 'none' }}
          />
        ) : (
          <div 
            className="font-semibold text-base leading-tight break-words"
            style={{ cursor: editMode ? 'text' : 'default' }}
            onDoubleClick={() => handleDoubleClick('code')}
          >
            {data.code || data.type.replace('_', ' ').toUpperCase()}
          </div>
        )}
        {data.title && data.code && (
          editingField === 'title' ? (
            <input
              autoFocus
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              className="nodrag nowheel text-sm mt-1 w-full text-center px-1"
              style={{ background: 'white', border: '2px solid var(--au-navy)', borderRadius: '4px', outline: 'none' }}
            />
          ) : (
            <div 
              className="text-sm mt-1 leading-tight break-words"
              style={{ opacity: 0.75, cursor: editMode ? 'text' : 'default' }}
              onDoubleClick={() => handleDoubleClick('title')}
            >
              {data.title} ({data.credits || 3})
            </div>
          )
        )}
      </div>
      
      {editMode && (
        <NodeResizer
          minWidth={150}
          minHeight={60}
          maxWidth={300}
          maxHeight={200}
          handleClassName="resize-handle"
          handleStyle={{
            width: 12,
            height: 12,
            background: '#3b82f6',
            border: '2px solid white',
          }}
        />
      )}
      
      {/* OR Badge overlay - outside, doesn't interfere with resize */}
      {data.or_group && (
        <div 
          className="absolute -top-2 -left-2 text-white text-xs font-bold px-2 py-1 shadow-lg z-10 transform -rotate-12 pointer-events-none"
          style={{ background: 'var(--au-red)', borderRadius: '999px', padding: '2px 6px', fontSize: '11px' }}
        >
          OR
        </div>
      )}
    </div>
  );
};

// Helper function to get ordinal suffix
const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const ColumnHeaderNode = ({ data }: { data: { year: number; semester: number; editMode?: boolean } }) => {
  const editMode = data.editMode || false;
  const yearOrdinal = getOrdinal(data.year);
  const semesterOrdinal = getOrdinal(data.semester);
  
  return (
    <div className="relative h-full flex items-center justify-center">
      <div className="text-base leading-tight" style={{ fontWeight: 600, color: 'var(--au-navy)' }}>
        {data.year}<sup className="text-xs">{yearOrdinal}</sup> Year {data.semester}<sup className="text-xs">{semesterOrdinal}</sup> Semester
      </div>
      {editMode && (
        <NodeResizer
          minWidth={150}
          minHeight={40}
          maxWidth={300}
          maxHeight={60}
          handleClassName="resize-handle"
          handleStyle={{
            width: 12,
            height: 12,
            background: '#3b82f6',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
};

// Program Title Node - just bold text, no border
const ProgramTitleNode = ({ data }: { data: { title: string; credits: number } }) => {
  return (
    <div className="text-center">
      <h2 className="text-xl font-bold text-black whitespace-nowrap">
        {data.title} ({data.credits} Credits)
      </h2>
    </div>
  );
};

// Font size options for text nodes
const FONT_SIZES = [
  { label: 'S', value: 12 },
  { label: 'M', value: 16 },
  { label: 'L', value: 20 },
  { label: 'XL', value: 24 },
];

// Custom Text Node - user can add custom text
const TextNode = ({ 
  id, 
  data, 
}: { 
  id: string;
  data: { 
    text: string; 
    fontSize: number; 
    color: string; 
    isPlacing?: boolean;
    editMode?: boolean;
    isEditing?: boolean;
    onStartEdit?: (id: string) => void;
    onUpdateText?: (id: string, text: string) => void;
    onUpdateStyle?: (id: string, style: { fontSize?: number; color?: string }) => void;
  };
}) => {
  const editMode = data.editMode || false;
  const isEditing = data.isEditing || false;
  const onStartEdit = data.onStartEdit;
  const onUpdateText = data.onUpdateText;
  
  const [localText, setLocalText] = useState(data.text);
  const isPlacing = data.isPlacing || false;
  
  const handleDoubleClick = () => {
    if (editMode && !isPlacing && onStartEdit) {
      onStartEdit(id);
    }
  };
  
  const handleBlur = () => {
    if (onUpdateText) onUpdateText(id, localText);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onUpdateText) onUpdateText(id, localText);
    }
    if (e.key === 'Escape') {
      setLocalText(data.text);
      if (onUpdateText) onUpdateText(id, data.text);
    }
  };
  
  useEffect(() => {
    setLocalText(data.text);
  }, [data.text]);
  
  return (
    <div 
      className={`relative cursor-pointer min-w-[50px] ${isPlacing ? 'pointer-events-none' : ''}`}
      onDoubleClick={handleDoubleClick}
      style={{ opacity: isPlacing ? 0.6 : 1 }}
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-2 border-blue-500 rounded px-2 py-1 outline-none resize-none bg-white"
          style={{ 
            fontSize: data.fontSize, 
            color: data.color,
            minWidth: '100px',
            minHeight: '30px',
          }}
        />
      ) : (
        <div 
          className={`px-2 py-1 whitespace-pre-wrap ${isPlacing ? 'border-2 border-dashed border-blue-400 bg-blue-50 rounded' : ''}`}
          style={{ 
            fontSize: data.fontSize, 
            color: data.color,
          }}
        >
          {data.text || (editMode ? 'Double-click to edit' : '')}
        </div>
      )}
      
      {editMode && (
        <NodeResizer
          minWidth={50}
          minHeight={30}
          handleClassName="resize-handle"
          handleStyle={{
            width: 8,
            height: 8,
            background: '#3b82f6',
            border: '2px solid white',
          }}
        />
      )}
    </div>
  );
};

function StudyPlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const whiteboardRef = useRef<HTMLDivElement>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphData, setGraphData] = useState<StudyPlanGraph | null>(null);
  const [programInfo, setProgramInfo] = useState<ProgramInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [colorPickerColor, setColorPickerColor] = useState('#3b82f6');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [textNodeCounter, setTextNodeCounter] = useState(0);
  const [placingTextNode, setPlacingTextNode] = useState<string | null>(null);
  const historyRef = useRef<{ nodes: Node[]; edges: Edge[] }[]>([]);
  const historyIndexRef = useRef(-1);

  // Save state to history for undo - using refs to avoid re-renders
  const saveToHistory = useCallback(() => {
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
    newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
    if (newHistory.length > 20) newHistory.shift(); // Keep only last 20 states
    historyRef.current = newHistory;
    historyIndexRef.current = newHistory.length - 1;
  }, [nodes, edges]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prevState = historyRef.current[historyIndexRef.current];
      setNodes(prevState.nodes);
      setEdges(prevState.edges);
    }
  }, [setNodes, setEdges]);

  // Handle starting text edit - only one at a time
  const handleStartTextEdit = useCallback((nodeId: string) => {
    setSelectedEdgeId(null); // Close edge color picker
    setEditingTextId(nodeId);
  }, []);

  // Handle updating text content
  const handleUpdateText = useCallback((nodeId: string, text: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, text } }
          : node
      )
    );
    setEditingTextId(null);
  }, [setNodes]);

  // Handle updating text style (fontSize, color)
  const handleUpdateTextStyle = useCallback((nodeId: string, style: { fontSize?: number; color?: string }) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...style } }
          : node
      )
    );
  }, [setNodes]);

  // Add new text node - starts at center of viewport
  const handleAddText = useCallback(() => {
    saveToHistory();
    const newId = `text-${textNodeCounter}`;
    setTextNodeCounter((c) => c + 1);
    
    const newNode: Node = {
      id: newId,
      type: 'custom_text',
      position: { x: 500, y: 100 },
      data: { text: 'New Text', fontSize: 16, color: '#000000', isPlacing: true },
      draggable: false,
    };
    
    setNodes((nds) => [...nds, newNode]);
    setPlacingTextNode(newId);
  }, [textNodeCounter, setNodes, saveToHistory]);

  // Place the text node at current position
  const handlePlaceTextNode = useCallback(() => {
    if (placingTextNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === placingTextNode
            ? { ...node, data: { ...node.data, isPlacing: false }, draggable: true }
            : node
        )
      );
      setEditingTextId(placingTextNode);
      setPlacingTextNode(null);
    }
  }, [placingTextNode, setNodes]);

  // Update course node text
  const handleUpdateCourseText = useCallback((nodeId: string, field: 'code' | 'title', value: string) => {
    saveToHistory();
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, [field]: value } }
          : node
      )
    );
  }, [setNodes, saveToHistory]);

  // Define nodeTypes - stable reference, editMode passed through data
  const nodeTypes = useMemo(() => ({
    course: CourseNode,
    major_elective: CourseNode,
    free_elective: CourseNode,
    column_header: ColumnHeaderNode,
    program_title: ProgramTitleNode,
    custom_text: TextNode,
  }), []);

  const edgeTypes = useMemo(() => ({
    branching: BranchingEdge,
    manhattan: ManhattanEdge,
  }), []);

  // Track mouse position for placing text nodes
  const reactFlowInstance = useRef<any>(null);
  
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (placingTextNode && reactFlowInstance.current) {
      const bounds = event.currentTarget.getBoundingClientRect();
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      // Update the placing node position
      setNodes((nds) =>
        nds.map((node) =>
          node.id === placingTextNode
            ? { ...node, position }
            : node
        )
      );
    }
  }, [placingTextNode, setNodes]);

  const handleCanvasClick = useCallback(() => {
    if (placingTextNode) {
      handlePlaceTextNode();
    }
  }, [placingTextNode, handlePlaceTextNode]);

  // Add keyboard event listeners for Shift key, Delete key, and Ctrl+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(true);
      }
      
      // Delete key - delete selected nodes (only custom_text nodes can be deleted)
      if ((e.key === 'Delete' || e.key === 'Backspace') && editMode && !editingTextId) {
        const selectedNodes = nodes.filter(n => n.selected && n.type === 'custom_text');
        if (selectedNodes.length > 0) {
          saveToHistory();
          setNodes((nds) => nds.filter(n => !n.selected || n.type !== 'custom_text'));
        }
      }
      
      // Ctrl+Z - undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Escape - cancel color/style editing
      if (e.key === 'Escape') {
        setSelectedEdgeId(null);
        setEditingTextId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [editMode, editingTextId, nodes, saveToHistory, setNodes, handleUndo]);

  // Convert backend graph data to React Flow format
  const convertToReactFlowFormat = useCallback((graph: StudyPlanGraph) => {
    // Create column header nodes
    const headerNodes: Node[] = [];
    const semesters = [
      { year: 1, semester: 1 },
      { year: 1, semester: 2 },
      { year: 2, semester: 1 },
      { year: 2, semester: 2 },
      { year: 3, semester: 1 },
      { year: 3, semester: 2 },
      { year: 4, semester: 1 },
      { year: 4, semester: 2 },
    ];

    semesters.forEach((sem, index) => {
      const x = (index + 1) * 300; // Move right by 1 column
      headerNodes.push({
        id: `header-${sem.year}-${sem.semester}`,
        type: 'column_header',
        position: { x: x, y: -100 }, // Position at top
        data: { year: sem.year, semester: sem.semester },
        draggable: false, // Only draggable in edit mode
        selectable: true,
        style: { width: 200, height: 50 }, // Fixed height for visibility
      });
    });

    const courseNodes: Node[] = graph.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position || { x: 0, y: 0 },
      data: node,
      draggable: false, // Only draggable in edit mode
      style: { width: 200, height: 100 }, // Original size
    }));

    const flowEdges: Edge[] = graph.edges.map((edge) => {
      // Check if this is a branching edge (has multiple sources)
      if (edge.sources && edge.sources.length > 1) {
        // Create multiple edges for each prerequisite with smart handle selection
        return edge.sources.map((sourceId: string, index: number) => {
          const sourceNode = graph.nodes.find(node => node.id === sourceId);
          const targetNode = graph.nodes.find(node => node.id === edge.to_id);
          
          if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) {
            return null;
          }
          
          // Calculate relative position for smart port selection
          const dx = targetNode.position.x - sourceNode.position.x;
          const dy = targetNode.position.y - sourceNode.position.y;
          
          // Smart handle selection based on relative position
          let sourceHandle, targetHandle;
          
          if (Math.abs(dx) > Math.abs(dy)) {
            // More horizontal than vertical - use side handles
            if (dx > 0) {
              sourceHandle = 'right';
              targetHandle = 'left';
            } else {
              sourceHandle = 'left';
              targetHandle = 'right';
            }
          } else {
            // More vertical than horizontal - use top/bottom handles
            if (dy > 0) {
              sourceHandle = 'bottom';
              targetHandle = 'top';
            } else {
              sourceHandle = 'top';
              targetHandle = 'bottom';
            }
          }
          
          return {
            id: `${sourceId}-${edge.to_id}-${index}`,
            source: sourceId,
            target: edge.to_id,
            sourceHandle,
            targetHandle,
            type: 'manhattan',
            data: { allNodes: graph.nodes },
          };
        });
      } else {
        // Regular single prerequisite edge with smart handle selection
        const sourceNode = graph.nodes.find(node => node.id === edge.from_id);
        const targetNode = graph.nodes.find(node => node.id === edge.to_id);
        
        if (!sourceNode || !targetNode || !sourceNode.position || !targetNode.position) {
          return {
            id: `${edge.from_id}-${edge.to_id}`,
            source: edge.from_id,
            target: edge.to_id,
            type: 'manhattan',
            data: { allNodes: graph.nodes },
          };
        }
        
        // Calculate relative position for smart port selection
        const dx = targetNode.position.x - sourceNode.position.x;
        const dy = targetNode.position.y - sourceNode.position.y;
        
        // Smart handle selection
        let sourceHandle, targetHandle;
        
        if (Math.abs(dx) > Math.abs(dy)) {
          // More horizontal - use side handles
          if (dx > 0) {
            sourceHandle = 'right';
            targetHandle = 'left';
          } else {
            sourceHandle = 'left';
            targetHandle = 'right';
          }
        } else {
          // More vertical - use top/bottom handles
          if (dy > 0) {
            sourceHandle = 'bottom';
            targetHandle = 'top';
          } else {
            sourceHandle = 'top';
            targetHandle = 'bottom';
          }
        }
        
        return {
          id: `${edge.from_id}-${edge.to_id}`,
          source: edge.from_id,
          target: edge.to_id,
          sourceHandle,
          targetHandle,
          type: 'manhattan',
          data: { allNodes: graph.nodes },
        };
      }
    }).flat().filter(edge => edge !== null) as Edge[];

    return { nodes: [...headerNodes, ...courseNodes], edges: flowEdges };
  }, []);

  // Fetch graph data and program info from backend
  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch graph data and program info in parallel
        const [graphResponse, programResponse] = await Promise.all([
          fetch(`http://localhost:8001/graph/${sessionId}`),
          fetch(`http://localhost:8001/program-info/${sessionId}`)
        ]);
        
        if (!graphResponse.ok) {
          const errorData = await graphResponse.json();
          throw new Error(errorData.detail || 'Failed to fetch graph data');
        }

        const graphData: StudyPlanGraph = await graphResponse.json();
        setGraphData(graphData);
        
        let programData: ProgramInfo | null = null;
        if (programResponse.ok) {
          programData = await programResponse.json();
          setProgramInfo(programData);
        }
        
        const { nodes: flowNodes, edges: flowEdges } = convertToReactFlowFormat(graphData);
        
        // Add program title node at the top center if we have program info
        if (programData) {
          const titleNode: Node = {
            id: 'program-title',
            type: 'program_title',
            position: { x: 1050, y: -180 }, // Centered above all 8 semester headers
            data: { title: programData.program_title, credits: programData.total_credits },
            draggable: false,
            selectable: false,
          };
          setNodes([titleNode, ...flowNodes]);
        } else {
          setNodes(flowNodes);
        }
        setEdges(flowEdges);
        
        // Initialize history with initial state using refs
        const initialNodes = programData 
          ? [{ id: 'program-title', type: 'program_title', position: { x: 1050, y: -180 }, data: { title: programData.program_title, credits: programData.total_credits }, draggable: false, selectable: false }, ...flowNodes]
          : flowNodes;
        historyRef.current = [{ nodes: JSON.parse(JSON.stringify(initialNodes)), edges: JSON.parse(JSON.stringify(flowEdges)) }];
        historyIndexRef.current = 0;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load study plan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sessionId, convertToReactFlowFormat, setNodes, setEdges]);

  // Handle waypoint drag - update edge waypoints
  const handleWaypointDrag = useCallback((edgeId: string, newWaypoints: { x: number; y: number }[]) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, waypoints: newWaypoints } }
          : edge
      )
    );
  }, [setEdges]);

  // Handle edge color change
  const handleColorChange = useCallback((edgeId: string, newColor: string) => {
    setEdges((eds) =>
      eds.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, customColor: newColor } }
          : edge
      )
    );
    setSelectedEdgeId(null);
  }, [setEdges]);

  // Handle edge selection for color picker
  const handleEdgeSelect = useCallback((edgeId: string, currentColor: string) => {
    setEditingTextId(null); // Close text editor when selecting edge
    if (selectedEdgeId === edgeId) {
      setSelectedEdgeId(null);
    } else {
      setSelectedEdgeId(edgeId);
      setColorPickerColor(currentColor);
    }
  }, [selectedEdgeId]);

  // Update edges when editMode changes to pass editMode to edge data
  // Store handlers in refs to avoid infinite loops
  const handlersRef = useRef({
    handleStartTextEdit,
    handleUpdateText,
    handleUpdateCourseText,
    handleUpdateTextStyle,
    handleWaypointDrag: null as any,
    handleEdgeSelect: null as any,
  });
  
  useEffect(() => {
    handlersRef.current = {
      handleStartTextEdit,
      handleUpdateText,
      handleUpdateCourseText,
      handleUpdateTextStyle,
      handleWaypointDrag: handlersRef.current.handleWaypointDrag,
      handleEdgeSelect: handlersRef.current.handleEdgeSelect,
    };
  });

  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: { 
          ...edge.data, 
          editMode, 
          onWaypointDrag: handleWaypointDrag,
          onEdgeSelect: handleEdgeSelect,
          isSelected: edge.id === selectedEdgeId,
        },
      }))
    );
  }, [editMode, setEdges, handleWaypointDrag, handleEdgeSelect, selectedEdgeId]);

  // Update nodes with editMode - separate effect with minimal deps
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        draggable: editMode && node.type !== 'program_title',
        data: {
          ...node.data,
          editMode,
          isEditing: editingTextId === node.id,
          onStartEdit: handlersRef.current.handleStartTextEdit,
          onUpdateText: node.type === 'custom_text' 
            ? handlersRef.current.handleUpdateText 
            : handlersRef.current.handleUpdateCourseText,
          onUpdateStyle: handlersRef.current.handleUpdateTextStyle,
        },
      }))
    );
  }, [editMode, setNodes, editingTextId]);

  // Close color picker when edit mode is turned off
  useEffect(() => {
    if (!editMode) {
      setSelectedEdgeId(null);
    }
  }, [editMode]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Custom snap-to-grid function for node dragging only
  const handleNodeDragStop = useCallback((event: React.MouseEvent, node: Node) => {
    saveToHistory();
    const gridSize = 50;
    const snappedPosition = {
      x: Math.round(node.position.x / gridSize) * gridSize,
      y: Math.round(node.position.y / gridSize) * gridSize,
    };
    
    // Update node position to snapped grid
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === node.id ? { ...n, position: snappedPosition } : n
      )
    );
  }, [setNodes, saveToHistory]);

  // Custom onNodesChange handler with Shift+grid snapping for resize
  const handleNodesChange = useCallback((changes: any[]) => {
    // Apply grid snapping to dimension changes when Shift is pressed
    const modifiedChanges = changes.map(change => {
      if (isShiftPressed && change.type === 'dimensions' && change.dimensions) {
        const gridSize = 50;
        const snappedWidth = Math.round(change.dimensions.width / gridSize) * gridSize;
        const snappedHeight = Math.round(change.dimensions.height / gridSize) * gridSize;
        
        return {
          ...change,
          dimensions: {
            width: snappedWidth,
            height: snappedHeight
          }
        };
      }
      return change;
    });

    onNodesChange(modifiedChanges);
  }, [isShiftPressed, onNodesChange]);

  const handleExportPDF = async () => {
    if (!whiteboardRef.current) {
      alert('Unable to capture whiteboard for export');
      return;
    }

    // Store current edit mode state and disable it for clean export
    const wasEditMode = editMode;
    if (wasEditMode) {
      setEditMode(false);
    }

    // Wait for React to re-render with edit mode off
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      // Get the ReactFlow viewport (just the nodes and edges, not the container)
      const viewport = whiteboardRef.current.querySelector('.react-flow__viewport') as HTMLElement;
      if (!viewport) {
        alert('Unable to find study plan viewport');
        if (wasEditMode) setEditMode(true);
        return;
      }

      // Hide UI controls temporarily
      const controls = whiteboardRef.current.querySelector('.react-flow__controls') as HTMLElement;
      const minimap = whiteboardRef.current.querySelector('.react-flow__minimap') as HTMLElement;
      const panel = whiteboardRef.current.querySelector('.react-flow__panel') as HTMLElement;
      
      if (controls) controls.style.display = 'none';
      if (minimap) minimap.style.display = 'none';
      if (panel) panel.style.display = 'none';

      // Hide all handles for export
      const handles = viewport.querySelectorAll('.react-flow__handle');
      handles.forEach((h) => {
        (h as HTMLElement).style.display = 'none';
      });

      // Get bounds of all nodes to calculate the content area
      const nodeElements = viewport.querySelectorAll('.react-flow__node');
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      nodeElements.forEach((node) => {
        const el = node as HTMLElement;
        const transform = el.style.transform;
        const match = transform.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
        if (match) {
          const x = parseFloat(match[1]);
          const y = parseFloat(match[2]);
          const width = el.offsetWidth;
          const height = el.offsetHeight;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x + width);
          maxY = Math.max(maxY, y + height);
        }
      });

      // Add padding
      const padding = 80;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;

      // Use html-to-image with proper options
      const dataUrl = await toPng(viewport, {
        backgroundColor: '#fafafa',
        width: contentWidth,
        height: contentHeight,
        style: {
          transform: `translate(${-minX}px, ${-minY}px)`,
          transformOrigin: 'top left',
        },
        filter: (node) => {
          // Filter out UI elements
          if (node instanceof Element) {
            if (node.classList.contains('react-flow__controls') ||
                node.classList.contains('react-flow__minimap') ||
                node.classList.contains('react-flow__panel') ||
                node.classList.contains('react-flow__handle') ||
                node.classList.contains('waypoint-handle') ||
                node.classList.contains('resize-handle')) {
              return false;
            }
          }
          return true;
        }
      });

      // Restore handles
      handles.forEach((h) => {
        (h as HTMLElement).style.display = '';
      });

      // Restore UI controls
      if (controls) controls.style.display = '';
      if (minimap) minimap.style.display = '';
      if (panel) panel.style.display = '';

      // Create image to get dimensions
      const img = new Image();
      img.src = dataUrl;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Create PDF with A4-ish proportions
      const pdfWidth = img.width;
      const pdfHeight = img.height;
      
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('study-plan.pdf');
      
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert(`PDF Export failed: ${err instanceof Error ? err.message : 'Unknown error'}. Try using browser Print (Ctrl+P) instead.`);
    } finally {
      // Restore edit mode if it was on
      if (wasEditMode) {
        setEditMode(true);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--au-page-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--au-red)' }}></div>
          <p className="mt-4" style={{ color: 'var(--au-text-muted)' }}>Loading study plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--au-page-bg)' }}>
        <div className="text-center">
          <div className="p-6" style={{ background: 'var(--au-card-bg)', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>
            <h3 className="text-lg font-medium" style={{ color: 'var(--au-red)' }}>Error</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--au-text-muted)' }}>{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-5 py-2 font-medium transition-colors"
              style={{ background: 'var(--au-red)', color: 'white', borderRadius: '999px' }}
            >
              Back to Extraction
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--au-page-bg)' }}>
      {/* Header */}
      <header className="flex-shrink-0" style={{ background: 'var(--au-card-bg)', borderBottom: '1px solid var(--au-border-soft)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="au-study-title" style={{ fontSize: '26px', fontWeight: 700, color: 'var(--au-text-main)', position: 'relative', display: 'inline-block' }}>
                TQF Master 2.0
                <span style={{ position: 'absolute', bottom: '-8px', left: 0, width: '50px', height: '3px', background: 'var(--au-red)' }}></span>
              </h1>
              <p className="mt-3 text-sm" style={{ color: 'var(--au-text-muted)' }}>Study Plan Generator For AU Staff</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="au-btn-back transition-colors"
              style={{ 
                padding: '8px 18px', 
                border: '1px solid var(--au-navy)', 
                background: 'transparent', 
                color: 'var(--au-navy)', 
                borderRadius: '999px', 
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--au-navy)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--au-navy)';
              }}
            >
              ← Back to Extraction
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative" ref={whiteboardRef} style={{ marginTop: '-1px' }}>
        {/* Whiteboard Area */}
        <div 
          className="absolute inset-0" 
          style={{ cursor: placingTextNode ? 'crosshair' : 'default', background: 'var(--au-card-bg)' }}
          onMouseMove={handleMouseMove}
          onClick={handleCanvasClick}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeDragStop={handleNodeDragStop}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            snapToGrid={false} // Disable global snap for free resizing
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            fitView
            style={{ background: '#FAFAFA' }}
            onInit={(instance) => { reactFlowInstance.current = instance; }}
          >
            <Background 
              variant={BackgroundVariant.Lines} 
              gap={50} 
              size={1}
              color="#EBEBEB"
            />
            <Controls />
            <MiniMap 
              nodeColor={(node) => {
                switch (node.data?.type) {
                  case 'major_elective': return '#dbeafe';
                  case 'free_elective': return '#dcfce7';
                  default: return '#ffffff';
                }
              }}
            />
            
            <Panel position="top-right">
              <div 
                className="flex flex-col gap-3 p-4"
                style={{ 
                  background: 'var(--au-card-bg)', 
                  borderRadius: '10px', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                  minWidth: '140px',
                }}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editMode"
                    checked={editMode}
                    onChange={(e) => {
                      setEditMode(e.target.checked);
                      if (!e.target.checked) {
                        setEditingTextId(null);
                        setSelectedEdgeId(null);
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <label htmlFor="editMode" className="text-sm font-medium cursor-pointer" style={{ color: 'var(--au-text-main)' }}>
                    Edit Mode
                  </label>
                </div>
                {editMode && (
                  <button
                    onClick={handleAddText}
                    className="px-4 py-2 text-white text-sm flex items-center justify-center gap-1 transition-colors"
                    style={{ background: 'var(--au-navy)', borderRadius: '6px', fontWeight: 600 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1E2D45'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--au-navy)'}
                  >
                    <span className="text-lg">+</span> Add Text
                  </button>
                )}
                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 text-white text-sm transition-colors"
                  style={{ background: 'var(--au-navy)', borderRadius: '6px', fontWeight: 600 }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1E2D45'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--au-navy)'}
                >
                  Export PDF
                </button>
              </div>
            </Panel>
            
            {/* Unified Style Panel - for both text and line color */}
            {editMode && (selectedEdgeId || editingTextId) && (
              <Panel position="top-right" style={{ marginTop: '180px' }}>
                <div 
                  className="p-4"
                  style={{ 
                    background: 'var(--au-card-bg)', 
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                    minWidth: '180px',
                  }}
                >
                  <div className="text-xs mb-3 text-center font-medium" style={{ color: 'var(--au-text-muted)' }}>
                    {editingTextId ? 'Text Style' : 'Line Style'}
                  </div>
                  
                  {/* Font Size - only for text */}
                  {editingTextId && (
                    <div className="mb-3">
                      <div className="text-xs mb-1" style={{ color: 'var(--au-text-muted)' }}>Size</div>
                      <div className="flex gap-1 justify-center">
                        {FONT_SIZES.map((size) => {
                          const currentNode = nodes.find(n => n.id === editingTextId);
                          const isActive = currentNode?.data?.fontSize === size.value;
                          return (
                            <button
                              key={size.value}
                              onClick={() => handleUpdateTextStyle(editingTextId, { fontSize: size.value })}
                              className="px-3 py-1 text-xs transition-colors"
                              style={{
                                background: isActive ? 'var(--au-navy)' : 'var(--au-light-bg)',
                                color: isActive ? 'white' : 'var(--au-text-main)',
                                borderRadius: '4px',
                                fontWeight: 500,
                              }}
                            >
                              {size.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Color - shared for both text and line */}
                  <div className="mb-3">
                    <div className="text-xs mb-1" style={{ color: 'var(--au-text-muted)' }}>Color</div>
                    <div className="flex gap-2 justify-center flex-wrap">
                      {PRESET_COLORS.map((color) => {
                        const currentNode = editingTextId ? nodes.find(n => n.id === editingTextId) : null;
                        const isActive = editingTextId 
                          ? currentNode?.data?.color === color 
                          : colorPickerColor === color;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              if (editingTextId) {
                                handleUpdateTextStyle(editingTextId, { color });
                              } else if (selectedEdgeId) {
                                handleColorChange(selectedEdgeId, color);
                                setColorPickerColor(color);
                              }
                            }}
                            className="w-6 h-6 rounded-full hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: color,
                              border: isActive ? '3px solid var(--au-text-main)' : '2px solid var(--au-border-soft)',
                            }}
                          />
                        );
                      })}
                      <input
                        type="color"
                        value={editingTextId 
                          ? (nodes.find(n => n.id === editingTextId)?.data?.color || '#000000')
                          : colorPickerColor
                        }
                        onChange={(e) => {
                          if (editingTextId) {
                            handleUpdateTextStyle(editingTextId, { color: e.target.value });
                          } else if (selectedEdgeId) {
                            setColorPickerColor(e.target.value);
                            handleColorChange(selectedEdgeId, e.target.value);
                          }
                        }}
                        className="w-6 h-6 rounded cursor-pointer"
                        style={{ padding: 0, border: '1px solid var(--au-border-soft)' }}
                      />
                    </div>
                  </div>
                  
                  {/* Done button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        setEditingTextId(null);
                        setSelectedEdgeId(null);
                      }}
                      className="px-4 py-1 text-xs text-white transition-colors"
                      style={{ background: 'var(--au-red)', borderRadius: '6px', fontWeight: 600 }}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </main>
    </div>
  );
}

// Wrap the component in Suspense to handle useSearchParams
export default function StudyPlanPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--au-light-bg)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p style={{ color: 'var(--au-text-main)' }}>Loading Study Plan...</p>
        </div>
      </div>
    }>
      <StudyPlanPage />
    </Suspense>
  );
}
