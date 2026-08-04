/**
 * GraphEngine - Canvas-based Interactive Force Graph Engine
 * Visualizes tasks, categories, prerequisites, and bi-directional links.
 */

import { getCategoryById } from '../../config/categories.js';

export class GraphEngine {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.options = options;

        this.nodes = [];
        this.links = [];

        // Camera transform (pan & zoom)
        this.transform = { x: 0, y: 0, scale: 1 };
        this.isDraggingCanvas = false;
        this.dragStart = { x: 0, y: 0 };

        // Node drag
        this.draggedNode = null;
        this.hoveredNode = null;
        this.selectedNodeId = null;

        this.onNodeSelect = options.onNodeSelect || (() => {});

        this.animFrameId = null;
        this.isRunning = false;

        this.initEvents();
    }

    /**
     * Load tasks into nodes and dependency links
     */
    setData(tasks) {
        const width = this.canvas.width || 800;
        const height = this.canvas.height || 600;

        const nodeMap = new Map();
        this.nodes = [];
        this.links = [];

        // 1. Add Category Hub Nodes
        const categoryIds = [...new Set(tasks.map(t => t.category))];
        categoryIds.forEach((catId, idx) => {
            const angle = (idx / categoryIds.length) * Math.PI * 2;
            const radius = Math.min(width, height) * 0.28;
            const catInfo = getCategoryById(catId);

            const hubNode = {
                id: `hub_${catId}`,
                label: catInfo ? catInfo.name.toUpperCase() : catId.toUpperCase(),
                isHub: true,
                categoryId: catId,
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 22,
                color: catInfo ? catInfo.color : '#F3F91A'
            };
            nodeMap.set(hubNode.id, hubNode);
            this.nodes.push(hubNode);
        });

        // 2. Add Task Nodes
        tasks.forEach((task) => {
            const catInfo = getCategoryById(task.category);
            const hubNode = nodeMap.get(`hub_${task.category}`);
            const hubX = hubNode ? hubNode.x : width / 2;
            const hubY = hubNode ? hubNode.y : height / 2;

            const taskNode = {
                id: task.id,
                label: task.text.length > 25 ? task.text.slice(0, 22) + '...' : task.text,
                fullText: task.text,
                isHub: false,
                categoryId: task.category,
                completed: task.completed,
                priority: task.priority,
                taskData: task,
                x: hubX + (Math.random() - 0.5) * 120,
                y: hubY + (Math.random() - 0.5) * 120,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: task.priority === 'critical' ? 14 : task.priority === 'high' ? 11 : 9,
                color: task.completed ? '#39FF14' : (catInfo ? catInfo.color : '#00F0FF')
            };

            nodeMap.set(taskNode.id, taskNode);
            this.nodes.push(taskNode);

            // Link task to its Category Hub
            if (hubNode) {
                this.links.push({
                    source: taskNode,
                    target: hubNode,
                    isHubLink: true
                });
            }
        });

        // 3. Add Dependency Links between Task Nodes
        tasks.forEach((task) => {
            if (Array.isArray(task.dependencies)) {
                const targetNode = nodeMap.get(task.id);
                task.dependencies.forEach((depId) => {
                    const sourceNode = nodeMap.get(depId);
                    if (sourceNode && targetNode) {
                        this.links.push({
                            source: sourceNode,
                            target: targetNode,
                            isHubLink: false
                        });
                    }
                });
            }
        });

        this.start();
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.tick();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
    }

    /**
     * Physics simulation step + render frame
     */
    tick() {
        if (!this.isRunning) return;

        this.updatePhysics();
        this.render();

        this.animFrameId = requestAnimationFrame(() => this.tick());
    }

    updatePhysics() {
        const width = this.canvas.width || 800;
        const height = this.canvas.height || 600;
        const center = { x: width / 2, y: height / 2 };

        const repulseForce = 1200;
        const linkDistance = 75;
        const linkStrength = 0.04;
        const damping = 0.82;

        // Repulsion between all node pairs
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];

                let dx = n2.x - n1.x;
                let dy = n2.y - n1.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;

                if (dist < 300) {
                    let force = repulseForce / (dist * dist);
                    let fx = (dx / dist) * force;
                    let fy = (dy / dist) * force;

                    if (!n1.isDragging) { n1.vx -= fx; n1.vy -= fy; }
                    if (!n2.isDragging) { n2.vx += fx; n2.vy += fy; }
                }
            }
        }

        // Link attraction forces
        this.links.forEach((link) => {
            let dx = link.target.x - link.source.x;
            let dy = link.target.y - link.source.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;

            let targetDist = link.isHubLink ? linkDistance : linkDistance * 1.2;
            let force = (dist - targetDist) * linkStrength;

            let fx = (dx / dist) * force;
            let fy = (dy / dist) * force;

            if (!link.source.isDragging) { link.source.vx += fx; link.source.vy += fy; }
            if (!link.target.isDragging) { link.target.vx -= fx; link.target.vy -= fy; }
        });

        // Center gravity & velocity dampening
        this.nodes.forEach((n) => {
            if (n.isDragging) return;

            let dx = center.x - n.x;
            let dy = center.y - n.y;
            n.vx += dx * 0.0008;
            n.vy += dy * 0.0008;

            n.vx *= damping;
            n.vy *= damping;

            n.x += n.vx;
            n.y += n.vy;

            // Canvas boundary padding
            n.x = Math.max(n.radius * 2, Math.min(width - n.radius * 2, n.x));
            n.y = Math.max(n.radius * 2, Math.min(height - n.radius * 2, n.y));
        });
    }

    render() {
        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.save();
        ctx.clearRect(0, 0, width, height);

        // Draw Cyberpunk Grid background
        ctx.fillStyle = '#05070a';
        ctx.fillRect(0, 0, width, height);

        // Apply Camera Transform
        ctx.translate(this.transform.x, this.transform.y);
        ctx.scale(this.transform.scale, this.transform.scale);

        // Render Links
        this.links.forEach((link) => {
            const isSelected = this.selectedNodeId && 
                (link.source.id === this.selectedNodeId || link.target.id === this.selectedNodeId);

            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);

            if (link.isHubLink) {
                ctx.strokeStyle = isSelected ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 255, 255, 0.08)';
                ctx.lineWidth = isSelected ? 2 : 1;
                ctx.setLineDash([3, 3]);
            } else {
                // Task dependency link
                ctx.strokeStyle = isSelected ? '#FF2A2A' : '#F3F91A';
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.setLineDash([]);
            }
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw Arrowhead for dependency links
            if (!link.isHubLink) {
                this.drawArrowhead(ctx, link.source, link.target, link.target.radius + 2);
            }
        });

        // Render Nodes
        this.nodes.forEach((n) => {
            const isSelected = this.selectedNodeId === n.id;
            const isHovered = this.hoveredNode === n;

            // Halo for selected/hovered nodes
            if (isSelected || isHovered) {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius + (isSelected ? 8 : 5), 0, Math.PI * 2);
                ctx.fillStyle = isSelected ? 'rgba(243, 249, 26, 0.25)' : 'rgba(0, 240, 255, 0.2)';
                ctx.fill();
                ctx.strokeStyle = isSelected ? '#F3F91A' : '#00F0FF';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Node Circle
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();
            ctx.strokeStyle = n.isHub ? '#FFFFFF' : '#000000';
            ctx.lineWidth = n.isHub ? 2 : 1.5;
            ctx.stroke();

            // Node Label
            ctx.font = n.isHub ? 'bold 11px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
            ctx.fillStyle = n.isHub ? '#FFFFFF' : (isSelected ? '#F3F91A' : '#D0D7DE');
            ctx.textAlign = 'center';
            ctx.fillText(n.label, n.x, n.y + n.radius + 14);
        });

        ctx.restore();
    }

    drawArrowhead(ctx, source, target, radiusOffset) {
        let dx = target.x - source.x;
        let dy = target.y - source.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        let endX = target.x - (dx / dist) * radiusOffset;
        let endY = target.y - (dy / dist) * radiusOffset;

        let angle = Math.atan2(dy, dx);
        let arrowLen = 7;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(endX - arrowLen * Math.cos(angle - Math.PI / 6), endY - arrowLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(endX - arrowLen * Math.cos(angle + Math.PI / 6), endY - arrowLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = '#F3F91A';
        ctx.fill();
        ctx.restore();
    }

    initEvents() {
        const canvas = this.canvas;

        const getCanvasCoords = (e) => {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            const mouseX = clientX - rect.left;
            const mouseY = clientY - rect.top;

            // Inverse transform to world coordinates
            const worldX = (mouseX - this.transform.x) / this.transform.scale;
            const worldY = (mouseY - this.transform.y) / this.transform.scale;

            return { mouseX, mouseY, worldX, worldY };
        };

        const findNodeAt = (wx, wy) => {
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const n = this.nodes[i];
                let dx = wx - n.x;
                let dy = wy - n.y;
                if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) {
                    return n;
                }
            }
            return null;
        };

        canvas.addEventListener('mousedown', (e) => {
            const { mouseX, mouseY, worldX, worldY } = getCanvasCoords(e);
            const targetNode = findNodeAt(worldX, worldY);

            if (targetNode) {
                this.draggedNode = targetNode;
                targetNode.isDragging = true;
                this.selectedNodeId = targetNode.id;
                this.onNodeSelect(targetNode.isHub ? null : targetNode.taskData);
            } else {
                this.isDraggingCanvas = true;
                this.dragStart = { x: mouseX - this.transform.x, y: mouseY - this.transform.y };
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            const { mouseX, mouseY, worldX, worldY } = getCanvasCoords(e);

            if (this.draggedNode) {
                this.draggedNode.x = worldX;
                this.draggedNode.y = worldY;
                this.draggedNode.vx = 0;
                this.draggedNode.vy = 0;
            } else if (this.isDraggingCanvas) {
                this.transform.x = mouseX - this.dragStart.x;
                this.transform.y = mouseY - this.dragStart.y;
            } else {
                const node = findNodeAt(worldX, worldY);
                this.hoveredNode = node;
                canvas.style.cursor = node ? 'pointer' : 'default';
            }
        });

        window.addEventListener('mouseup', () => {
            if (this.draggedNode) {
                this.draggedNode.isDragging = false;
                this.draggedNode = null;
            }
            this.isDraggingCanvas = false;
        });

        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const { mouseX, mouseY } = getCanvasCoords(e);
            const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
            const newScale = Math.max(0.4, Math.min(3.0, this.transform.scale * zoomFactor));

            // Zoom centered on mouse cursor
            this.transform.x = mouseX - (mouseX - this.transform.x) * (newScale / this.transform.scale);
            this.transform.y = mouseY - (mouseY - this.transform.y) * (newScale / this.transform.scale);
            this.transform.scale = newScale;
        }, { passive: false });
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
}
