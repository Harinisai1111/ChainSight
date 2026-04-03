import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  GitBranch, 
  ArrowRightLeft, 
  GitMerge, 
  Repeat, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  ArrowUpRight,
  Info,
  Layers,
  CircleDot
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const patterns = [
  {
    id: 1,
    name: "Peeling Chain",
    icon: CircleDot,
    description: "Sequential transactions with decreasing amounts (obfuscation technique).",
    riskLevel: "CRITICAL",
    color: "bg-red-500/20 text-red-500",
    example: "100 → 95 → 90 → 85 → 80 (gradually 'peeling off' amounts)",
    indicators: ["Linear transaction chain", "Decreasing amounts at each hop", "Time delays between hops"],
    detectionMethod: "Sequential pattern analysis + amount decay detection",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <defs>
          <linearGradient id="peelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#f43f5e', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#fb7185', stopOpacity: 0.2 }} />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((idx) => (
          <g key={idx}>
            <circle 
              cx={30 + idx * 35} 
              cy="60" 
              r={12 - idx * 2} 
              fill={`rgba(244, 63, 94, ${1 - idx * 0.15})`} 
              className={idx === 0 ? "glow-red" : ""}
            />
            {idx < 4 && (
              <path 
                d={`M ${42 + idx * 35} 60 L ${63 + idx * 35} 60`} 
                stroke="white" 
                strokeOpacity="0.2" 
                strokeWidth="1.5" 
                markerEnd="url(#arrowhead)" 
              />
            )}
          </g>
        ))}
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 5 3.5, 0 7" fill="white" fillOpacity="0.3" />
        </marker>
      </svg>
    )
  },
  {
    id: 2,
    name: "Layering Pattern",
    icon: Layers,
    description: "Complex multi-hop transactions to obscure origin and break audit trails.",
    riskLevel: "HIGH",
    color: "bg-orange-500/20 text-orange-500",
    example: "Source → A → B → C (Layered) → D → Sink",
    indicators: ["High number of hops (5+)", "Mix of different wallet types", "Cross-exchange transfers"],
    detectionMethod: "Path length analysis + graph complexity metrics",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <g transform="translate(20, 20)">
          <circle cx="0" cy="40" r="8" fill="#6366f1" className="glow-indigo" />
          <line x1="8" y1="40" x2="40" y2="20" stroke="white" strokeOpacity="0.2" />
          <line x1="8" y1="40" x2="40" y2="60" stroke="white" strokeOpacity="0.2" />
          <circle cx="40" cy="20" r="6" fill="#818cf8" />
          <circle cx="40" cy="60" r="6" fill="#818cf8" />
          <line x1="46" y1="20" x2="80" y2="40" stroke="white" strokeOpacity="0.2" />
          <line x1="46" y1="60" x2="80" y2="40" stroke="white" strokeOpacity="0.2" />
          <circle cx="80" cy="40" r="6" fill="#c084fc" />
          <line x1="86" y1="40" x2="120" y2="40" stroke="white" strokeOpacity="0.2" />
          <circle cx="130" cy="40" r="8" fill="white" fillOpacity="0.1" stroke="white" strokeOpacity="0.2" />
        </g>
      </svg>
    )
  },
  {
    id: 3,
    name: "Fan-Out Vector",
    icon: GitBranch,
    description: "High-volume dispersal protocol. Single origin splitting into multiple tertiary nodes.",
    riskLevel: "CRITICAL",
    color: "bg-red-500/20 text-red-500",
    example: "0x1A... → 50+ DESTINATIONS (FRAGMENTED)",
    indicators: ["Source Centrality", "Temporal Sync", "Node Inactivity"],
    detectionMethod: "Centrality entropy calculation + burst dispersal detection",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        <circle cx="30" cy="60" r="12" fill="#22c55e" className="glow-green" />
        {[0, 1, 2, 3, 4].map((idx) => (
          <g key={idx}>
            <line x1="42" y1="60" x2="150" y2={20 + idx * 20} stroke="#a3e635" strokeOpacity="0.3" strokeWidth="1.5" />
            <circle cx="160" cy={20 + idx * 20} r="6" fill="#a3e635" fillOpacity="0.4" />
          </g>
        ))}
      </svg>
    )
  },
  {
    id: 4,
    name: "Fan-In Consolidation",
    icon: GitMerge,
    description: "Multi-node aggregation protocol. Converging flows into indexed destination.",
    riskLevel: "HIGH",
    color: "bg-orange-500/20 text-orange-500",
    example: "50+ SOURCES → 0xB2... (AGGREGATION)",
    indicators: ["Origin Convergence", "Single Sink Node", "Temporal Flux"],
    detectionMethod: "Sink node identification + inflow volume thresholding",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        {[0, 1, 2, 3, 4].map((idx) => (
          <g key={idx}>
            <circle cx="40" cy={20 + idx * 20} r="6" fill="#fb923c" fillOpacity="0.4" />
            <line x1="50" y1={20 + idx * 20} x2="158" y2="60" stroke="#fb923c" strokeOpacity="0.3" strokeWidth="1.5" />
          </g>
        ))}
        <circle cx="170" cy="60" r="12" fill="#f97316" className="glow-orange" />
      </svg>
    )
  },
  {
    id: 5,
    name: "Cyclic Recirculation",
    icon: Repeat,
    description: "Circular topology protocol. Multi-hop transit returning to source origin.",
    riskLevel: "HIGH",
    color: "bg-orange-500/20 text-orange-500",
    example: "A → B → C → D → E → F → A",
    indicators: ["Closed Loop", "Source-Sink Parity", "Multi-hop Obfuscation"],
    detectionMethod: "Graph cycle detection (Tarjan's/Johnson's) + flow persistence",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        {['A', 'B', 'C', 'D', 'E', 'F'].map((label, idx) => {
          const angle = (idx * 60 - 90) * Math.PI / 180;
          const x = 100 + 50 * Math.cos(angle);
          const y = 60 + 35 * Math.sin(angle);
          const nextAngle = ((idx + 1) * 60 - 90) * Math.PI / 180;
          const nextX = 100 + 50 * Math.cos(nextAngle);
          const nextY = 60 + 35 * Math.sin(nextAngle);
          return (
            <g key={idx}>
              <line x1={x} y1={y} x2={nextX} y2={nextY} stroke="#818cf8" strokeOpacity="0.4" strokeWidth="2" />
              <circle cx={x} cy={y} r="8" fill="#6366f1" className="glow-indigo" />
            </g>
          );
        })}
      </svg>
    )
  },
  {
    id: 6,
    name: "Gather-Scatter Hub",
    icon: ArrowRightLeft,
    description: "Hub-and-spoke transit protocol. Concentration followed by rapid redistribution.",
    riskLevel: "MEDIUM",
    color: "bg-green-500/20 text-green-500",
    example: "MULTI-SOURCE → HUB → MULTI-DEST",
    indicators: ["Consecutive Fan-In/Out", "Hub Identification", "Cross-Vector Correlation"],
    detectionMethod: "Intermediate node flow balancing + high-degree hub detection",
    svg: () => (
      <svg viewBox="0 0 200 120" className="w-full h-32">
        {[0, 1, 2].map((idx) => (
          <g key={`left-${idx}`}>
            <circle cx="20" cy={30 + idx * 30} r="5" fill="#22c55e" fillOpacity="0.6" />
            <line x1="28" y1={30 + idx * 30} x2="90" y2="60" stroke="#22c55e" strokeOpacity="0.3" strokeWidth="1.5" />
          </g>
        ))}
        <circle cx="100" cy="60" r="12" fill="#eab308" className="glow-yellow" />
        {[0, 1, 2].map((idx) => (
          <g key={`right-${idx}`}>
            <line x1="110" y1="60" x2="172" y2={30 + idx * 30} stroke="#f43f5e" strokeOpacity="0.3" strokeWidth="1.5" />
            <circle cx="180" cy={30 + idx * 30} r="5" fill="#f43f5e" fillOpacity="0.6" />
          </g>
        ))}
      </svg>
    )
  }
];

