import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Bell, Shield, Database, Mail, Loader2, Copy, Check, Plus, Trash2, User, Lock, Terminal, ArrowUpRight } from "lucide-react";
import { settingsApi } from "@/lib/api";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created_at: string;
}

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  const [userSettings, setUserSettings] = useState({
    name: '',
    email: '',
    company: '',
    role: 'analyst',
    emailReports: true,
    autoGenerateReports: true,
  });
  
  const [notifications, setNotifications] = useState({
    highRiskAlerts: true,
    analysisComplete: true,
    newSuspiciousActivity: true,
    weeklySummary: false,
    systemUpdates: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserSettings(prev => ({ ...prev, name: user.name || '', email: user.email || '' }));
      } catch (e) {}
    }
    const fetchApiKeys = async () => {
      try {
        const keys = await settingsApi.getApiKeys();
        setApiKeys(keys || []);
      } catch (err) {}
    };
    fetchApiKeys();
  }, []);

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      await settingsApi.updateSettings(userSettings);
      localStorage.setItem('user', JSON.stringify({ name: userSettings.name, email: userSettings.email }));
    } catch (err) {} finally { setIsSaving(false); }
  };

  const handleCopyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const result = await settingsApi.createApiKey(newKeyName);
      setApiKeys([...apiKeys, { id: result.id, name: newKeyName, key: result.key, created_at: new Date().toISOString() }]);
      setNewKeyName('');
    } catch (err) {} finally { setIsCreatingKey(false); }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await settingsApi.deleteApiKey(keyId);
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
    } catch (err) {}
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-12 animate-on-scroll show">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold tracking-tight">System Configuration</h2>
            <p className="text-gray-500 text-[11px] font-medium uppercase tracking-[0.2em]">Node parameters and operational preferences.</p>
          </div>
          <div className="flex bg-white/5 p-1 rounded-full border border-white/5">
            {[
              { id: 'account', icon: User },
              { id: 'notifications', icon: Bell },
              { id: 'security', icon: Shield },
              { id: 'api', icon: Terminal }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 rounded-full transition-all ${
                  activeTab === tab.id ? 'bg-white text-black shadow-xl scale-110' : 'text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           {/* Sidebar Info (Bento Style) */}
           <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-8 flex flex-col items-center text-center space-y-4">
                 <div className="w-20 h-20 rounded-full gradient-green glow-green flex items-center justify-center text-black">
                    <User className="h-10 w-10" />
                 </div>
                 <div className="space-y-1">
                    <p className="text-lg font-bold tracking-tight">{userSettings.name || 'System User'}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{userSettings.role} // Authorized</p>
                 </div>
              </div>

              <div className="glass-card p-8 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Network Node</span>
                    <div className="w-2 h-2 rounded-full gradient-green glow-green"></div>
                 </div>
                 <p className="text-xs font-mono text-white/40 break-all">NODE_US_EAST_01_PROD</p>
              </div>
           </div>

           {/* Main Content (Bento Large) */}
           <div className="lg:col-span-3">
              <div className="glass-card p-10 min-h-[500px]">
                {activeTab === 'account' && (
                  <div className="space-y-10 animate-on-scroll show">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold tracking-tight">Profile Integrity</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Core identity parameters for encrypted sessions.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Full Name</label>
                        <input 
                          type="text"
                          value={userSettings.name}
                          onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
                        <input 
                          type="email"
                          value={userSettings.email}
                          onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Organization</label>
                        <input 
                          type="text"
                          value={userSettings.company}
                          onChange={(e) => setUserSettings({ ...userSettings, company: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Access Level</label>
                        <select 
                          value={userSettings.role}
                          onChange={(e) => setUserSettings({ ...userSettings, role: e.target.value })}
                          className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white tracking-widest uppercase focus:outline-none focus:bg-white/10 transition-all cursor-pointer"
                        >
                          <option value="analyst" className="bg-black">Level 1 Analyst</option>
                          <option value="manager" className="bg-black">Level 2 Manager</option>
                          <option value="admin" className="bg-black">Level 3 Superuser</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-8 border-t border-white/5">
                      <button 
                        onClick={handleSaveAccount}
                        disabled={isSaving}
                        className={`px-12 py-4 rounded-full font-bold text-[11px] tracking-[0.2em] uppercase transition-all shadow-2xl ${
                          isSaving ? 'bg-white/5 text-gray-500' : 'bg-white text-black hover:scale-105'
                        }`}
                      >
                        {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-10 animate-on-scroll show">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold tracking-tight">Signal Protocols</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Manage event propagation and alert thresholds.</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'highRiskAlerts', label: 'High Risk Vectors', desc: 'Instant signal on critical pattern match' },
                        { id: 'analysisComplete', label: 'Analysis Synch', desc: 'Callback on computation finalize' },
                        { id: 'newSuspiciousActivity', label: 'Anomaly Detection', desc: 'Heuristic trigger notification' },
                        { id: 'weeklySummary', label: 'Chrono Digest', desc: 'Aggregated 7D activity snapshot' }
                      ].map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-white uppercase tracking-widest">{item.label}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest font-medium">{item.desc}</p>
                          </div>
                          <button 
                            onClick={() => setNotifications({ ...notifications, [item.id]: !notifications[item.id as keyof typeof notifications] })}
                            className={`w-14 h-7 rounded-full border transition-all relative ${
                              notifications[item.id as keyof typeof notifications] ? 'border-none gradient-green glow-green' : 'border-white/10 bg-white/5'
                            }`}
                          >
                            <div className={`absolute top-1 bottom-1 w-5 aspect-square rounded-full transition-all duration-300 ${
                              notifications[item.id as keyof typeof notifications] ? 'right-1 bg-black' : 'left-1 bg-white/20'
                            }`}></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'api' && (
                  <div className="space-y-10 animate-on-scroll show">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold tracking-tight">Interface Station</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">X-platform integration and station token management.</p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Global Endpoint</label>
                      <div className="flex gap-4">
                        <input 
                          readOnly 
                          value={`${window.location.origin}/v1`}
                          className="flex-1 bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] font-mono text-white/40 tracking-widest uppercase" 
                        />
                        <button 
                          onClick={() => handleCopyKey(`${window.location.origin}/v1`)}
                          className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white hover:text-black transition-all shadow-xl"
                        >
                          {copiedKey === `${window.location.origin}/v1` ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-6 pt-10 border-t border-white/5">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-bold text-white tracking-widest uppercase">Station Tokens</h4>
                          <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                             <input 
                               placeholder="Token Name..."
                               value={newKeyName}
                               onChange={(e) => setNewKeyName(e.target.value)}
                               className="bg-transparent px-6 py-2 text-[10px] text-white tracking-widest uppercase focus:outline-none w-40" 
                             />
                             <button 
                               onClick={handleCreateApiKey}
                               disabled={isCreatingKey || !newKeyName.trim()}
                               className="p-2 bg-white text-black rounded-full hover:scale-110 transition-transform"
                             >
                               {isCreatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                             </button>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                         {apiKeys.length === 0 ? (
                           <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl">
                              <span className="text-[9px] text-gray-700 tracking-widest uppercase font-bold">No active tokens detected</span>
                           </div>
                         ) : (
                           apiKeys.map((apiKey) => (
                             <div key={apiKey.id} className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl group hover:bg-white/[0.08] transition-all">
                                <div className="space-y-1">
                                   <p className="text-[11px] font-bold text-white uppercase tracking-widest">{apiKey.name}</p>
                                   <p className="text-[9px] font-mono text-gray-500">{apiKey.key.slice(0, 24)}...</p>
                                </div>
                                <div className="flex space-x-3">
                                   <button onClick={() => handleCopyKey(apiKey.key)} className="p-3 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all">
                                      {copiedKey === apiKey.key ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                   </button>
                                   <button onClick={() => handleDeleteApiKey(apiKey.id)} className="p-3 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all">
                                      <Trash2 className="h-4 w-4" />
                                   </button>
                                </div>
                             </div>
                           ))
                         )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-10 animate-on-scroll show">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-bold tracking-tight">Access Hardening</h3>
                       <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Encrypted secrets and multi-layer verification protocols.</p>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">Current Secret</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white focus:outline-none focus:bg-white/10 transition-all" />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest px-1">New Secret</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/5 p-4 rounded-2xl text-[11px] text-white focus:outline-none focus:bg-white/10 transition-all" />
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-orange-500/5 rounded-3xl border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-full gradient-orange glow-orange flex items-center justify-center text-black">
                             <Shield className="h-6 w-6" />
                          </div>
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-orange-500 uppercase tracking-widest">Two-Factor Authentication</p>
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Layered identity verification protocol disabled.</p>
                          </div>
                       </div>
                       <button className="px-8 py-3 bg-white text-black rounded-full font-bold text-[10px] tracking-widest uppercase hover:scale-105 transition-transform shadow-xl">Enable MFA</button>
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
