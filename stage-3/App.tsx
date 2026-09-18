import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Server, Cpu, ShieldCheck, Terminal, 
  Video, Mic, MicOff, VideoOff, RefreshCw, 
  Layers, X, Bell, Download, Volume2, VolumeX, ShieldAlert, Zap,
  Home, Radio, Box, GitBranch, FileText, Settings, Database, HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SRECommandCenter() {
  const [cameraActive, setCameraActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [detectedGesture, setDetectedGesture] = useState('Idle (Awaiting Stream)');
  const [voiceTranscript, setVoiceTranscript] = useState('Listening disabled...');
  const [lastCommand, setLastCommand] = useState('System Initialized successfully.');
  
  const [activeNav, setActiveNav] = useState('Overview');
  const [modalView, setModalView] = useState<string | null>(null);
  
  const [telemetryData, setTelemetryData] = useState<any[]>([
    { time: '01:30 AM', cpu: 42, memory: 58, latency: 15 },
    { time: '03:00 AM', cpu: 45, memory: 62, latency: 18 },
    { time: '04:30 AM', cpu: 44, memory: 60, latency: 14 },
    { time: '06:00 AM', cpu: 48, memory: 64, latency: 16 },
    { time: '07:30 AM', cpu: 54, memory: 66, latency: 19 }
  ]);
  const [nodeStatus, setNodeStatus] = useState('Stable (4 Nodes)');
  const [isSelfHealing, setIsSelfHealing] = useState(false);
  const [activeRegion, setActiveRegion] = useState('us-east-1');
  
  const [incidents, setIncidents] = useState([
    { id: 'INC-8091', service: 'Auth-Microservice', severity: 'High', status: 'Mitigating', details: 'Token parser memory spike detected.' },
    { id: 'INC-8092', service: 'Payment-Gateway', severity: 'Medium', status: 'Monitoring', details: 'Stripe webhook latency elevated.' }
  ]);
  
  const [showNodeDrawer, setShowNodeDrawer] = useState(false);
  const [activeIncidentModal, setActiveIncidentModal] = useState<any>(null);
  const [pods, setPods] = useState<any[]>([
    { name: 'auth-pod-1', status: 'Running', ip: '10.244.0.12', uptime: '4d 12h', cpu: '14%', memory: '240MB' },
    { name: 'auth-pod-2', status: 'Running', ip: '10.244.0.15', uptime: '4d 12h', cpu: '78%', memory: '512MB' },
    { name: 'payment-pod-1', status: 'Running', ip: '10.244.1.8', uptime: '2d 08h', cpu: '22%', memory: '310MB' },
    { name: 'gateway-ingress-1', status: 'Running', ip: '10.244.2.3', uptime: '12d 01h', cpu: '12%', memory: '180MB' }
  ]);
  
  const [cliInput, setCliInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logs, setLogs] = useState([
    { time: '07:32:01', type: 'INFO', msg: 'Cluster heartbeat stable across 4 active pods.' },
    { time: '07:32:04', type: 'WARN', msg: 'High memory usage detected on auth-pod-2 (78%).' },
    { time: '07:32:08', type: 'AI_DIAG', msg: 'Root cause identified: Memory leak in token parser. Auto-patch primed.' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const podsRes = await fetch('http://localhost:5000/api/pods');
        if (podsRes.ok) {
          const podsData = await podsRes.json();
          setPods(podsData);
        }

        const metricsRes = await fetch('http://localhost:5000/api/metrics');
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          let rawCpu = metricsData.cpu ?? Math.floor(40 + Math.random() * 15);
          let rawMem = metricsData.memory ?? Math.floor(55 + Math.random() * 20);

          setTelemetryData(prev => {
            const updated = [...prev, {
              time: timeStr,
              cpu: Number(rawCpu),
              memory: Number(rawMem),
              latency: Number(metricsData.latency || Math.floor(12 + Math.random() * 15)),
            }];
            return updated.slice(-15);
          });
        }
      } catch (err) {
        console.error("Failed to fetch from Flask backend:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleCamera = async () => {
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
        setDetectedGesture('Scanning for gestures...');
      } catch (err) {
        setDetectedGesture('Camera Permission Denied');
      }
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraActive(false);
      setDetectedGesture('Camera Offline');
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceActive(true);
      setVoiceTranscript('"auto fix" (Simulated)');
      triggerSelfHealing();
      setTimeout(() => setVoiceActive(false), 2000);
      return;
    }

    if (!voiceActive) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setVoiceActive(true);
          setVoiceTranscript('Listening for commands...');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript.toLowerCase();
          setVoiceTranscript(`"${transcript}"`);
          if (transcript.includes('heal') || transcript.includes('fix') || transcript.includes('resolve')) {
            triggerSelfHealing();
          } else {
            setLastCommand(`Voice Command: ${transcript}`);
          }
        };

        recognition.onerror = () => {
          setVoiceTranscript('"auto fix" (Fallback)');
          triggerSelfHealing();
        };

        recognition.onend = () => setVoiceActive(false);
        recognition.start();
      } catch (e) {
        setVoiceActive(true);
        setVoiceTranscript('"auto fix" (Simulated)');
        triggerSelfHealing();
        setTimeout(() => setVoiceActive(false), 2000);
      }
    } else {
      setVoiceActive(false);
      setVoiceTranscript('Paused.');
    }
  };

  const triggerSelfHealing = async () => {
    setIsSelfHealing(true);
    setLastCommand('Initiating AI Self-Healing Protocol...');
    setNodeStatus('Rebalancing Cluster...');
    playAlertSound();
    triggerToast('Slack Alert: Self-healing protocol initiated.');

    try {
      await fetch('http://localhost:5000/api/heal', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setIsSelfHealing(false);
      setNodeStatus('Optimized & Stable (4 Nodes)');
      setLastCommand('Auto-Remediation Sandbox Patch Applied Successfully.');
      setIncidents([]);
      setActiveIncidentModal(null);
      setPods(prev => prev.map(p => ({ ...p, status: 'Running', cpu: '22%' })));
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString(), type: 'SUCCESS', msg: 'AI Sandbox patch successfully deployed.' }
      ]);
      triggerToast('Slack Alert: All incidents resolved.');
    }, 2500);
  };

  const switchRegion = (reg: string) => {
    setActiveRegion(reg);
    setLastCommand(`Failover rerouted traffic to region ${reg}.`);
    triggerToast(`Network Failover: Active cluster routed to ${reg}.`);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'INFO', msg: `Traffic shifted to ${reg}.` }]);
  };

  const exportAuditReport = () => {
    const report = {
      region: activeRegion,
      timestamp: new Date().toISOString(),
      nodeStatus,
      pods,
      telemetrySnapshot: telemetryData[telemetryData.length - 1],
      logs
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sre-audit-report-${activeRegion}.json`;
    a.click();
    setLastCommand('Exported Audit Report JSON successfully.');
    triggerToast('System: Audit report downloaded.');
  };

  const exportCsvReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,Time,CPU(%),Memory(%),Latency(ms)\n";
    telemetryData.forEach(row => {
      csvContent += `${row.time},${row.cpu},${row.memory},${row.latency}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cluster-telemetry-${activeRegion}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Export: Telemetry CSV report generated.');
  };

  const restartPod = async (podName: string) => {
    setLastCommand(`Restarting container pod: ${podName}...`);
    try {
      await fetch(`http://localhost:5000/api/pods/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: podName })
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      setPods(prev => prev.map(p => p.name === podName ? { ...p, status: 'Running', cpu: '18%' } : p));
      setLastCommand(`Pod ${podName} successfully restarted.`);
      triggerToast(`Kubernetes: Pod ${podName} restarted.`);
    }, 1500);
  };

  const handleNavClick = (name: string) => {
    setActiveNav(name);
    if (name === 'Overview') {
      setModalView(null);
      setShowNodeDrawer(false);
    } else if (name === 'Live Feed') {
      setModalView('feed');
    } else if (name === 'Pods') {
      setShowNodeDrawer(true);
    } else if (name === 'Clusters') {
      setModalView('clusters');
    } else if (name === 'Metrics') {
      setModalView('metrics');
    } else if (name === 'Logs') {
      setModalView('logs');
    } else if (name === 'Settings') {
      setModalView('settings');
    }
  };

  const navItems = [
    { name: 'Overview', icon: Home },
    { name: 'Live Feed', icon: Radio },
    { name: 'Pods', icon: Box },
    { name: 'Clusters', icon: GitBranch },
    { name: 'Metrics', icon: Activity },
    { name: 'Logs', icon: FileText },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans antialiased relative flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top duration-300 font-mono text-xs">
          <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="h-16 bg-[#0b101d] border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <span className="font-black text-slate-950 text-base tracking-tighter">T</span>
            </div>
            <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              TENSORCRAFT AI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wide text-cyan-200">WAR ROOM v4.2</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs text-emerald-300 font-medium">Nominal</span>
          </div>

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-mono">
            {['us-east-1', 'eu-central-1', 'ap-south-1'].map((reg) => (
              <button
                key={reg}
                type="button"
                onClick={() => switchRegion(reg)}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${activeRegion === reg ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Export Buttons Restored */}
          <button 
            onClick={exportCsvReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-emerald-400 font-mono transition-all cursor-pointer"
            title="Export CSV Metrics"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button 
            onClick={exportAuditReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs text-cyan-400 font-mono transition-all cursor-pointer"
            title="Export Audit JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <aside className="w-64 bg-[#090e1b] border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-6">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.name)}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${isActive ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:bg-slate-900/80 hover:text-white'}`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">SRE Online</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Auto-healing ({activeRegion})</p>
          </div>
        </aside>

        {/* Center Dashboard Viewport */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Hero Card */}
          <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-wide">AUTONOMOUS SRE COMMAND CENTER</h1>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Real-time Kubernetes operations • Self-healing • AI observability ({activeRegion})
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setModalView('summary')}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 font-mono text-xs rounded-xl transition-all flex items-center space-x-2 cursor-pointer shadow-md"
                >
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Health Summary</span>
                </button>

                <div className="bg-purple-950/60 border border-purple-800/80 px-4 py-2 rounded-xl flex items-center space-x-2.5 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-purple-300">Neural Ops Active</span>
                </div>
              </div>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div 
                onClick={() => setShowNodeDrawer(true)}
                className="bg-[#0f1525] border border-slate-800/80 rounded-xl p-4 transition-all hover:border-cyan-500/40 cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Service Topology</span>
                  <Server className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-cyan-300">{nodeStatus}</span>
                  <span className="text-emerald-400 font-bold">&#10003;</span>
                </div>
                <span className="text-[11px] text-cyan-400/90 font-mono mt-2 inline-flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>View topology &rarr;</span>
                </span>
              </div>

              <div className="bg-[#0f1525] border border-slate-800/80 rounded-xl p-4 transition-all hover:border-emerald-500/40 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Live CPU Load</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-emerald-300">
                    {telemetryData[telemetryData.length - 1]?.cpu ?? 54}%
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 border border-emerald-800 text-emerald-400">
                    Optimal
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${telemetryData[telemetryData.length - 1]?.cpu ?? 54}%` }} />
                </div>
              </div>

              <div className="bg-[#0f1525] border border-slate-800/80 rounded-xl p-4 transition-all hover:border-amber-500/40 shadow-lg">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">AI Remediation</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-amber-300">
                    {isSelfHealing ? 'Healing Active...' : 'Sandbox Ready'}
                  </span>
                  <span className="text-emerald-400 font-bold">&#10003;</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono mt-2 block">
                  Policy engine online
                </span>
              </div>
            </div>
          </div>

          {/* Active Incidents */}
          {incidents.length > 0 && (
            <div className="bg-red-950/30 border border-red-900/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveIncidentModal(incidents[0])}>
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <div>
                  <span className="text-xs font-mono text-red-400 font-bold block">ACTIVE INCIDENTS DETECTED ({incidents.length}) — Click to inspect</span>
                  <span className="text-xs text-slate-300">{incidents[0].service}: {incidents[0].details}</span>
                </div>
              </div>
              <button 
                onClick={triggerSelfHealing}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl transition-all shadow-lg shadow-red-600/20 cursor-pointer"
              >
                Resolve via AI
              </button>
            </div>
          )}

          {/* AI Diagnostic Stream */}
          <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">Live AI Diagnostic Stream</span>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setLogs([])}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg text-[10px] font-mono transition-all cursor-pointer"
                >
                  Clear Logs
                </button>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono text-slate-400">Auto-scrolling</span>
                </div>
              </div>
            </div>

            <div className="bg-[#070b14] border border-slate-900 rounded-xl p-3.5 space-y-2 font-mono text-xs max-h-40 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-4 italic">No logs available.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <span className="text-slate-500">{log.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.type === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' : log.type === 'AI_DIAG' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-300'}`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300">{log.msg}</span>
                  </div>
                ))
              )}
            </div>

            <div className="bg-[#070b14] border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center space-x-3">
              <span className="text-cyan-400 font-mono text-xs font-bold">&gt;</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && cliInput.trim()) {
                    setLastCommand(`CLI Executed: ${cliInput}`);
                    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'INFO', msg: `CLI: ${cliInput}` }]);
                    if (cliInput.toLowerCase().includes('heal') || cliInput.toLowerCase().includes('fix')) {
                      triggerSelfHealing();
                    }
                    setCliInput('');
                  }
                }}
                placeholder="Type command (e.g., 'heal cluster') and press Enter..."
                className="w-full bg-transparent text-slate-100 font-mono text-xs focus:outline-none placeholder-slate-600"
              />
            </div>
          </div>

          {/* Last Executed Command Banner */}
          <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Last Executed Command</span>
              <p className="text-sm font-mono font-bold text-cyan-300">{lastCommand}</p>
            </div>
            
            <button 
              onClick={triggerSelfHealing}
              disabled={isSelfHealing}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSelfHealing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-slate-950" />}
              <span>{isSelfHealing ? 'Healing...' : 'Trigger Auto-Fix'}</span>
            </button>
          </div>

          {/* Performance Chart */}
          <div className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Cluster Performance Metrics (CPU % vs Memory %)
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300">CPU %</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-slate-300">Memory %</span>
                </div>
              </div>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#141c2e" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#090e1b', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px', fontFamily: 'monospace' }} />
                  <Line type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2.5} dot={false} name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2.5} dot={false} name="Memory %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Cleaned Up & Beautiful UI */}
        <aside className="w-80 bg-[#0b101d] border-l border-slate-800/80 p-5 flex flex-col justify-between hidden xl:flex shrink-0">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Video className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold font-mono tracking-wide text-slate-200">Neural Vision & Voice</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </span>
            </div>

            {/* Video Box */}
            <div className="relative w-full h-48 bg-[#070b14] rounded-2xl border border-cyan-500/30 overflow-hidden flex items-center justify-center shadow-inner">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
              />
              {!cameraActive && (
                <div className="text-center p-4 text-slate-500 font-mono text-xs space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <VideoOff className="w-5 h-5 opacity-60" />
                  </div>
                  <p className="font-bold text-slate-300">Camera Offline</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleCamera}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-mono flex items-center justify-center space-x-2 border transition-all cursor-pointer ${cameraActive ? 'bg-emerald-950 border-emerald-700 text-emerald-400' : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-400 shadow-md'}`}
              >
                {cameraActive ? <Video className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                <span>{cameraActive ? 'Stop Cam' : 'Start Cam'}</span>
              </button>

              <button 
                onClick={toggleVoice}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold font-mono flex items-center justify-center space-x-2 border transition-all cursor-pointer ${voiceActive ? 'bg-cyan-950 border-cyan-700 text-cyan-400' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'}`}
              >
                {voiceActive ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
                <span>{voiceActive ? 'Listening' : 'Voice Cmd'}</span>
              </button>
            </div>
          </div>

          {/* Telemetry Status Box */}
          <div className="bg-[#070b14] border border-slate-800/80 rounded-xl p-3.5 font-mono text-[11px] space-y-2.5 shadow-inner">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Gesture:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[130px]">{detectedGesture}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Voice:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[130px]">{voiceTranscript}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-900">
              <span className="text-slate-500">FPS:</span>
              <span className="text-slate-200 font-bold">{cameraActive ? '60 FPS' : '0 FPS'}</span>
            </div>
          </div>
        </aside>

      </div>

      {/* Node Inspector Drawer */}
      {showNodeDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-[#0b101d] border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between font-mono text-xs animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Kubernetes Pod Topology</span>
                </h3>
                <button onClick={() => setShowNodeDrawer(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-400 mb-4 text-[11px]">
                Active cluster node instances deployed across region <span className="text-cyan-300">{activeRegion}</span>.
              </p>
              
              <div className="space-y-3">
                {pods.map((pod, i) => (
                  <div key={i} className="bg-[#070b14] border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-bold">{pod.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] ${pod.status === 'Running' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                        {pod.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex justify-between">
                      <span>IP: {pod.ip}</span>
                      <span>Uptime: {pod.uptime}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                      <span className="text-slate-400">CPU: {pod.cpu} | Mem: {pod.memory}</span>
                      <button 
                        onClick={() => restartPod(pod.name)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-semibold transition-all cursor-pointer"
                      >
                        Restart Pod
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button 
                onClick={() => setShowNodeDrawer(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {modalView && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#0b101d] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 font-mono text-xs animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
                <span>{modalView === 'summary' ? 'System Health Summary' : `${modalView} Control Panel`}</span>
              </h3>
              <button onClick={() => setModalView(null)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {modalView === 'summary' ? (
                <div className="space-y-3">
                  <p className="text-slate-300">Comprehensive Cluster & Node Health Report:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px]">Total Active Pods</span>
                      <span className="text-cyan-400 text-base font-bold block">{pods.length} Running</span>
                    </div>
                    <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 text-[10px]">Pending Incidents</span>
                      <span className="text-amber-400 text-base font-bold block">{incidents.length} Active</span>
                    </div>
                  </div>
                  <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                    <span>System Uptime Reliability</span>
                    <span className="text-emerald-400 font-bold">99.98%</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-slate-300">Viewing telemetry feed and operational controls for {activeRegion}.</p>
                  <div className="bg-[#070b14] p-3 rounded-xl border border-slate-800 space-y-1">
                    {logs.map((l, idx) => (
                      <div key={idx} className="text-[11px] text-slate-300">[{l.time}] {l.msg}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setModalView(null)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}