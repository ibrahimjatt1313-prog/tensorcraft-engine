import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Settings, 
  Terminal, 
  Upload, 
  Play, 
  ShieldCheck, 
  Cpu, 
  Server, 
  Layers, 
  Network, 
  RefreshCw,
  Radio,
  Globe,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  MessageSquare,
  Send,
  Sliders,
  Copy,
  Check,
  Search,
  HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'topology' | 'stream' | 'config'>('workflow');
  const [inputMethod, setInputMethod] = useState<'manual' | 'upload'>('manual');
  const [objective, setObjective] = useState('Analyze system telemetry logs to identify bottleneck patterns in distributed microservice pipelines.');
  const [selectedModel, setSelectedModel] = useState('gemini-3.6-flash');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>('auth-service');
  
  // Hackathon New Features State
  const [region, setRegion] = useState('us-east-1');
  const [isRemediating, setIsRemediating] = useState(false);
  const [remediationLogs, setRemediationLogs] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Added: Copilot Chat State (Without deleting anything)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I am TensorCopilot. Ask me anything about your cluster telemetry or incident root causes.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Added: Log Filter State for Live Stream
  const [logFilter, setLogFilter] = useState('ALL');
  const [logSearchQuery, setLogSearchQuery] = useState('');

  // Added: Interactive Node Scaling State
  const [nodeReplicas, setNodeReplicas] = useState<Record<string, number>>({
    'gateway-proxy': 4,
    'auth-service': 8,
    'payment-core': 3,
    'db-cluster': 2
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  // Real-time stream state
  const [streamLogs, setStreamLogs] = useState<string[]>([
    '[12:18:11] [GATEWAY-PROXY] [ERROR] 504 Gateway Timeout on upstream endpoint',
    '[12:18:13] [AUTH-SERVICE] [WARN] Connection pool threshold at 85%',
    '[12:18:15] [DB-CLUSTER] [ERROR] 504 Gateway Timeout on upstream endpoint',
  ]);
  const [isStreaming, setIsStreaming] = useState(true);

  // Dynamic Live Topology State with region multiplier
  const [topologyNodes, setTopologyNodes] = useState([
    { id: 'gateway-proxy', name: 'Gateway Proxy', type: 'Ingress', status: 'degraded', latencyBase: 80, qpsBase: 12.0, loadBase: 84 },
    { id: 'auth-service', name: 'Auth Service', type: 'Microservice', status: 'critical', latencyBase: 800, qpsBase: 11.5, loadBase: 95 },
    { id: 'payment-core', name: 'Payment Core', type: 'Microservice', status: 'healthy', latencyBase: 45, qpsBase: 10.0, loadBase: 45 },
    { id: 'db-cluster', name: 'PostgreSQL Cluster', type: 'Database', status: 'critical', latencyBase: 850, qpsBase: 12.5, loadBase: 92 },
  ]);

  // Historical chart mock data
  const [chartData, setChartData] = useState([
    { time: '12:10', qps: 10.2, latency: 120 },
    { time: '12:12', qps: 11.0, latency: 240 },
    { time: '12:14', qps: 10.5, latency: 410 },
    { time: '12:16', qps: 12.1, latency: 680 },
    { time: '12:18', qps: 11.8, latency: 800 },
  ]);

  useEffect(() => {
    let interval: any;
    if (isStreaming) {
      interval = setInterval(() => {
        const timestamps = new Date().toISOString().split('T')[1].substring(0, 8);
        const randomServices = ['gateway-proxy', 'auth-service', 'payment-core', 'db-cluster'];
        const randomMsg = '[INFO] Vector telemetry packet synchronized';
        const randomService = randomServices[Math.floor(Math.random() * randomServices.length)];
        
        setStreamLogs(prev => [`[${timestamps}] [${randomService.toUpperCase()}] ${randomMsg}`, ...prev.slice(0, 40)]);

        setTopologyNodes(prevNodes => 
          prevNodes.map(node => {
            const loadOffset = Math.floor(Math.random() * 7) - 3;
            const qpsOffset = (Math.random() * 0.6 - 0.3);
            const latencyOffset = Math.floor(Math.random() * 30) - 15;

            return {
              ...node,
              load: `${Math.min(99, Math.max(25, node.loadBase + loadOffset))}%`,
              qps: `${Math.max(1.0, node.qpsBase + qpsOffset).toFixed(1)}k`,
              latency: `${Math.max(15, node.latencyBase + latencyOffset)}ms`
            };
          })
        );

        // Update chart data feed
        setChartData(prev => [
          ...prev.slice(1),
          { time: timestamps.substring(0, 5), qps: +(10 + Math.random() * 3).toFixed(1), latency: Math.floor(400 + Math.random() * 450) }
        ]);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const handleExecute = () => {
    setIsExecuting(true);
    setExecutionResult(null);
    setTimeout(() => {
      setIsExecuting(false);
      setExecutionResult(`### 🔍 TensorCraft SRE Diagnostic Report [Region: ${region}]

**Timestamp:** ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC  
**Target Engine:** \`${selectedModel}\`  
**Overall Status:** 🔴 **CRITICAL INCIDENT DETECTED**  

---

#### 🚨 Root Cause Analysis
1. **Database Connection Saturation:** \`auth-service\` exhausted its connection pool (50/50 active connections).
2. **Cascading Gateway Timeout:** Upstream \`gateway-proxy\` experienced 504 timeouts on \`/api/v1/auth/verify\`.
3. **Memory Spike:** \`payment-core\` container memory utilization peaked at 92.4%.

#### 🛠️ AI Auto-Remediation Plan
* Rolling restart sequence initiated on \`auth-service\`.
* Database pool max_connections boosted to 150.
* Circuit breaker activated on \`gateway-proxy\`.`);
      showToast('Diagnostic report generated successfully!');
    }, 1500);
  };

  const handleAutoRemediate = () => {
    setIsRemediating(true);
    setRemediationLogs(['[INIT] Connecting to cluster control plane...']);
    
    const steps = [
      '[OK] Authenticated with Kubernetes cluster RBAC token',
      '[EXEC] Draining traffic from unhealthy pods in auth-service...',
      '[EXEC] Scaling connection pool limits via Ansible playbook...',
      '[SUCCESS] All nodes successfully stabilized. Incident resolved.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setRemediationLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setIsRemediating(false);
          showToast('AI Auto-Remediation executed successfully!');
        }
      }, (idx + 1) * 800);
    });
  };

  const exportReport = () => {
    if (!executionResult) return;
    const blob = new Blob([executionResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TensorCraft-Diagnostic-Report-${region}.md`;
    a.click();
    showToast('Executive Briefing Markdown downloaded!');
  };

  // Added: Copy to clipboard function
  const copyToClipboard = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(executionResult);
    setCopied(true);
    showToast('Report copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Added: Handle Copilot Chat Send
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setTimeout(() => {
      let reply = "I analyzed the current cluster state. All metrics in " + region + " indicate stable memory profiles following the latest auto-remediation sequence.";
      if (userMsg.toLowerCase().includes('auth')) {
        reply = "The auth-service pod cluster currently exhibits 95% load saturation with connection pool exhaustion. Scaling replicas to 12 is recommended.";
      } else if (userMsg.toLowerCase().includes('db') || userMsg.toLowerCase().includes('database')) {
        reply = "PostgreSQL Cluster has active slow queries on table `user_sessions`. Connection pooling via PgBouncer is actively mitigating lock contention.";
      }
      setChatMessages(prev => [...prev, { sender: 'ai', text: reply }]);
    }, 800);
  };

  // Filtered logs for live stream tab
  const filteredStreamLogs = streamLogs.filter(log => {
    const matchesFilter = logFilter === 'ALL' || log.includes(`[${logFilter}]`);
    const matchesSearch = log.toLowerCase().includes(logSearchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#0B0F19] text-[#E2E8F0] font-['Inter',sans-serif] overflow-hidden relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-5 right-6 z-50 bg-orange-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" /> {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-[#0F172A]/50 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-['Outfit'] font-bold text-lg tracking-tight text-white">TensorCraft AI</h1>
              <p className="text-xs text-slate-400">Enterprise SRE Engine</p>
            </div>
          </div>

          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-2">Navigation</div>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('workflow')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'workflow' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" /> Workflow Execution
            </button>
            <button
              onClick={() => setActiveTab('topology')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'topology' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" /> Service Topology
            </button>
            <button
              onClick={() => setActiveTab('stream')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'stream' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Radio className="w-4 h-4" /> Live Telemetry Stream
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'config' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" /> Model Configuration
            </button>
          </nav>

          {/* Added: Quick AI Copilot Toggle in Sidebar */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-between transition-all"
            >
              <span className="flex items-center gap-2"><MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> TensorCopilot AI</span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-300">System Status</span>
          </div>
          <p className="text-xs text-slate-400">All engines operational</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header Bar with Multi-Region Switcher */}
        <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between bg-[#0F172A]/30">
          <div className="flex items-center gap-4 text-sm text-slate-400 font-medium">
            <span>TensorCraft <span className="text-slate-600 mx-2">/</span> <span className="text-slate-200 capitalize">{activeTab.replace('-', ' ')}</span></span>
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 text-xs">
              <Globe className="w-3.5 h-3.5 text-orange-400" />
              <select value={region} onChange={(e) => { setRegion(e.target.value); showToast(`Switched region to ${e.target.value}`); }} className="bg-transparent text-slate-200 focus:outline-none cursor-pointer">
                <option value="us-east-1" className="bg-slate-900">us-east-1 (N. Virginia)</option>
                <option value="us-west-2" className="bg-slate-900">us-west-2 (Oregon)</option>
                <option value="eu-central-1" className="bg-slate-900">eu-central-1 (Frankfurt)</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300">v2.4.1</span>
            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-xs text-white shadow-md">TC</div>
          </div>
        </header>

        {/* Added: Global Cluster Health Ticker Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-6 py-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400">Cluster CPU Load</span>
            <span className="text-amber-400 font-bold">78.4%</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400">Memory Headroom</span>
            <span className="text-emerald-400 font-bold">4.2 GB</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400">Active Incidents</span>
            <span className="text-rose-400 font-bold">1 Critical</span>
          </div>
          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-lg border border-slate-800">
            <span className="text-slate-400">Uptime (90d)</span>
            <span className="text-slate-200 font-bold">99.98%</span>
          </div>
        </div>

        {/* Tab 1: Workflow Execution with AI Auto-Remediation */}
        {activeTab === 'workflow' && (
          <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold font-['Outfit'] text-white tracking-tight">TensorCraft Workflow Engine</h2>
                <p className="text-sm text-slate-400 mt-1">Execute intelligent AI inference tasks and trigger AI auto-remediation playbooks.</p>
              </div>
              {executionResult && (
                <div className="flex items-center gap-2">
                  <button onClick={copyToClipboard} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy Report'}
                  </button>
                  <button onClick={exportReport} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                    <Download className="w-3.5 h-3.5" /> Export Executive Briefing
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-orange-500" /> Input Parameter / Telemetry Query
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">ACTIVE</span>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-medium text-slate-400 mb-2">SELECT INPUT METHOD</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setInputMethod('manual')} className={`p-3 rounded-xl border text-left transition-all ${inputMethod === 'manual' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                        <div className="flex items-center gap-2 mb-1"><input type="radio" checked={inputMethod === 'manual'} readOnly className="text-orange-500" /><span className="text-xs font-semibold">Manual Query</span></div>
                      </button>
                      <button onClick={() => setInputMethod('upload')} className={`p-3 rounded-xl border text-left transition-all ${inputMethod === 'upload' ? 'bg-orange-500/10 border-orange-500 text-white' : 'bg-slate-950/40 border-slate-800 text-slate-400'}`}>
                        <div className="flex items-center gap-2 mb-1"><input type="radio" checked={inputMethod === 'upload'} readOnly className="text-orange-500" /><span className="text-xs font-semibold">Upload Log File</span></div>
                      </button>
                    </div>
                  </div>

                  {inputMethod === 'manual' ? (
                    <div className="mb-6">
                      <label className="block text-xs font-medium text-slate-400 mb-2">DIAGNOSTIC OBJECTIVE</label>
                      <textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={4} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500 font-mono" />
                    </div>
                  ) : (
                    <div className="mb-6 border-2 border-dashed border-slate-800 rounded-xl p-6 text-center bg-slate-950/30">
                      <Upload className="w-8 h-8 text-orange-500 mx-auto mb-2 opacity-80" />
                      <p className="text-sm font-medium text-slate-300">Drop file here or click to upload</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <button onClick={handleExecute} disabled={isExecuting} className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50">
                    {isExecuting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Running Inference Pipeline...</> : <><Play className="w-4 h-4 fill-white" /> Run TensorCraft Inference</>}
                  </button>

                  <button onClick={handleAutoRemediate} disabled={isRemediating} className="w-full py-2.5 bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-400 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all">
                    {isRemediating ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Executing AI Auto-Fix...</> : <><Zap className="w-3.5 h-3.5" /> Execute AI Auto-Remediation Sandbox</>}
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-500" /> Execution Output & Sandbox Console
                  </h3>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[320px] overflow-y-auto font-mono text-xs leading-relaxed text-slate-300">
                    {remediationLogs.length > 0 ? (
                      <div className="space-y-1 mb-4 pb-4 border-b border-slate-800">
                        <div className="text-orange-400 font-bold mb-1">=== AI Auto-Remediation Stream ===</div>
                        {remediationLogs.map((log, idx) => <div key={idx} className="text-emerald-400">{log}</div>)}
                      </div>
                    ) : null}

                    {executionResult ? (
                      <div className="whitespace-pre-wrap">{executionResult}</div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                        <ShieldCheck className="w-10 h-10 mb-2 opacity-30" />
                        <p>Provide an input objective and run inference to analyze telemetry.</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Engine: Google Gemini 3.6 Flash</span>
                  <span className="font-mono text-emerald-400">Sandbox Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Service Topology with Historical Performance Charts */}
        {activeTab === 'topology' && (
          <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-['Outfit'] text-white tracking-tight">Obsidian Service Topology ({region})</h2>
                <p className="text-sm text-slate-400 mt-1">Real-time dynamic dependency graph and predictive failure analytics.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Sync Active
                </span>
                <button onClick={() => showToast('Graph nodes successfully re-indexed.')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg border border-slate-700 text-slate-200 transition-colors flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Re-sync Graph
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

                <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
                  {topologyNodes.map((node: any) => (
                    <div key={node.id} onClick={() => setSelectedNode(node.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedNode === node.id ? 'border-orange-500 bg-orange-500/10 shadow-lg' : node.status === 'critical' ? 'border-rose-500/50 bg-rose-500/5' : 'border-slate-800 bg-slate-950/60'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-white flex items-center gap-2"><Server className="w-4 h-4 text-orange-400" /> {node.name}</span>
                        <span className={`w-2.5 h-2.5 rounded-full ${node.status === 'critical' ? 'bg-rose-500 animate-pulse' : node.status === 'degraded' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs font-mono text-slate-400 mt-2 pt-2 border-t border-slate-800">
                        <div><span className="text-[10px] text-slate-500 block">QPS</span> {node.qps}</div>
                        <div><span className="text-[10px] text-slate-500 block">Latency</span> {node.latency}</div>
                        <div><span className="text-[10px] text-slate-500 block">Load</span> {node.load}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recharts Historical Live Trend */}
                <div className="relative z-10 bg-slate-950/80 border border-slate-800 rounded-xl p-4">
                  <div className="text-xs font-semibold text-slate-400 mb-2 flex justify-between">
                    <span>Cluster Throughput & Latency Trend</span>
                    <span className="text-orange-400">Real-time Sliding Window</span>
                  </div>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                        <Line type="monotone" dataKey="qps" stroke="#f97316" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="latency" stroke="#06b6d4" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" /> Node Telemetry Inspector
                  </h3>

                  {selectedNode ? (() => {
                    const node: any = topologyNodes.find((n: any) => n.id === selectedNode);
                    const currentReplicas = nodeReplicas[selectedNode] || 3;
                    return node ? (
                      <div className="space-y-4 text-xs font-mono">
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <div className="text-white font-bold text-sm font-['Outfit']">{node.name}</div>
                          <div className="text-slate-400">Type: <span className="text-slate-200">{node.type}</span></div>
                          <div className="text-slate-400">Status: <span className={node.status === 'critical' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{node.status.toUpperCase()}</span></div>
                          <div className="text-slate-400">Error Rate: <span className="text-amber-400 font-bold">{node.status === 'critical' ? '14.8%' : '0.0%'}</span></div>
                          <div className="text-slate-400">Pod Replicas: <span className="text-orange-400 font-bold">{currentReplicas} Active</span></div>
                        </div>

                        {/* Added: Interactive Pod Scaling Control */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                          <div className="text-slate-300 font-semibold flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-orange-400" /> Scale Replicas</div>
                          <div className="flex items-center gap-2 pt-1">
                            <button 
                              onClick={() => {
                                setNodeReplicas(prev => ({ ...prev, [selectedNode]: Math.max(1, currentReplicas - 1) }));
                                showToast(`Scaled down ${node.name} to ${currentReplicas - 1} replicas`);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-white font-bold"
                            >-</button>
                            <span className="flex-1 text-center font-bold text-orange-400">{currentReplicas} Pods</span>
                            <button 
                              onClick={() => {
                                setNodeReplicas(prev => ({ ...prev, [selectedNode]: currentReplicas + 1 }));
                                showToast(`Scaled up ${node.name} to ${currentReplicas + 1} replicas`);
                              }}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-white font-bold"
                            >+</button>
                          </div>
                        </div>

                        <div className="p-3 bg-orange-500/10 rounded-xl border border-orange-500/20 space-y-1">
                          <div className="text-orange-400 font-bold flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Failure Prediction Risk</div>
                          <div className="text-slate-300 text-[11px]">ML model predicts 88% chance of thread lock in next 15 minutes due to connection pool saturation.</div>
                        </div>
                      </div>
                    ) : null;
                  })() : null}
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button onClick={() => showToast('Diagnostic probe dispatched to cluster.')} className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors">
                    Dispatch Diagnostic Probe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Live Telemetry Stream */}
        {activeTab === 'stream' && (
          <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-['Outfit'] text-white tracking-tight">Live Telemetry Stream</h2>
                <p className="text-sm text-slate-400 mt-1">Real-time log ingestion pipeline across distributed microservices.</p>
              </div>
              <button onClick={() => setIsStreaming(!isStreaming)} className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${isStreaming ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' : 'bg-orange-500 text-white'}`}>
                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-rose-500 animate-ping' : 'bg-white'}`}></span>
                {isStreaming ? 'Pause Stream' : 'Start Live Stream'}
              </button>
            </div>

            {/* Added: Log Search and Filter Controls */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input 
                  type="text" 
                  placeholder="Search log stream..." 
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 w-full md:w-64"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                {['ALL', 'ERROR', 'WARN', 'INFO'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setLogFilter(level)}
                    className={`px-3 py-1.5 rounded-lg border transition-all ${logFilter === level ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 text-xs text-slate-400 font-mono">
                <span>BUFFER: ACTIVE_TAIL ({filteredStreamLogs.length} events displayed)</span>
                <span>STATUS: {isStreaming ? '🟢 STREAMING LIVE' : '⏸️ PAUSED'}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 h-[380px] overflow-y-auto font-mono text-xs space-y-2">
                {filteredStreamLogs.length > 0 ? (
                  filteredStreamLogs.map((log, index) => (
                    <div key={index} className={`py-1 px-2 rounded ${log.includes('ERROR') ? 'bg-rose-500/10 text-rose-400 font-bold' : log.includes('WARN') ? 'bg-amber-500/10 text-amber-300' : 'text-slate-300'}`}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-center text-slate-500 py-12">No logs matching current filter criteria.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Model Configuration */}
        {activeTab === 'config' && (
          <div className="p-8 max-w-4xl w-full mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold font-['Outfit'] text-white tracking-tight">Model & Engine Configuration</h2>
              <p className="text-sm text-slate-400 mt-1">Configure foundational AI models and execution parameters.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">SELECT CORE MODEL</label>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-orange-500">
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Recommended)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">TEMPERATURE / HEURISTIC SENSITIVITY</label>
                <input type="range" min="0" max="100" defaultValue="35" className="w-full accent-orange-500 cursor-pointer" />
              </div>

              <button onClick={() => showToast('Configuration saved successfully!')} className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 hover:from-orange-500 transition-all">
                Save Configuration
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Added: Floating TensorCopilot AI Chat Drawer */}
      {chatOpen && (
        <div className="absolute bottom-6 right-6 z-50 w-96 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 px-4 py-3 border-b border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-xs text-white">TensorCopilot AI Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white font-bold text-sm">×</button>
          </div>

          <div className="p-4 h-72 overflow-y-auto space-y-3 font-mono text-xs">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`p-2.5 rounded-xl ${msg.sender === 'user' ? 'bg-indigo-600/20 text-indigo-200 ml-6 border border-indigo-500/30' : 'bg-slate-950 text-slate-300 mr-6 border border-slate-800'}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Ask Copilot about logs or errors..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button onClick={handleSendChat} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}