export default function Patterns() {
  const [selectedPattern, setSelectedPattern] = useState<typeof patterns[0] | null>(null);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Intelligence Patterns</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Algorithmic detection of advanced obfuscation protocols.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 px-6 py-3 rounded-full border border-white/5">
             <div className="w-2 h-2 rounded-full gradient-green glow-green"></div>
             <span className="text-[11px] font-bold tracking-widest uppercase">Patterns Indexed: 0{patterns.length}</span>
          </div>
        </div>

        {/* Pattern Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {patterns.map((pattern) => (
            <div 
              key={pattern.id} 
              className="glass-card p-10 space-y-8 group hover:border-white/20 transition-all duration-500 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500">
                     <pattern.icon className="h-6 w-6 text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{pattern.name}</h3>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                  pattern.riskLevel === 'CRITICAL' ? 'gradient-red text-white glow-red' : 
                  pattern.riskLevel === 'HIGH' ? 'gradient-orange text-black glow-orange' : 
                  'gradient-green text-black glow-green'
                }`}>
                  {pattern.riskLevel}
                </div>
              </div>

              <p className="text-sm text-gray-500 leading-relaxed uppercase tracking-widest font-medium">
                {pattern.description}
              </p>

              {/* Visual Pattern Area */}
              <div className="bg-white/[0.02] rounded-[2rem] p-6 border border-white/5 relative group-hover:bg-white/[0.04] transition-colors">
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-grid-3d scale-150 rotate-0"></div>
                {pattern.svg()}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-bold text-gray-600 uppercase tracking-extra-widest mb-2">Topology</p>
                   <p className="text-[10px] font-mono text-white/60 tracking-tighter truncate">{pattern.example}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                   <p className="text-[9px] font-bold text-gray-600 uppercase tracking-extra-widest mb-2">Confidence</p>
                   <p className="text-sm font-bold text-white">94.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <button 
                  onClick={() => setSelectedPattern(pattern)}
                  className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center space-x-1 group/btn"
                 >
                   <span>Detection Log</span>
                   <ArrowUpRight className="h-3 w-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                 </button>
                 <div className="flex space-x-2">
                   {pattern.indicators.map((ind, i) => (
                     <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-indigo-500/40 transition-colors"></span>
                   ))}
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Detection Insights */}
        <Dialog open={!!selectedPattern} onOpenChange={(open) => !open && setSelectedPattern(null)}>
          <DialogContent className="sm:max-w-[500px] glass-card border-white/10 p-10 space-y-8 animate-in fade-in zoom-in duration-300">
            {selectedPattern && (
              <>
                <DialogHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                      <selectedPattern.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${selectedPattern.color}`}>
                      {selectedPattern.riskLevel}
                    </div>
                  </div>
                  <DialogTitle className="text-3xl font-bold tracking-tight text-white">{selectedPattern.name}</DialogTitle>
                  <DialogDescription className="text-gray-400 text-sm leading-relaxed uppercase tracking-widest font-medium">
                    Detailed intelligence briefing on the {selectedPattern.name} protocol.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-extra-widest">Example Topology</h4>
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-indigo-300 tracking-wider">
                      {selectedPattern.example}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-extra-widest">Detection Method</h4>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[11px] font-bold text-white uppercase tracking-widest">
                      {selectedPattern.detectionMethod}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-extra-widest">Key Indicators</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedPattern.indicators.map((indicator, i) => (
                        <div key={i} className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-gray-300 bg-white/[0.02] p-3 rounded-lg border border-white/5">
                          <Info className="h-3 w-3 text-indigo-500" />
                          <span>{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
