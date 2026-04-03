import { DashboardLayout } from "@/components/DashboardLayout";
import { TrendingUp, Target, Clock, Award, Cpu, Database, Shield, Zap, Activity, ArrowUpRight } from "lucide-react";

export default function Benchmarks() {
  const performanceMetrics = [
    { label: "Model Accuracy", value: 98.5, description: "Validation on global dataset", color: 'gradient-green' },
    { label: "Precision Index", value: 96.2, description: "Illicit vector classification", color: 'gradient-orange' },
    { label: "Recall Rate", value: 94.8, description: "True positive discovery", color: 'gradient-green' },
    { label: "F1 Classifier", value: 95.5, description: "Harmonic mean optimization", color: 'gradient-orange' },
  ];

  const comparisonData = [
    { method: "ChainSight GNN", accuracy: 98.5, speed: "2.4s", latency: "LOW", status: 'Active' },
    { method: "XGBoost Classifier", accuracy: 88.7, speed: "6.2s", latency: "MED", status: 'Legacy' },
    { method: "Random Forest", accuracy: 85.3, speed: "8.1s", latency: "HIGH", status: 'Legacy' },
    { method: "Rule-Based Engine", accuracy: 72.1, speed: "15.3s", latency: "CRIT", status: 'Legacy' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">Performance Benchmarks</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Quantitative evaluation of neural network efficacy.</p>
          </div>
          <div className="flex items-center space-x-4 bg-white/5 px-6 py-3 rounded-full border border-white/5">
             <Cpu className="h-4 w-4 text-green-500" />
             <span className="text-[11px] font-bold tracking-widest uppercase">GNN-V4 // Optimized</span>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="glass-card p-8 group hover:scale-[1.02] transition-all duration-300">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</span>
                  <Activity className="h-3 w-3 text-white/20" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tighter">
                    {metric.value}
                  </span>
                  <span className="text-xs font-bold text-gray-500">%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${metric.color} transition-all duration-1000 ease-out`} 
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
                <p className="text-[9px] text-gray-500 tracking-widest uppercase font-bold leading-relaxed">
                  {metric.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ROC Analysis (Solis-style large chart) */}
          <div className="lg:col-span-2 glass-card p-10 space-y-8 flex flex-col justify-between h-[500px]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight">ROC Curve Analysis</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Probabilistic classifier performance</p>
              </div>
              <div className="bg-white text-black px-6 py-3 rounded-full shadow-xl">
                <span className="text-2xl font-bold tracking-tighter italic">0.985</span>
                <span className="ml-2 text-[10px] font-bold uppercase tracking-widest opacity-60">AUC</span>
              </div>
            </div>

            <div className="flex-1 relative flex items-end justify-center py-10 px-4">
               <div className="absolute inset-0 opacity-10 pointer-events-none bg-grid-3d scale-110"></div>
               <svg viewBox="0 0 400 200" className="w-full h-full relative z-10 drop-shadow-2xl">
                 <path
                   d="M 0 200 Q 50 120, 150 60 T 300 20 T 400 0"
                   fill="none"
                   stroke="url(#rocGrad)"
                   strokeWidth="6"
                   strokeLinecap="round"
                   className="animate-on-scroll show"
                 />
                 <path
                   d="M 0 200 Q 50 120, 150 60 T 300 20 T 400 0 L 400 200 L 0 200 Z"
                   fill="url(#areaGrad)"
                   className="opacity-10"
                 />
                 <defs>
                   <linearGradient id="rocGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                     <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
                     <stop offset="100%" style={{ stopColor: '#a3e635', stopOpacity: 1 }} />
                   </linearGradient>
                   <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 0.5 }} />
                     <stop offset="100%" style={{ stopColor: 'transparent', stopOpacity: 0 }} />
                   </linearGradient>
                 </defs>
                 <circle cx="400" cy="0" r="6" fill="white" className="glow-green" />
               </svg>
               <div className="absolute top-0 right-0 p-4">
                  <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-xl">
                     <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Network health</p>
                     <p className="text-xl font-bold">+3.5%</p>
                  </div>
               </div>
            </div>
            
            <div className="flex items-center space-x-6">
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full gradient-green"></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model Output</span>
               </div>
               <div className="flex items-center space-x-2 border-l border-white/10 pl-6">
                 <div className="w-2 h-2 rounded-full bg-white/20"></div>
                 <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Baseline</span>
               </div>
            </div>
          </div>

          {/* Infrastructure Column (Solis-style Bento) */}
          <div className="glass-card p-10 flex flex-col justify-between h-[500px]">
            <div className="space-y-8">
              <h3 className="text-xl font-bold tracking-tight">Node Systems</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, label: "Architecture", value: "3-Layer GCN", color: 'text-green-500' },
                  { icon: Zap, label: "Latency", value: "< 240ms", color: 'text-orange-400' },
                  { icon: Database, label: "Dataset", value: "2.5M TX", color: 'text-blue-400' },
                  { icon: Target, label: "Status", value: "ReadyState", color: 'text-white' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-black/40 ${item.color}`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-bold text-white tracking-widest">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-10 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Optimization Log</span>
                <ArrowUpRight className="h-3 w-3 text-gray-500" />
              </div>
              <div className="space-y-3">
                {[
                  "Adam_Optimizer_Init",
                  "Loss_Reduction_Stable",
                  "Vector_Quant_Complete"
                ].map((log, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full gradient-green opacity-40"></div>
                    <span className="text-[10px] font-mono text-gray-500 tracking-tighter">{log}... Success</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Matrix (Clean Glass Table) */}
        <div className="glass-card p-12 space-y-10 overflow-hidden relative">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold tracking-tight">Competitive Matrix</h3>
            <button className="px-6 py-2 bg-white/5 text-[10px] font-bold rounded-full uppercase tracking-widest border border-white/10 hover:bg-white/10">Full Report</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                  <th className="pb-6">Methodology</th>
                  <th className="pb-6 text-center">Precision</th>
                  <th className="pb-6 text-center">Inference Speed</th>
                  <th className="pb-6 text-right">System Load</th>
                </tr>
              </thead>
              <tbody className="text-[11px] font-bold uppercase tracking-widest">
                {comparisonData.map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5">
                    <td className="py-8 flex items-center gap-4">
                      <span className="w-1.5 h-1.5 rounded-full gradient-green opacity-40"></span>
                      <span className={i === 0 ? "text-white text-sm" : "text-gray-500"}>{row.method}</span>
                      {i === 0 && <span className="text-[8px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 ml-2">Primary</span>}
                    </td>
                    <td className="py-8">
                      <div className="flex flex-col items-center gap-2">
                        <span className={i === 0 ? "text-white" : "text-gray-500"}>{row.accuracy}%</span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${i === 0 ? 'gradient-green' : 'bg-white/20'}`} style={{ width: `${row.accuracy}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="py-8 text-center text-gray-500 font-mono">
                      {row.speed}
                    </td>
                    <td className="py-8 text-right">
                      <span className={`px-4 py-1.5 rounded-full border text-[9px] ${
                        row.latency === 'LOW' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-white/5 text-gray-600'
                      }`}>
                        {row.latency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
