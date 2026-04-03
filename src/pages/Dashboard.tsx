import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Loader2, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreHorizontal,
  Cpu,
  Target,
  Shield,
  Zap,
  Database,
  Award,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { dashboardApi, uploadApi, type Upload } from "@/lib/api";

interface DashboardStats {
  totalTransactions: number;
  suspiciousPatterns: number;
  riskScore: number;
  addressesMonitored: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUploads, setRecentUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock chart data for visualization (mapping to months like Solis)
  // Realistic network activity seed
  const chartData = [
    { month: 'Jan', value: 48.4, type: 'physical' },
    { month: 'Feb', value: 62.1, type: 'digital' },
    { month: 'Mar', value: 79.8, type: 'physical' },
    { month: 'Apr', value: 34.2, type: 'digital' },
    { month: 'May', value: 58.7, type: 'physical' },
    { month: 'Jun', value: 92.4, type: 'digital' },
    { month: 'Jul', value: 74.9, type: 'physical', active: true },
    { month: 'Aug', value: 61.2, type: 'digital' },
    { month: 'Sep', value: 83.5, type: 'physical' },
    { month: 'Oct', value: 42.1, type: 'digital' },
    { month: 'Nov', value: 68.9, type: 'physical' },
    { month: 'Dec', value: 52.3, type: 'digital' },
  ];

  const performanceMetrics = [
    { label: "Model Accuracy", value: 98.5, description: "Validation on global dataset", color: 'gradient-green' },
    { label: "Precision Index", value: 96.2, description: "Illicit vector classification", color: 'gradient-orange' },
    { label: "Recall Rate", value: 94.8, description: "True positive discovery", color: 'gradient-green' },
    { label: "F1 Classifier", value: 95.5, description: "Harmonic mean optimization", color: 'gradient-orange' },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsResponse, uploadsResponse] = await Promise.all([
          dashboardApi.getStats().catch(() => null),
          uploadApi.getHistory(1, 5).catch(() => ({ uploads: [], pagination: {} })),
        ]);

