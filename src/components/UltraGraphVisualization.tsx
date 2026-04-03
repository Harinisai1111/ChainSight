import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Info, Search, Download, TrendingUp, Route, Camera, Play, Pause, Box, AlertTriangle, Network, BarChart3, Bookmark, Layers, GitBranch, X } from 'lucide-react';
import { toast } from './ToastNotification';

interface GraphNode {
  id: string;
  label: string;
  suspicious_score: number;
  risk_level: string;
  class: string;
  top_k: boolean;
  degree: {
    in: number;
    out: number;
  };
  timestamp?: number;
  community?: number;
  centrality?: {
    pagerank?: number;
    betweenness?: number;
    closeness?: number;
    degree?: number;
  };
}

interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  high_risk: boolean;
  flow: string;
  timestamp?: number;
}

interface GraphData {
  meta: {
    k: number;
    hop: number;
    total_nodes: number;
    total_edges: number;
    generated_at: string;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    top_illicit_ratio: number;
    fan_out_nodes: number;
    fan_in_nodes: number;
    avg_suspicious_score: number;
    model_confidence: string;
  };
}

interface UltraGraphProps {
  data?: any; // Flexible to support both API and internal formats
}

interface Snapshot {
  id: string;
  name: string;
  timestamp: number;
  filters: {
    searchTerm: string;
    filterRisk: string;
    timeSlider: number[];
  };
  highlightedPath: string[];
  selectedNode: string | null;
}

interface Alert {
  id: string;
  type: 'circular_flow' | 'rapid_dispersal' | 'layering' | 'high_risk_cluster';
  severity: 'critical' | 'high' | 'medium';
  message: string;
  nodes: string[];
  timestamp: number;
}

