import { useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './MindMap.css';

// 카테고리 노드 컴포넌트
function CategoryNode({ data }) {
    return (
        <div
            className={`category-node ${data.isFavorite ? 'favorite' : ''}`}
            onClick={data.onClick}
        >
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            {data.isFavorite && <span className="favorite-badge">⭐</span>}
            <span className="icon">{data.icon}</span>
            <span className="name">{data.name}</span>
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </div>
    );
}

// 메뉴 아이템 노드 컴포넌트
function MenuNode({ data }) {
    return (
        <div className="menu-node">
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <span className="name">{data.name}</span>
            {data.tags && <div className="tags">{data.tags.slice(0, 2).join(' · ')}</div>}
        </div>
    );
}

// 중앙 노드 컴포넌트
function CenterNode({ data }) {
    return (
        <div className="center-node">
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
            <span className="icon">{data.icon || '🍽️'}</span>
            <span className="name">{data.label || '뭐먹지?'}</span>
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
        </div>
    );
}

const nodeTypes = {
    category: CategoryNode,
    menu: MenuNode,
    center: CenterNode,
};

// 노드/엣지 생성 함수
function createNodesAndEdges(categories, selectedCategory, showMenus, onCategoryClick, favorites) {
    const nodes = [];
    const edges = [];

    // 중앙 노드
    const centerId = 'center';
    nodes.push({
        id: centerId,
        type: 'center',
        position: { x: 250, y: 200 },
        data: {
            label: showMenus && selectedCategory ? selectedCategory.name : '뭐먹지?',
            icon: showMenus && selectedCategory ? selectedCategory.icon : '🍽️'
        },
    });

    if (showMenus && selectedCategory && selectedCategory.items) {
        // 선택된 카테고리의 메뉴들 표시
        const items = selectedCategory.items.slice(0, 8);
        const radius = 150;

        items.forEach((item, index) => {
            const angle = (2 * Math.PI * index) / items.length - Math.PI / 2;
            const x = 250 + radius * Math.cos(angle);
            const y = 200 + radius * Math.sin(angle);
            const nodeId = `menu-${index}`;

            nodes.push({
                id: nodeId,
                type: 'menu',
                position: { x: x - 40, y: y - 15 },
                data: { name: item.name, tags: item.tags || [] },
            });

            edges.push({
                id: `edge-${centerId}-${nodeId}`,
                source: centerId,
                target: nodeId,
                animated: true,
                style: { stroke: '#2AC1BC', strokeWidth: 2 },
            });
        });
    } else if (categories && categories.length > 0) {
        // 카테고리들 원형 배치
        const displayCategories = categories.slice(0, 12);
        const radius = 160;

        displayCategories.forEach((cat, index) => {
            const angle = (2 * Math.PI * index) / displayCategories.length - Math.PI / 2;
            const x = 250 + radius * Math.cos(angle);
            const y = 200 + radius * Math.sin(angle);
            const nodeId = cat.id;

            nodes.push({
                id: nodeId,
                type: 'category',
                position: { x: x - 35, y: y - 25 },
                data: {
                    ...cat,
                    onClick: () => onCategoryClick?.(cat),
                    isFavorite: favorites?.includes(cat.id),
                },
            });

            edges.push({
                id: `edge-${centerId}-${nodeId}`,
                source: centerId,
                target: nodeId,
                style: {
                    stroke: favorites?.includes(cat.id) ? '#F8B500' : '#E8E8F0',
                    strokeWidth: favorites?.includes(cat.id) ? 2 : 1
                },
            });
        });
    }

    return { nodes, edges };
}

export default function MindMap({
    categories = [],
    selectedCategory,
    onCategoryClick,
    showMenus = false,
    favorites = []
}) {
    // 노드/엣지 계산
    const { nodes: calculatedNodes, edges: calculatedEdges } = useMemo(() =>
        createNodesAndEdges(categories, selectedCategory, showMenus, onCategoryClick, favorites),
        [categories, selectedCategory, showMenus, onCategoryClick, favorites]
    );

    const [nodes, setNodes, onNodesChange] = useNodesState(calculatedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(calculatedEdges);

    // props 변경 시 업데이트
    useEffect(() => {
        setNodes(calculatedNodes);
        setEdges(calculatedEdges);
    }, [calculatedNodes, calculatedEdges, setNodes, setEdges]);

    return (
        <div className="mindmap-container">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
                proOptions={{ hideAttribution: true }}
            >
                <Background color="#F0F0F5" gap={20} />
            </ReactFlow>
        </div>
    );
}