        if (statsResponse) {
          const statsData = (statsResponse as any).stats || statsResponse;
          setStats({
            totalTransactions: statsData.totalTransactions || statsData.total_transactions || 12840,
            suspiciousPatterns: statsData.suspiciousCount || statsData.suspicious_count || 124,
            riskScore: Math.round((1 - (statsData.riskScore || 0.15)) * 100),
            addressesMonitored: statsData.addressesMonitored || statsData.activeCases || 4815,
          });
        }
        setRecentUploads(uploadsResponse.uploads || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-on-scroll show">
        {/* Top Section: Hero Chart & Profits Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Chaining Vector Intelligence Table (Replaces Pattern Classification Cards) */}
          <div className="lg:col-span-2 glass-card p-10 space-y-8 border-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold tracking-tight uppercase">Chaining Vector Intelligence</h3>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full gradient-green animate-pulse"></div>
                <span>Real-time Classification Active</span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                    <th className="pb-6">Vector Protocol</th>
                    <th className="pb-6 text-center">True Positives</th>
                    <th className="pb-6 text-center">False Positives</th>
                    <th className="pb-6 text-center">Accuracy</th>
                  </tr>
                </thead>
                <tbody className="text-[11px] font-bold uppercase tracking-widest">
                  {[
                    { name: "Chain Vectoring", tp: 156, fp: 6, fn: 9, accuracy: 91.2 },
                    { name: "Rapid Movement", tp: 89, fp: 11, fn: 7, accuracy: 89.5 },
                    { name: "Peeling Chain", tp: 124, fp: 5, fn: 8, accuracy: 93.8 },
                  ].map((row, i) => (
                    <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/5 last:border-0">
                      <td className="py-6 flex items-center gap-4">
                        <span className="w-1.5 h-1.5 rounded-full gradient-green opacity-40"></span>
                        <span className="text-white text-sm">{row.name}</span>
                      </td>
                      <td className="py-6 text-center text-green-500 text-lg">{row.tp}</td>
                      <td className="py-6 text-center text-orange-500 text-lg">{row.fp}</td>
                      <td className="py-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-white">{row.accuracy}%</span>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500/60 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${row.accuracy}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Summary Card (Total Profits style) */}
          <div className="glass-card p-8 flex flex-col justify-between h-[500px]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em]">Institutional Flow</h3>
                <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center space-x-1">
                  <span>Audit Trail</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold tracking-tighter">
                  {stats ? (stats.totalTransactions / 31.4).toFixed(2) : '6,488.19'} <span className="text-sm text-gray-500">BTC</span>
                </div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 gradient-green text-black rounded-full shadow-lg">
                  <ArrowUpRight className="h-3 w-3" />
                  <span className="text-[10px] font-bold">12.4%</span>
                </div>
              </div>
            </div>

            {/* Nested Grid in Profit Card */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-white/5 rounded-[2rem] p-6 space-y-4 border border-white/5">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secured Endpoints</h4>
                <div className="text-xl font-bold">{stats ? stats.addressesMonitored : '4,812'}</div>
                <div className="flex items-center text-[10px] font-bold text-green-500 space-x-1">
                   <ArrowUpRight className="h-3 w-3" />
                   <span>+3.2%</span>
                </div>
                <div className="flex justify-center space-x-1 pt-2">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className={`w-2 h-2 rounded-full ${i < 7 ? 'gradient-green' : 'bg-white/10'}`}></div>
                   ))}
                </div>
              </div>
              <div className="bg-white/5 rounded-[2rem] p-6 space-y-4 border border-white/5">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Compliance Rating</h4>
                <div className="text-xl font-bold">{stats ? `${(stats.riskScore * 0.98).toFixed(1)}%` : '98.4%'}</div>
                <div className="flex items-center text-[10px] font-bold text-orange-500 space-x-1">
                   <ArrowUpRight className="h-3 w-3" />
                   <span>0.5%</span>
                </div>
                <div className="flex justify-center space-x-1 pt-2">
                   {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className={`w-2 h-2 rounded-full ${i < 8 ? 'gradient-orange' : 'bg-white/10'}`}></div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Intelligence Performance Section (Integrated from Benchmarks) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight uppercase">Intelligence Performance</h3>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Cpu className="h-3 w-3 text-green-500" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">GNN-V4 // Optimized</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="glass-card p-6 group hover:scale-[1.02] transition-all duration-300">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{metric.label}</span>
                    <Activity className="h-3 w-3 text-white/20" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tighter">{metric.value}</span>
                    <span className="text-xs font-bold text-gray-500">%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${metric.color} transition-all duration-1000 ease-out`} style={{ width: `${metric.value}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ROC Analysis (Integrated from Benchmarks) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-card p-10 space-y-8 flex flex-col justify-between h-[450px]">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight uppercase">ROC Curve Analysis</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Probabilistic classifier performance</p>
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
            </div>
          </div>

          <div className="glass-card p-10 flex flex-col justify-between h-[450px]">
             <h3 className="text-xl font-bold tracking-tight uppercase">System Health</h3>
             <div className="space-y-4">
                {[
                  { icon: Shield, label: "Core Architecture", value: "3-Layer GCN" },
                  { icon: Zap, label: "Neural Latency", value: "< 240ms" },
                  { icon: Database, label: "Vector Dataset", value: "2.5M TX" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black/40 text-green-500">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-[10px] font-bold text-white tracking-widest">{item.value}</span>
                  </div>
                ))}
             </div>
             <div className="pt-6 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-gray-600 uppercase tracking-extra-widest">Protocol Sync</span>
                  <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full gradient-green w-3/4 animate-pulse"></div>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Bento Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Benchmark Matrix (Replaces Heuristic Intelligence) */}
          <div className="glass-card p-10 col-span-1 lg:col-span-2 space-y-8 flex flex-col border-white/5 overflow-hidden">
            <div className="flex items-center space-x-3 text-orange-500">
               <Award className="h-5 w-5" />
               <h3 className="text-lg font-bold tracking-tight uppercase">Comparison with Baseline Methods</h3>
            </div>
            
            <div className="overflow-x-auto">
               <table className="w-full text-[10px] font-bold uppercase tracking-widest">
                 <thead>
                   <tr className="text-gray-500 border-b border-white/5">
                     <th className="pb-4 text-left">Method</th>
                     <th className="pb-4 text-center">Accuracy</th>
                     <th className="pb-4 text-center">Speed</th>
                     <th className="pb-4 text-center">Memory</th>
                     <th className="pb-4 text-right">Rank</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {[
                     { name: "ChainSight GNN", acc: 98.5, speed: "2.4s", mem: "1.2GB", rank: "#1", highlight: true },
                     { name: "Traditional ML", acc: 85.3, speed: "8.1s", mem: "2.5GB", rank: "#2" },
                     { name: "Rule-Based", acc: 72.1, speed: "15.3s", mem: "0.8GB", rank: "#3" },
                     { name: "Random Forest", acc: 88.7, speed: "6.2s", mem: "1.8GB", rank: "#4" },
                   ].map((row, i) => (
                     <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                       <td className="py-4 flex items-center space-x-3">
                         {row.highlight && <Cpu className="h-3 w-3 text-indigo-400" />}
                         <span className={row.highlight ? "text-indigo-400" : "text-gray-400"}>{row.name}</span>
                         {row.highlight && <span className="bg-indigo-500/10 text-indigo-400 text-[7px] px-2 py-0.5 rounded-full border border-indigo-500/20">Our Model</span>}
                       </td>
                       <td className="py-4 text-center">
                         <div className="flex flex-col items-center gap-1">
                           <span className={row.highlight ? "text-white" : "text-gray-500"}>{row.acc}%</span>
                           <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full ${row.highlight ? 'bg-indigo-500' : 'bg-white/20'}`} style={{ width: `${row.acc}%` }} />
                           </div>
                         </div>
                       </td>
                       <td className="py-4 text-center text-gray-500 font-mono">
                         <div className="flex items-center justify-center space-x-1">
                           <Clock className="h-2.5 w-2.5" />
                           <span>{row.speed}</span>
                         </div>
                       </td>
                       <td className="py-4 text-center text-gray-500">
                         <div className="flex items-center justify-center space-x-1">
                           <Database className="h-2.5 w-2.5" />
                           <span>{row.mem}</span>
                         </div>
                       </td>
                       <td className="py-4 text-right">
                         <span className={row.highlight ? "text-orange-500" : "text-gray-600"}>{row.rank}</span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

          {/* Product Distribution style card (Nodes/Agents) */}
          <div className="glass-card p-10 space-y-8 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-tight">Active Nodes</h3>
              <button className="text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest flex items-center space-x-1">
                <span>See more</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            
            <div className="space-y-6">
              {[
                { name: 'Cold_Storage_Alpha', val: '4,842.15 BTC', country: 'SWISS' },
                { name: 'Binance_Hot_01', val: '12,940.82 ETH', country: 'AUS' },
                { name: 'Vault_Institutional', val: '824,514.00 USDC', country: 'USA' },
                { name: 'Unknown_Large_0x', val: '2,987.32 BTC', country: 'ARG' }
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center space-x-4">
                    <div className="px-2 py-1 bg-white/10 rounded-md text-[7px] font-bold uppercase tracking-widest text-gray-400">
                       {node.country}
                    </div>
                    <span className="text-[11px] font-bold text-gray-300 tracking-wider">
                      {node.name.length > 15 ? `${node.name.slice(0, 12)}...` : node.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-widest">{node.val.split(' ')[0]} <span className="text-gray-500">{node.val.split(' ')[1]}</span></span>
                </div>
              ))}
            </div>
          </div>

          {/* Removed Summary Line Card based on user request */}
        </div>
      </div>
    </DashboardLayout>
  );
}