const UltraGraphVisualization = ({ data }: UltraGraphProps) => {
  const graphRef = useRef<any>();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Static demo data - defined outside component to prevent recreation
  const demoDataRef = useRef<GraphData>({
    meta: {
      k: 20,
      hop: 2,
      total_nodes: 15,
      total_edges: 18,
      generated_at: "2026-01-31T14:30:00Z"
    },
    nodes: [
      { id: "tx_001", label: "transaction", suspicious_score: 0.9987, risk_level: "high", class: "illicit", top_k: true, degree: { in: 7, out: 5 }, timestamp: 10, community: 1, centrality: { pagerank: 0.12, betweenness: 0.35, closeness: 0.78, degree: 12 } },
      { id: "tx_002", label: "transaction", suspicious_score: 0.8765, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 3, out: 8 }, timestamp: 25, community: 1, centrality: { pagerank: 0.08, betweenness: 0.22, closeness: 0.65, degree: 11 } },
      { id: "tx_003", label: "transaction", suspicious_score: 0.9543, risk_level: "high", class: "illicit", top_k: true, degree: { in: 12, out: 4 }, timestamp: 35, community: 1, centrality: { pagerank: 0.15, betweenness: 0.42, closeness: 0.82, degree: 16 } },
      { id: "tx_004", label: "transaction", suspicious_score: 0.6543, risk_level: "low", class: "licit", top_k: false, degree: { in: 2, out: 3 }, timestamp: 45, community: 2, centrality: { pagerank: 0.04, betweenness: 0.08, closeness: 0.45, degree: 5 } },
      { id: "tx_005", label: "transaction", suspicious_score: 0.8901, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 5, out: 6 }, timestamp: 55, community: 2, centrality: { pagerank: 0.09, betweenness: 0.25, closeness: 0.68, degree: 11 } },
      { id: "tx_006", label: "transaction", suspicious_score: 0.9876, risk_level: "high", class: "illicit", top_k: true, degree: { in: 15, out: 3 }, timestamp: 60, community: 1, centrality: { pagerank: 0.18, betweenness: 0.48, closeness: 0.88, degree: 18 } },
      { id: "tx_007", label: "transaction", suspicious_score: 0.7234, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 4, out: 7 }, timestamp: 70, community: 2, centrality: { pagerank: 0.07, betweenness: 0.18, closeness: 0.62, degree: 11 } },
      { id: "tx_008", label: "transaction", suspicious_score: 0.5234, risk_level: "low", class: "licit", top_k: false, degree: { in: 1, out: 2 }, timestamp: 80, community: 3, centrality: { pagerank: 0.03, betweenness: 0.05, closeness: 0.38, degree: 3 } },
      { id: "tx_009", label: "transaction", suspicious_score: 0.9654, risk_level: "high", class: "illicit", top_k: true, degree: { in: 9, out: 11 }, timestamp: 85, community: 1, centrality: { pagerank: 0.16, betweenness: 0.45, closeness: 0.85, degree: 20 } },
      { id: "tx_010", label: "transaction", suspicious_score: 0.8123, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 6, out: 5 }, timestamp: 90, community: 2, centrality: { pagerank: 0.08, betweenness: 0.20, closeness: 0.64, degree: 11 } },
      { id: "tx_011", label: "transaction", suspicious_score: 0.9123, risk_level: "high", class: "illicit", top_k: true, degree: { in: 8, out: 7 }, timestamp: 15, community: 1, centrality: { pagerank: 0.13, betweenness: 0.38, closeness: 0.80, degree: 15 } },
      { id: "tx_012", label: "transaction", suspicious_score: 0.7456, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 4, out: 5 }, timestamp: 40, community: 2, centrality: { pagerank: 0.06, betweenness: 0.15, closeness: 0.58, degree: 9 } },
      { id: "tx_013", label: "transaction", suspicious_score: 0.6789, risk_level: "low", class: "licit", top_k: false, degree: { in: 3, out: 2 }, timestamp: 65, community: 3, centrality: { pagerank: 0.05, betweenness: 0.10, closeness: 0.48, degree: 5 } },
      { id: "tx_014", label: "transaction", suspicious_score: 0.9789, risk_level: "high", class: "illicit", top_k: true, degree: { in: 11, out: 9 }, timestamp: 30, community: 1, centrality: { pagerank: 0.17, betweenness: 0.46, closeness: 0.86, degree: 20 } },
      { id: "tx_015", label: "transaction", suspicious_score: 0.8456, risk_level: "medium", class: "illicit", top_k: false, degree: { in: 5, out: 8 }, timestamp: 95, community: 2, centrality: { pagerank: 0.09, betweenness: 0.23, closeness: 0.66, degree: 13 } }
    ],
    edges: [
      { source: "tx_001", target: "tx_002", weight: 1.5, high_risk: true, flow: "outgoing", timestamp: 25 },
      { source: "tx_001", target: "tx_003", weight: 2.3, high_risk: true, flow: "outgoing", timestamp: 35 },
      { source: "tx_002", target: "tx_005", weight: 0.8, high_risk: false, flow: "outgoing", timestamp: 55 },
      { source: "tx_003", target: "tx_006", weight: 3.1, high_risk: true, flow: "outgoing", timestamp: 60 },
      { source: "tx_004", target: "tx_007", weight: 0.5, high_risk: false, flow: "outgoing", timestamp: 70 },
      { source: "tx_005", target: "tx_010", weight: 1.2, high_risk: false, flow: "outgoing", timestamp: 90 },
      { source: "tx_006", target: "tx_009", weight: 2.8, high_risk: true, flow: "outgoing", timestamp: 85 },
      { source: "tx_007", target: "tx_012", weight: 0.7, high_risk: false, flow: "outgoing", timestamp: 40 },
      { source: "tx_009", target: "tx_011", weight: 2.5, high_risk: true, flow: "bidirectional", timestamp: 15 },
      { source: "tx_011", target: "tx_014", weight: 2.9, high_risk: true, flow: "outgoing", timestamp: 30 },
      { source: "tx_010", target: "tx_015", weight: 1.1, high_risk: false, flow: "outgoing", timestamp: 95 },
      { source: "tx_012", target: "tx_013", weight: 0.6, high_risk: false, flow: "outgoing", timestamp: 65 },
      { source: "tx_014", target: "tx_001", weight: 3.2, high_risk: true, flow: "outgoing", timestamp: 10 },
      { source: "tx_013", target: "tx_008", weight: 0.4, high_risk: false, flow: "outgoing", timestamp: 80 },
      { source: "tx_002", target: "tx_011", weight: 1.9, high_risk: true, flow: "bidirectional", timestamp: 15 },
      { source: "tx_005", target: "tx_007", weight: 0.9, high_risk: false, flow: "outgoing", timestamp: 70 },
      { source: "tx_006", target: "tx_014", weight: 2.7, high_risk: true, flow: "bidirectional", timestamp: 30 },
      { source: "tx_015", target: "tx_005", weight: 1.0, high_risk: false, flow: "outgoing", timestamp: 55 }
    ],
    summary: {
      top_illicit_ratio: 0.87,
      fan_out_nodes: 8,
      fan_in_nodes: 6,
      avg_suspicious_score: 0.8234,
      model_confidence: "high"
    }
  });
  
  // Use provided data or stable demo data reference
  // Safely map provided data to internal format
  const graphData = useMemo(() => {
    if (!data) return demoDataRef.current;
    
    // If it's the simpler format from api.ts
    if (data.nodes && data.edges && !data.meta) {
      return {
        meta: {
          k: data.metadata?.k || 20,
          hop: data.metadata?.hop || 2,
          total_nodes: data.nodes.length,
          total_edges: data.edges.length,
          generated_at: new Date().toISOString()
        },
        nodes: data.nodes.map((n: any) => ({
          ...n,
          suspicious_score: n.suspicious_score || n.riskScore || 0,
          risk_level: n.risk_level || (n.riskScore > 0.7 ? 'high' : n.riskScore > 0.4 ? 'medium' : 'low'),
          degree: n.degree || { in: 0, out: 0 }
        })),
        edges: data.edges,
        summary: {
          top_illicit_ratio: 0,
          fan_out_nodes: 0,
          fan_in_nodes: 0,
          avg_suspicious_score: 0,
          model_confidence: "high"
        }
      };
    }
    return data as GraphData;
  }, [data]);
  
  // State
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [pathStart, setPathStart] = useState<string | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const [timeSlider, setTimeSlider] = useState([100]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [centralityMode, setCentralityMode] = useState<'none' | 'pagerank' | 'betweenness' | 'closeness' | 'degree'>('none');
  const [showCommunities, setShowCommunities] = useState(false);
  const [networkStats, setNetworkStats] = useState<any>(null);
  
  // New states for hover tooltip and trace all paths
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [showNodeMenu, setShowNodeMenu] = useState(false);
  const [nodeMenuPosition, setNodeMenuPosition] = useState({ x: 0, y: 0 });
  const [tracingAllPaths, setTracingAllPaths] = useState<string | null>(null);
  const [tracedEdges, setTracedEdges] = useState<Set<string>>(new Set());
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Calculate Network Statistics - only when data changes (use node count as stable dependency)
  const nodeCount = graphData.nodes.length;
  const edgeCount = graphData.edges.length;
  
  useEffect(() => {
    const nodes = graphData.nodes;
    const edges = graphData.edges;
    
    const totalNodes = nodes.length;
    const totalEdges = edges.length;
    const maxPossibleEdges = totalNodes * (totalNodes - 1);
    const density = totalEdges / maxPossibleEdges;
    
    // Calculate average clustering coefficient (simplified)
    const avgClustering = nodes.reduce((sum, node) => {
      const neighbors = edges.filter(e => 
        e.source === node.id || e.target === node.id
      ).length;
      return sum + (neighbors > 1 ? neighbors / (neighbors - 1) : 0);
    }, 0) / totalNodes;
    
    // Diameter (simplified - using max degree separation as approximation)
    const diameter = 4; // Simplified for demo
    
    // Community count
    const communities = new Set(nodes.map(n => n.community)).size;
    
    setNetworkStats({
      density: (density * 100).toFixed(2),
      avgClustering: avgClustering.toFixed(3),
      diameter,
      communities,
      avgDegree: (totalEdges * 2 / totalNodes).toFixed(2),
      illicitRatio: (nodes.filter(n => n.class === 'illicit').length / totalNodes * 100).toFixed(1)
    });
  }, [nodeCount, edgeCount]);

  // Detect Patterns and Generate Alerts - only when data changes
  useEffect(() => {
    const detectedAlerts: Alert[] = [];
    
    // Detect circular flows (A -> B -> C -> A)
    const edgeMap = new Map<string, string[]>();
    graphData.edges.forEach(edge => {
      const src = typeof edge.source === 'string' ? edge.source : edge.source;
      const tgt = typeof edge.target === 'string' ? edge.target : edge.target;
      if (!edgeMap.has(src)) edgeMap.set(src, []);
      edgeMap.get(src)!.push(tgt);
    });
    
    // Simple cycle detection
    const cycles: string[][] = [];
    graphData.nodes.forEach(node => {
      const visited = new Set<string>();
      const path: string[] = [];
      
      const dfs = (current: string, target: string) => {
        if (visited.has(current)) {
          if (current === target && path.length >= 3) {
            cycles.push([...path, current]);
          }
          return;
        }
        visited.add(current);
        path.push(current);
        
        const neighbors = edgeMap.get(current) || [];
        neighbors.forEach(neighbor => dfs(neighbor, target));
        
        path.pop();
      };
      
      if (edgeMap.has(node.id)) {
        dfs(node.id, node.id);
      }
    });
    
    if (cycles.length > 0) {
      detectedAlerts.push({
        id: 'alert_1',
        type: 'circular_flow',
        severity: 'critical',
        message: `Detected ${cycles.length} circular transaction flow(s) - potential money laundering`,
        nodes: cycles[0] || [],
        timestamp: Date.now()
      });
    }
    
    // Detect rapid dispersal (one node with many outgoing high-risk edges)
    graphData.nodes.forEach(node => {
      const outgoing = graphData.edges.filter(e => 
        (typeof e.source === 'string' ? e.source : e.source) === node.id && e.high_risk
      );
      if (outgoing.length >= 3) {
        detectedAlerts.push({
          id: `alert_dispersal_${node.id}`,
          type: 'rapid_dispersal',
          severity: 'high',
          message: `Node ${node.id} shows rapid fund dispersal pattern (${outgoing.length} high-risk outputs)`,
          nodes: [node.id],
          timestamp: Date.now()
        });
      }
    });
    
    // Detect high-risk clusters
    const communities = new Map<number, GraphNode[]>();
    graphData.nodes.forEach(node => {
      if (!node.community) return;
      if (!communities.has(node.community)) communities.set(node.community, []);
      communities.get(node.community)!.push(node);
    });
    
    communities.forEach((nodes, communityId) => {
      const avgRisk = nodes.reduce((sum, n) => sum + n.suspicious_score, 0) / nodes.length;
      if (avgRisk > 0.85 && nodes.length >= 3) {
        detectedAlerts.push({
          id: `alert_cluster_${communityId}`,
          type: 'high_risk_cluster',
          severity: 'critical',
          message: `Community ${communityId} identified as high-risk cluster (avg risk: ${(avgRisk * 100).toFixed(1)}%)`,
          nodes: nodes.map(n => n.id),
          timestamp: Date.now()
        });
      }
    });
    
    setAlerts(detectedAlerts);
  }, [nodeCount, edgeCount]);

  // Time-based filtering - memoized to prevent re-renders
  const maxTime = useMemo(() => 
    Math.max(...graphData.nodes.map(n => n.timestamp || 100)),
    [graphData.nodes]
  );
  const currentTimeThreshold = (timeSlider[0] / 100) * maxTime;
  
  const filteredNodes = useMemo(() => 
    graphData.nodes.filter(node => {
      const matchesSearch = searchTerm === '' || node.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = filterRisk === 'all' || node.risk_level === filterRisk;
      const matchesTime = !node.timestamp || node.timestamp <= currentTimeThreshold;
      return matchesSearch && matchesRisk && matchesTime;
    }),
    [graphData.nodes, searchTerm, filterRisk, currentTimeThreshold]
  );

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    return graphData.edges.filter(edge => {
      const sourceId = typeof edge.source === 'string' ? edge.source : edge.source;
      const targetId = typeof edge.target === 'string' ? edge.target : edge.target;
      const sourceExists = nodeIds.has(sourceId);
      const targetExists = nodeIds.has(targetId);
      const matchesTime = !edge.timestamp || edge.timestamp <= currentTimeThreshold;
      return sourceExists && targetExists && matchesTime;
    });
  }, [graphData.edges, filteredNodes, currentTimeThreshold]);

  // Community colors
  const communityColors = {
    1: '#ff6b6b',
    2: '#4ecdc4',
    3: '#95e1d3',
    4: '#f38181',
    5: '#aa96da'
  };

  // Centrality-based colors
  const getCentralityColor = useCallback((node: GraphNode) => {
    if (centralityMode === 'none') return null; // Will use getNodeColor
    
    const value = node.centrality?.[centralityMode] || 0;
    const intensity = Math.floor(value * 255);
    return `rgb(${255 - intensity}, ${intensity}, 150)`;
  }, [centralityMode]);

  const getNodeColor = useCallback((node: GraphNode) => {
    // Highlight traced node
    if (tracingAllPaths === node.id) return '#a855f7';
    
    if (centralityMode !== 'none') {
      const value = node.centrality?.[centralityMode] || 0;
      const intensity = Math.floor(value * 255);
      return `rgb(${255 - intensity}, ${intensity}, 150)`;
    }
    
    if (showCommunities && node.community) {
      return communityColors[node.community as keyof typeof communityColors] || '#999';
    }
    
    if (node.risk_level === 'high') return '#ef4444';
    if (node.risk_level === 'medium') return '#f59e0b';
    return '#10b981';
  }, [centralityMode, showCommunities, tracingAllPaths]);

  const getLinkColor = useCallback((link: GraphEdge) => {
    const sourceId = typeof link.source === 'object' ? (link.source as GraphNode)?.id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as GraphNode)?.id : link.target;
    const edgeKey = `${sourceId}->${targetId}`;
    
    // Check if this edge is being traced
    if (tracedEdges.has(edgeKey)) return '#a855f7';
    
    if (highlightedPath.length > 0) {
      if (sourceId && targetId) {
        for (let i = 0; i < highlightedPath.length - 1; i++) {
          if (highlightedPath[i] === sourceId && highlightedPath[i + 1] === targetId) {
            return '#a855f7';
          }
        }
      }
    }
    return link.high_risk ? '#ef4444' : '#94a3b8';
  }, [highlightedPath, tracedEdges]);

  const getLinkWidth = useCallback((link: GraphEdge) => {
    const sourceId = typeof link.source === 'object' ? (link.source as GraphNode)?.id : link.source;
    const targetId = typeof link.target === 'object' ? (link.target as GraphNode)?.id : link.target;
    const edgeKey = `${sourceId}->${targetId}`;
    
    // Wider for traced edges
    if (tracedEdges.has(edgeKey)) return 4;
    
    return link.high_risk ? 2 : 1;
  }, [tracedEdges]);

  // Container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Set initial width immediately
    const initialWidth = containerRef.current.offsetWidth;
    if (initialWidth > 0) {
      setDimensions({ width: initialWidth, height: 600 });
    }
    
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const newWidth = entry.contentRect.width;
        if (newWidth > 0) {
          setDimensions({ width: newWidth, height: 600 });
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleZoomFit();
            toast.info('Zoom to fit');
          }
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case 's':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            saveSnapshot();
          }
          break;
        case 'e':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleExport();
          }
          break;
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'escape':
          setSelectedNode(null);
          setHighlightedPath([]);
          setPathStart(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // BFS for shortest path
  const findShortestPath = useCallback((startId: string, endId: string): string[] => {
    const queue: { node: string; path: string[] }[] = [{ node: startId, path: [startId] }];
    const visited = new Set<string>();
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node === endId) return path;
      if (visited.has(node)) continue;
      visited.add(node);
      
      const neighbors = filteredEdges
        .filter(e => {
          const src = typeof e.source === 'string' ? e.source : e.source;
          return src === node;
        })
        .map(e => typeof e.target === 'string' ? e.target : e.target);
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }
    
    return [];
  }, [filteredEdges]);

  // Generate explanation for why node is suspicious/safe
  const getNodeExplanation = useCallback((node: GraphNode): { title: string; reasons: string[]; verdict: string } => {
    const reasons: string[] = [];
    const inDegree = node.degree?.in || 0;
    const outDegree = node.degree?.out || 0;
    const riskScore = node.suspicious_score || 0;
    
    // Analyze in/out degree patterns
    const highFanIn = inDegree >= 5;
    const highFanOut = outDegree >= 5;
    const lowFanIn = inDegree <= 2;
    const lowFanOut = outDegree <= 2;
    
    if (node.risk_level === 'high' || riskScore >= 0.65) {
      if (highFanIn && highFanOut) {
        reasons.push("⚠️ High fan-in AND fan-out activity detected");
        reasons.push("🔴 Potential smurfing/layering pattern");
      } else if (highFanIn) {
        reasons.push("⚠️ High fan-in activity (receiving from many sources)");
        reasons.push("🔴 Possible collection point for illicit funds");
      } else if (highFanOut) {
        reasons.push("⚠️ High fan-out activity (distributing to many targets)");
        reasons.push("🔴 Possible structuring/distribution hub");
      }
      if (riskScore >= 0.9) {
        reasons.push("🚨 Extremely high risk score - immediate review recommended");
      }
      return {
        title: "🔴 HIGH RISK - SUSPICIOUS",
        reasons,
        verdict: "This node exhibits patterns consistent with money laundering activities."
      };
    } else if (node.risk_level === 'medium' || riskScore >= 0.35) {
      if (highFanIn || highFanOut) {
        reasons.push("⚡ Elevated transaction activity detected");
      }
      reasons.push("📊 Moderate activity patterns - warrants monitoring");
      if (inDegree > outDegree * 2) {
        reasons.push("📥 Significantly more incoming than outgoing transactions");
      } else if (outDegree > inDegree * 2) {
        reasons.push("📤 Significantly more outgoing than incoming transactions");
      }
      return {
        title: "🟡 MEDIUM RISK - MONITOR",
        reasons,
        verdict: "Some unusual patterns detected. Continue monitoring this address."
      };
    } else {
      if (lowFanIn && lowFanOut) {
        reasons.push("✅ Low fan-in/fan-out activity");
      }
      reasons.push("✅ Normal transaction patterns");
      reasons.push("✅ No suspicious layering or structuring detected");
      return {
        title: "🟢 LOW RISK - SAFE",
        reasons,
        verdict: "This node shows normal transaction behavior."
      };
    }
  }, []);

  // Trace all paths from/to a node
  const traceAllPaths = useCallback((nodeId: string) => {
    const connectedEdgeIds = new Set<string>();
    
    // Find all edges connected to this node (both incoming and outgoing)
    filteredEdges.forEach(edge => {
      const sourceId = typeof edge.source === 'object' ? (edge.source as any).id : edge.source;
      const targetId = typeof edge.target === 'object' ? (edge.target as any).id : edge.target;
      
      if (sourceId === nodeId || targetId === nodeId) {
        connectedEdgeIds.add(`${sourceId}->${targetId}`);
      }
    });
    
    setTracingAllPaths(nodeId);
    setTracedEdges(connectedEdgeIds);
    setShowNodeMenu(false);
  }, [filteredEdges]);

  // Clear path tracing
  const clearPathTracing = useCallback(() => {
    setTracingAllPaths(null);
    setTracedEdges(new Set());
    setHighlightedPath([]);
    setPathStart(null);
  }, []);

  const handleNodeClick = useCallback((node: any, event?: MouseEvent) => {
    setSelectedNode(node);
    
    if (pathStart === null && !tracingAllPaths) {
      // Show context menu with options
      setShowNodeMenu(true);
      if (event) {
        setNodeMenuPosition({ x: event.clientX, y: event.clientY });
      } else {
        // Fallback position if no event
        setNodeMenuPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      }
    } else if (pathStart === node.id) {
      setPathStart(null);
      setHighlightedPath([]);
    } else if (pathStart) {
      const path = findShortestPath(pathStart, node.id);
      setHighlightedPath(path);
      setPathStart(null);
    } else if (tracingAllPaths === node.id) {
      clearPathTracing();
    } else {
      clearPathTracing();
      setShowNodeMenu(true);
      if (event) {
        setNodeMenuPosition({ x: event.clientX, y: event.clientY });
      }
    }
  }, [pathStart, findShortestPath, tracingAllPaths, clearPathTracing]);

  // Handle node hover
  const handleNodeHover = useCallback((node: any, prevNode: any) => {
    if (node) {
      setHoveredNode(node);
    } else {
      setHoveredNode(null);
    }
  }, []);

  // Time-series animation
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTimeSlider(prev => {
        const newValue = prev[0] + 1;
        if (newValue > 100) {
          setIsPlaying(false);
          return [100];
        }
        return [newValue];
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Snapshot management
  const saveSnapshot = () => {
    const snapshot: Snapshot = {
      id: `snapshot_${Date.now()}`,
      name: `Investigation ${snapshots.length + 1}`,
      timestamp: Date.now(),
      filters: {
        searchTerm,
        filterRisk,
        timeSlider: [...timeSlider]
      },
      highlightedPath: [...highlightedPath],
      selectedNode: selectedNode?.id || null
    };
    setSnapshots(prev => [...prev, snapshot]);
    toast.success(`Snapshot "${snapshot.name}" saved successfully!`);
  };

  const loadSnapshot = (snapshot: Snapshot) => {
    setSearchTerm(snapshot.filters.searchTerm);
    setFilterRisk(snapshot.filters.filterRisk);
    setTimeSlider(snapshot.filters.timeSlider);
    setHighlightedPath(snapshot.highlightedPath);
    if (snapshot.selectedNode) {
      const node = graphData.nodes.find(n => n.id === snapshot.selectedNode);
      if (node) setSelectedNode(node);
    }
    toast.info(`Snapshot "${snapshot.name}" loaded`);
  };

  const deleteSnapshot = (id: string) => {
    const snapshot = snapshots.find(s => s.id === id);
    setSnapshots(prev => prev.filter(s => s.id !== id));
    if (snapshot) {
      toast.success(`Snapshot "${snapshot.name}" deleted`);
    }
  };

  // Export functionality
  const handleExport = () => {
    if (!graphRef.current) {
      toast.error('Graph not ready for export');
      return;
    }
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.toBlob(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `crypto-graph-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Graph exported successfully!');
        }
      });
    } else {
      toast.error('Unable to export graph');
    }
  };

  const handleZoomIn = () => graphRef.current?.zoom(1.5, 300);
  const handleZoomOut = () => graphRef.current?.zoom(0.75, 300);
  const handleZoomFit = () => graphRef.current?.zoomToFit(400);

  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
      // Wait a bit for the transition then zoom to fit
      setTimeout(() => handleZoomFit(), 100);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [handleZoomFit]);

  // Track if initial zoom has been done
  const hasInitialZoom = useRef(false);
  
  // Reset zoom tracking when data changes
  useEffect(() => {
    hasInitialZoom.current = false;
  }, [nodeCount]);

  const handleEngineStop = useCallback(() => {
    if (!hasInitialZoom.current && graphRef.current) {
      graphRef.current.zoomToFit(400);
      hasInitialZoom.current = true;
    }
  }, []);

  // Memoize the graph data to prevent unnecessary re-renders
  // Use logarithmic scaling for node size to prevent huge nodes
  const forceGraphData = useMemo(() => ({
    nodes: filteredNodes.map(node => ({
      ...node,
      val: Math.max(1, Math.log2(node.degree.in + node.degree.out + 1)) // Logarithmic scaling
    })),
    links: filteredEdges.map(edge => ({ ...edge }))
  }), [filteredNodes, filteredEdges]);

  // Particle function
  const getLinkParticles = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const edgeKey = `${sourceId}->${targetId}`;
    
    // Animated particles for traced edges
    if (tracedEdges.has(edgeKey)) return 6;
    
    const isInPath = highlightedPath.length > 0 && 
      highlightedPath.includes(link.source.id || link.source) && 
      highlightedPath.includes(link.target.id || link.target);
    return isInPath ? 4 : (link.high_risk ? 2 : 0);
  }, [highlightedPath, tracedEdges]);

  const getLinkParticleColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    const edgeKey = `${sourceId}->${targetId}`;
    
    if (tracedEdges.has(edgeKey)) return '#c084fc'; // Light purple for particles
    return '#a855f7';
  }, [tracedEdges]);

  // Node label function - stable
  const getNodeLabel = useCallback((node: any) => `
      ID: ${node.id}
      Risk: ${node.risk_level}
      Score: ${(node.suspicious_score * 100).toFixed(2)}%
      In: ${node.degree.in} | Out: ${node.degree.out}
      ${node.community ? `Community: ${node.community}` : ''}
      ${node.centrality?.pagerank ? `PageRank: ${node.centrality.pagerank.toFixed(3)}` : ''}
  `, []);

  // Node value function - stable
  const getNodeVal = useCallback((node: any) => node.val, []);

  // Graph props for 2D - don't memoize to avoid reference issues
  const graph2DProps = {
    graphData: forceGraphData,
    width: dimensions.width,
    height: dimensions.height,
    nodeColor: getNodeColor,
    nodeRelSize: 4,
    nodeVal: getNodeVal,
    linkColor: getLinkColor,
    linkWidth: getLinkWidth,
    linkDirectionalParticles: getLinkParticles,
    linkDirectionalParticleWidth: 4,
    linkDirectionalParticleSpeed: 0.012,
    linkDirectionalParticleColor: getLinkParticleColor,
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,
    backgroundColor: 'transparent',
    linkDirectionalArrowLength: 3.5,
    linkDirectionalArrowRelPos: 1,
    cooldownTicks: 100,
    onEngineStop: handleEngineStop
  };

  // Graph props for 3D
  const graph3DProps = {
    graphData: forceGraphData,
    width: dimensions.width,
    height: dimensions.height,
    nodeColor: getNodeColor,
    nodeRelSize: 4,
    nodeVal: getNodeVal,
    linkColor: getLinkColor,
    linkWidth: getLinkWidth,
    linkDirectionalParticles: getLinkParticles,
    linkDirectionalParticleWidth: 4,
    linkDirectionalParticleSpeed: 0.012,
    linkDirectionalParticleColor: getLinkParticleColor,
    onNodeClick: handleNodeClick,
    onNodeHover: handleNodeHover,
    linkDirectionalArrowLength: 3.5,
    linkDirectionalArrowRelPos: 1,
    cooldownTicks: 100,
    onEngineStop: handleEngineStop,
    enableNodeDrag: true,
    enableNavigationControls: true,
    showNavInfo: false
  };

  return (
    <div className="space-y-6">
      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="glass-card p-6 border-red-500/20 bg-red-500/5 animate-on-scroll">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-red-500 uppercase italic tracking-widest mb-4">SECURITY_ALERTS_DETECTED</h3>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3">
                    <span className={`text-[8px] font-bold px-2 py-0.5 border ${alert.severity === 'critical' ? 'border-red-500 text-red-500' : 'border-white/20 text-white/40'} tracking-tighter`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <p className="text-[10px] tracking-widest text-red-500/80 uppercase italic">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Controls */}
      <div className="glass-card p-0 border-white/5 overflow-hidden">
        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="flex w-full bg-white/5 rounded-none border-b border-white/5 h-14 p-0">
            <TabsTrigger value="controls" className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold tracking-[0.2em] uppercase italic transition-all duration-300">CONTROLS</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold tracking-[0.2em] uppercase italic transition-all duration-300">ANALYTICS</TabsTrigger>
            <TabsTrigger value="snapshots" className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold tracking-[0.2em] uppercase italic transition-all duration-300">SNAPSHOTS ({snapshots.length})</TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 rounded-none data-[state=active]:bg-white data-[state=active]:text-black text-[10px] font-bold tracking-[0.2em] uppercase italic transition-all duration-300">TOPOLOGY</TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
              {/* Search */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">SEARCH_NODE:</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
                  <Input
                    placeholder="IDENTIFIER..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest font-mono uppercase italic focus:ring-0 focus:ring-offset-0 transition-all duration-500"
                  />
                </div>
              </div>

              {/* Risk Filter */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">RISK_FILTER:</Label>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest font-mono uppercase italic px-4 focus:ring-0 focus:ring-offset-0 transition-all duration-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-none text-white tracking-widest text-[10px]">
                    <SelectItem value="all" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">ALL_TARGETS</SelectItem>
                    <SelectItem value="high" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">CRITICAL_ONLY</SelectItem>
                    <SelectItem value="medium" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">ELEVATED_ONLY</SelectItem>
                    <SelectItem value="low" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">STABLE_ONLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Centrality Mode */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">TOPOLOGY_HEATMAP:</Label>
                <Select value={centralityMode} onValueChange={(v: any) => setCentralityMode(v)}>
                  <SelectTrigger className="bg-black/40 border-white/10 rounded-none h-12 text-[10px] tracking-widest font-mono uppercase italic px-4 focus:ring-0 focus:ring-offset-0 transition-all duration-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-none text-white tracking-widest text-[10px]">
                    <SelectItem value="none" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">RAW_VIEW</SelectItem>
                    <SelectItem value="pagerank" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">PAGERANK</SelectItem>
                    <SelectItem value="betweenness" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">BETWEENNESS</SelectItem>
                    <SelectItem value="closeness" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">CLOSENESS</SelectItem>
                    <SelectItem value="degree" className="focus:bg-white focus:text-black rounded-none cursor-pointer uppercase italic">DEGREE_MAP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Controls */}
              <div className="space-y-4">
                <Label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">VISUAL_ENGINE:</Label>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className={`flex-1 rounded-none h-12 text-[10px] font-bold tracking-widest uppercase italic transition-all duration-500 ${showCommunities ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                    onClick={() => setShowCommunities(!showCommunities)}
                  >
                    <Layers className="w-3 h-3 mr-2" />
                    GROUPS
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 rounded-none h-12 text-[10px] font-bold tracking-widest uppercase italic bg-white/5 border-white/10 text-white hover:bg-white/10 transition-all duration-500"
                    onClick={saveSnapshot}
                  >
                    <Bookmark className="w-3 h-3 mr-2" />
                    SAVE
                  </Button>
                </div>
              </div>
            </div>

            {/* Time-series Controls */}
            <div className="mx-8 mb-8 p-8 border border-white/5 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-8">
                <Label className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase italic">TEMPORAL_EVOLUTION: {timeSlider[0]}%</Label>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="rounded-none w-12 h-12 border-white/10 bg-white/5 text-white hover:bg-white hover:text-black transition-all duration-500"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-none px-6 h-12 border-white/10 bg-white/5 text-[10px] font-bold tracking-widest uppercase italic text-white/40 hover:text-white transition-all duration-500"
                    onClick={() => setTimeSlider([0])}
                  >
                    RELOAD_TIME
                  </Button>
                </div>
              </div>
              <Slider
                value={timeSlider}
                onValueChange={setTimeSlider}
                max={100}
                step={1}
                className="w-full"
              />
            </div>

            {/* Path Tracing */}
            <div className="flex items-center gap-4 px-8 pb-8">
              <Route className="w-4 h-4 text-white/40" />
              <span className="text-[10px] tracking-widest text-gray-500 uppercase italic">
                {pathStart 
                  ? `SELECT TARGET_NODE TO COMPLETE VECTOR TRACE FROM [${pathStart.slice(0, 8)}...]` 
                  : 'INITIALIZE TOPOLOGY VECTOR TRACE BY SELECTING SOURCE_NODE'}
              </span>
              {pathStart && (
                <Button 
                  variant="outline" 
                  className="h-8 rounded-none text-[10px] font-bold tracking-widest uppercase italic text-red-500 hover:bg-red-500/10 border-red-500/20"
                  onClick={() => {
                    setPathStart(null);
                    setHighlightedPath([]);
                  }}
                >
                  ABORT_TRACE
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="glass-card p-8 border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-white uppercase italic tracking-tighter mb-2">
                  {(((graphData.summary as any)?.top_illicit_ratio 
                  ?? (graphData.summary as any)?.avgSuspiciousScore 
                  ?? 0) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase italic font-bold">ILLICIT_RATIO</div>
              </div>
              <div className="glass-card p-8 border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-white uppercase italic tracking-tighter mb-2">{filteredNodes.length}</div>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase italic font-bold">ACTIVE_NODES</div>
              </div>
              <div className="glass-card p-8 border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-white uppercase italic tracking-tighter mb-2">{alerts.length}</div>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase italic font-bold">ALERTS_TRIGGERED</div>
              </div>
              <div className="glass-card p-8 border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                <div className="text-3xl font-bold text-white uppercase italic tracking-tighter mb-2">
                  {(graphData.summary as any)?.model_confidence ?? "N/A"}
                </div>
                <div className="text-[10px] tracking-widest text-gray-500 uppercase italic font-bold">CONFIDENCE</div>
              </div>
            </div>

            <div className="glass-card p-8 border-white/5 bg-white/[0.02]">
              <h3 className="text-[10px] font-bold tracking-[0.3em] text-gray-500 uppercase italic mb-8 flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                NEURAL_PREDICTIONS_ENGINE
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                  <span className="text-[10px] tracking-widest text-white/60 uppercase italic">NETWORK_GROWTH_EXPECTANCY:</span>
                  <span className="text-[10px] font-bold tracking-widest text-white uppercase italic border border-white/20 px-3 py-1">+15.00% / 07_DAYS</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                  <span className="text-[10px] tracking-widest text-white/60 uppercase italic">RISK_ESCALATION_PROBABILITY:</span>
                  <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase italic border border-red-500/40 px-3 py-1">CRITICAL_VULNERABILITY</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 p-4 border border-white/5">
                  <span className="text-[10px] tracking-widest text-white/60 uppercase italic">TARGETED_ANALYST_RECORDS:</span>
                  <span className="text-[10px] font-bold tracking-widest text-white uppercase italic border border-white/20 px-3 py-1">TX_016 (EXTRAPOLATED)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="snapshots" className="p-8">
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {snapshots.length === 0 ? (
                  <div className="col-span-full text-center py-24 border border-dashed border-white/10 bg-white/[0.02]">
                    <Bookmark className="w-12 h-12 mx-auto mb-6 text-white/10" />
                    <p className="text-[10px] tracking-extra-widest text-gray-500 uppercase italic">SYSTEM_RECORDS_EMPTY</p>
                    <p className="text-[8px] tracking-widest text-gray-600 uppercase italic mt-2">Initialize topology snapshots in 'CONTROLS' layer.</p>
                  </div>
                ) : (
                  snapshots.map(snapshot => (
                    <div key={snapshot.id} className="glass-card p-6 border-white/10 bg-black/40 hover:border-white/30 transition-all duration-500">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white uppercase italic tracking-widest mb-2">{snapshot.name}</div>
                          <div className="text-[10px] tracking-widest text-gray-500 font-mono">
                            TIMESTAMP: {new Date(snapshot.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            variant="outline"
                            className="rounded-none px-6 h-10 border-white/10 bg-white/5 text-[10px] font-bold tracking-widest uppercase italic text-white hover:bg-white hover:text-black transition-all duration-500"
                            onClick={() => loadSnapshot(snapshot)}
                          >
                            RESTORE
                          </Button>
                          <Button
                            variant="outline"
                            className="rounded-none px-6 h-10 text-[10px] font-bold tracking-widest uppercase italic text-red-500 hover:bg-red-500/10 border-red-500/20"
                            onClick={() => deleteSnapshot(snapshot.id)}
                          >
                            PURGE
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats" className="p-8">
            {networkStats && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    <Network className="w-4 h-4 text-white" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">DENSITY</div>
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic tracking-tighter">{networkStats.density}%</div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    <BarChart3 className="w-4 h-4 text-white" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">CLUSTERING</div>
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic tracking-tighter">{networkStats.avgClustering}</div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    <Layers className="w-4 h-4 text-white" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">COMMUNITIES</div>
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic tracking-tighter">{networkStats.communities}</div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    <Info className="w-4 h-4 text-white" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">DIAMETER</div>
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic tracking-tighter">{networkStats.diameter} HOPS</div>
                </div>
                <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3 mb-4 opacity-40">
                    <Network className="w-4 h-4 text-white" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">DEG_AVG</div>
                  </div>
                  <div className="text-2xl font-bold text-white uppercase italic tracking-tighter">{networkStats.avgDegree}</div>
                </div>
                <div className="glass-card p-6 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-4 text-red-500">
                    <AlertTriangle className="w-4 h-4" />
                    <div className="text-[10px] font-bold tracking-widest uppercase italic">RISK_RATIO</div>
                  </div>
                  <div className="text-2xl font-bold text-red-500 uppercase italic tracking-tighter">{networkStats.illicitRatio}%</div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Graph Container */}
      <div className="glass-card p-0 border-white/5 bg-transparent overflow-hidden">
        <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-10">
            <h3 className="text-sm font-bold text-white uppercase italic tracking-[0.3em]">TOPOLOGY_VIEWPORT</h3>
            <div className="flex items-center gap-4">
              <Label htmlFor="3d-mode" className="text-[10px] font-bold text-gray-500 uppercase italic flex items-center gap-2 tracking-widest">
                <Box className="w-3 h-3" />
                NEURAL_DEPTH_3D
              </Label>
              <Switch
                id="3d-mode"
                checked={is3D}
                onCheckedChange={setIs3D}
                className="data-[state=checked]:bg-white"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 w-12 h-12 p-0 hover:bg-white hover:text-black transition-all duration-500" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 w-12 h-12 p-0 hover:bg-white hover:text-black transition-all duration-500" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              className="rounded-none border-white/10 bg-white/5 w-12 h-12 p-0 hover:bg-white hover:text-black transition-all duration-500"
              onClick={toggleFullScreen}
              title={isFullScreen ? "EXIT_FULLSCREEN" : "INITIALIZE_FULLSCREEN"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
            <Button variant="outline" className="rounded-none border-white/10 bg-white/5 w-12 h-12 p-0 hover:bg-white hover:text-black transition-all duration-500" onClick={handleExport}>
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div 
          ref={containerRef} 
          className={`relative overflow-hidden transition-all duration-300 ${
            isFullScreen ? 'fixed inset-0 z-[9999] bg-black' : 'bg-black/80'
          }`} 
          style={{ width: '100%', height: isFullScreen ? '100vh' : '800px' }}
        >
          {is3D ? (
            <ForceGraph3D ref={graphRef} {...graph3DProps} />
          ) : (
            <ForceGraph2D ref={graphRef} {...graph2DProps} />
          )}
          
          {/* Hover Tooltip - Redesigned as High-Tech HUD */}
          {hoveredNode && (
            <div 
              className="absolute z-50 pointer-events-none"
              style={{ 
                left: '20px',
                bottom: '20px',
                width: '400px'
              }}
            >
              <div className="bg-black/90 backdrop-blur-xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                {/* Header */}
                <div className={`px-6 py-4 border-b border-white/5 ${
                  hoveredNode.risk_level === 'high' ? 'bg-red-500/10' :
                  hoveredNode.risk_level === 'medium' ? 'bg-amber-500/10' : 'bg-white/5'
                }`}>
                  <div className="flex justify-between items-center mb-2">
                    <div className={`text-[10px] font-bold tracking-widest uppercase italic ${
                      hoveredNode.risk_level === 'high' ? 'text-red-500' :
                      hoveredNode.risk_level === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {getNodeExplanation(hoveredNode).title}
                    </div>
                    <span className="text-[8px] font-mono text-white/20 tracking-tighter">NODE_IDENTIFIER</span>
                  </div>
                  <div className="font-mono text-xs text-white tracking-widest uppercase truncate">{hoveredNode.id}</div>
                </div>
                
                {/* Explanation */}
                <div className="px-6 py-5 space-y-4 bg-white/[0.02]">
                  {getNodeExplanation(hoveredNode).reasons.map((reason, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="w-1 h-3 bg-white/10" />
                      <div className="text-[9px] tracking-widest text-white/60 uppercase italic">{reason}</div>
                    </div>
                  ))}
                  <div className="text-[9px] text-white/40 italic tracking-widest leading-relaxed pt-4 border-t border-white/5 mt-4 uppercase">
                    SYSTEM_VERDICT: {getNodeExplanation(hoveredNode).verdict}
                  </div>
                </div>
                
                {/* Stats HUD */}
                <div className="px-6 py-6 bg-black grid grid-cols-3 gap-6 border-t border-white/5">
                  <div className="flex flex-col gap-2">
                    <span className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">RISK_COEF</span>
                    <div className={`text-xl font-bold uppercase italic tracking-tighter ${
                      hoveredNode.risk_level === 'high' ? 'text-red-500' :
                      hoveredNode.risk_level === 'medium' ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {((hoveredNode.suspicious_score || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                    <span className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">IN_VECTORS</span>
                    <div className="text-xl font-bold text-white uppercase italic tracking-tighter">
                      {hoveredNode.degree?.in || 0}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border-l border-white/5 pl-6">
                    <span className="text-[8px] font-bold tracking-widest text-gray-500 uppercase">OUT_VECTORS</span>
                    <div className="text-xl font-bold text-white uppercase italic tracking-tighter">
                      {hoveredNode.degree?.out || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Path Tracing Indicator */}
          {tracingAllPaths && (
            <div className="absolute top-8 left-8 z-40">
              <div className="bg-black/90 backdrop-blur-xl border border-white/20 p-6 flex flex-col gap-4 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-4">
                  <GitBranch className="h-4 w-4 text-white animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest text-white uppercase italic">
                    VECTOR_TRACE: <span className="text-white/40">{tracingAllPaths.slice(0, 16)}...</span>
                  </span>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex flex-col gap-1">
                     <span className="text-[8px] text-gray-500 uppercase italic">EDGES_MAPPED</span>
                     <span className="text-lg font-bold text-white italic tracking-tighter">{tracedEdges.size}</span>
                   </div>
                   <Button 
                    onClick={clearPathTracing}
                    className="ml-auto rounded-none border border-red-500/40 bg-red-500/5 text-[10px] h-10 px-6 font-bold tracking-widest uppercase italic text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500"
                  >
                    TERMINATE_TRACE
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Node Click Context Menu - High Tech HUD style */}
        {showNodeMenu && selectedNode && (
          <>
            <div 
              className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-[2px]" 
              onClick={() => setShowNodeMenu(false)}
            />
            <div 
              className="fixed z-[100]"
              style={{ 
                left: Math.min(nodeMenuPosition.x, window.innerWidth - 300),
                top: Math.min(nodeMenuPosition.y, window.innerHeight - 250)
              }}
            >
              <div className="bg-black/90 backdrop-blur-2xl border border-white/10 rounded-none shadow-[0_0_100px_rgba(255,255,255,0.1)] overflow-hidden min-w-[240px]">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5">
                  <div className="text-[8px] font-bold tracking-widest text-white/40 uppercase italic mb-2">NODE_SELECTION:</div>
                  <div className="text-xs font-mono text-white tracking-widest truncate">{selectedNode.id}</div>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => traceAllPaths(selectedNode.id)}
                    className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-500 uppercase italic"
                  >
                    <span>TRACE_ALL_VECTORS</span>
                    <GitBranch className="h-4 w-4 opacity-40" />
                  </button>
                  <button
                    onClick={() => {
                      setPathStart(selectedNode.id);
                      setShowNodeMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-white hover:bg-white hover:text-black transition-all duration-500 uppercase italic"
                  >
                    <span>TRACE_SOURCE_FLOW</span>
                    <Route className="h-4 w-4 opacity-40" />
                  </button>
                  <button
                    onClick={() => setShowNodeMenu(false)}
                    className="w-full flex items-center justify-between px-6 py-4 text-[10px] font-bold tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 uppercase italic"
                  >
                    <span>CLOSE_HUD</span>
                    <X className="h-4 w-4 opacity-40" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Selected Node Info - Redesigned as Bottom Panel */}
      {selectedNode && (
        <div className="glass-card p-10 border-white/10 bg-white/[0.02] animate-on-scroll">
          <div className="flex items-start justify-between mb-12">
            <h3 className="text-sm font-bold text-white uppercase italic tracking-[0.3em] flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              TOPOLOGY_NODE_DETAILS
            </h3>
            <Button variant="ghost" className="rounded-none text-[10px] font-bold tracking-widest uppercase italic text-white/40 hover:text-white hover:bg-transparent" onClick={() => setSelectedNode(null)}>DISMISS_RECORDS</Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">IDENTIFIER:</div>
              <div className="font-mono text-xs text-white tracking-widest uppercase truncate border-b border-white/10 pb-2">{selectedNode.id}</div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">RISK_LEVEL:</div>
              <div className={`text-xs font-bold uppercase italic tracking-[0.2em] ${selectedNode.risk_level === 'high' ? 'text-red-500' : 'text-white'}`}>
                {selectedNode.risk_level === 'high' ? 'CRITICAL_RISK' : selectedNode.risk_level === 'medium' ? 'ELEVATED_RISK' : 'STABLE_NODE'}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">ANOMALY_COEF:</div>
              <div className="text-xl font-bold text-white uppercase italic tracking-tighter">{(selectedNode.suspicious_score * 100).toFixed(2)}%</div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">CLASSIFICATION:</div>
               <div className={`text-xs font-bold uppercase italic tracking-[0.2em] ${selectedNode.class === 'illicit' ? 'text-red-500' : 'text-white'}`}>
                {selectedNode.class.toUpperCase()}
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">INGRESS_VECTORS:</div>
              <div className="text-xl font-bold text-white uppercase italic tracking-tighter">{selectedNode.degree.in}</div>
            </div>
            <div className="space-y-3">
              <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">EGRESS_VECTORS:</div>
              <div className="text-xl font-bold text-white uppercase italic tracking-tighter">{selectedNode.degree.out}</div>
            </div>
            {selectedNode.community && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">AFFILIATION_GROUP:</div>
                <div className="text-xs font-bold border border-white/20 px-3 py-1 inline-block uppercase italic tracking-widest text-white">
                  CTR_{selectedNode.community}
                </div>
              </div>
            )}
            {selectedNode.centrality?.pagerank && (
              <div className="space-y-3">
                <div className="text-[10px] font-bold tracking-widest text-gray-500 uppercase italic">PAGERANK_INDEX:</div>
                <div className="text-xl font-bold text-white uppercase italic tracking-tighter">{selectedNode.centrality.pagerank.toFixed(4)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraGraphVisualization;

