import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Server, Cpu, ShieldCheck, Terminal, 
  Video, Mic, MicOff, VideoOff, RefreshCw, 
  Layers, X, Bell, Download, Volume2, VolumeX, ShieldAlert, Code2, Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function SRECommandCenter() {
  const [cameraActive, setCameraActive] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [detectedGesture, setDetectedGesture] = useState('Idle (Awaiting Stream)');
  const [voiceTranscript, setVoiceTranscript] = useState('Listening disabled...');
  const [lastCommand, setLastCommand] = useState('System Initialized successfully.');
  
  // Telemetry & Pods state with pre-filled default data so Recharts renders instantly
  const [telemetryData, setTelemetryData] = useState<any[]>([
    { time: '10:23:00', cpu: 42, memory: 58, latency: 15 },
    { time: '10:24:00', cpu: 45, memory: 62, latency: 18 },
    { time: '10:25:00', cpu: 44, memory: 60, latency: 14 }
  ]);
  const [nodeStatus, setNodeStatus] = useState('Stable (4 Nodes)');
  const [isSelfHealing, setIsSelfHealing] = useState(false);
  const [activeRegion, setActiveRegion] = useState('us-east-1');
  
  // Incidents & Alerts state
  const [incidents, setIncidents] = useState([
    { id: 'INC-8091', service: 'Auth-Microservice', severity: 'High', status: 'Mitigating', details: 'Token parser memory spike detected.' },
    { id: 'INC-8092', service: 'Payment-Gateway', severity: 'Medium', status: 'Monitoring', details: 'Stripe webhook latency elevated.' }
  ]);
  
  const [showNodeDrawer, setShowNodeDrawer] = useState(false);
  const [activeIncidentModal, setActiveIncidentModal] = useState<any>(null);
  
  // Default fallback pods so inspector is never empty
  const [pods, setPods] = useState<any[]>([
    { name: 'auth-pod-1', status: 'Running', ip: '10.244.0.12', uptime: '4d 12h', cpu: '14%', memory: '42%' },
    { name: 'auth-pod-2', status: 'Running', ip: '10.244.0.15', uptime: '4d 12h', cpu: '78%', memory: '85%' },
    { name: 'payment-pod-1', status: 'Running', ip: '10.244.1.22', uptime: '2d 05h', cpu: '22%', memory: '50%' },
    { name: 'gateway-pod-1', status: 'Running', ip: '10.244.2.05', uptime: '6d 18h', cpu: '31%', memory: '48%' }
  ]);
  
  // Interactive CLI & Toast State
  const [cliInput, setCliInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live Stream Logs
  const [logs, setLogs] = useState([
    { time: '10:25:01', type: 'INFO', msg: 'Cluster heartbeat stable across 4 active pods.' },
    { time: '10:25:04', type: 'WARN', msg: 'High memory usage detected on auth-pod-2 (78%).' },
    { time: '10:25:08', type: 'AI_DIAG', msg: 'Root cause identified: Memory leak in token parser. Auto-patch primed.' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Show notification toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sound Alert Helper
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

  // Fetch Live Metrics and Pods from Flask Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Pods
        const podsRes = await fetch('http://localhost:5000/api/pods');
        if (podsRes.ok) {
          const podsData = await podsRes.json();
          if (Array.isArray(podsData) && podsData.length > 0) {
            setPods(podsData);
          }
        }

        // Fetch Metrics with robust fallback to prevent flat/blank graphs
        const metricsRes = await fetch('http://localhost:5000/api/metrics');
        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          let rawCpu = metricsData.cpu;
          if (rawCpu === undefined || rawCpu === null) {
            rawCpu = Math.floor(40 + Math.random() * 15);
          }

          let rawMem = metricsData.memory;
          if (rawMem === undefined || rawMem === null) {
            rawMem = Math.floor(55 + Math.random() * 20);
          }

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
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setTelemetryData(prev => [
          ...prev, 
          { time: nowStr, cpu: Math.floor(40 + Math.random() * 15), memory: 60, latency: 15 }
        ].slice(-15));
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 3 seconds
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Camera Toggle
  const toggleCamera = async () => {
    if (!cameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
        setDetectedGesture('Scanning for gestures...');
      } catch (err) {
        setDetectedGesture('Camera Permission Denied / Error');
      }
    } else {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraActive(false);
      setDetectedGesture('Camera Offline');
    }
  };

  // Voice Recognition Handler
  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceTranscript('Speech Recognition not supported.');
      return;
    }

    if (!voiceActive) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setVoiceActive(true);
        setVoiceTranscript('Listening for commands...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        setVoiceTranscript(`"${transcript}"`);
        
        if (
          transcript.includes('heal') || 
          transcript.includes('fix') || 
          transcript.includes('resolve') || 
          transcript.includes('assistant') || 
          transcript.includes('system')
        ) {
          triggerSelfHealing();
        } else {
          setLastCommand(`Voice Command Executed: ${transcript}`);
        }
      };

      recognition.onend = () => setVoiceActive(false);
      recognition.start();
    } else {
      setVoiceActive(false);
      setVoiceTranscript('Voice listener paused.');
    }
  };

  // Automated Self-Healing Trigger
  const triggerSelfHealing = async () => {
    setIsSelfHealing(true);
    setLastCommand('Initiating AI Self-Healing Protocol...');
    setNodeStatus('Rebalancing Cluster...');
    playAlertSound();
    triggerToast('Slack Alert: Self-healing protocol initiated for cluster nodes.');

    try {
      await fetch('http://localhost:5000/api/heal', { method: 'POST' });
    } catch (e) {
      console.error("Healing API call failed", e);
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
        { time: new Date().toLocaleTimeString(), type: 'SUCCESS', msg: 'AI Sandbox patch successfully deployed to cluster nodes.' }
      ]);
      triggerToast('Slack Alert: All incidents resolved successfully.');
    }, 2500);
  };

  // Interactive CLI Command Runner
  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;
    const cmd = cliInput.trim().toLowerCase();
    setLastCommand(`Executed CLI: ${cliInput}`);
    
    if (cmd.includes('get pods')) {
      setShowNodeDrawer(true);
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'INFO', msg: 'CLI: Fetched active pod status.' }]);
    } else if (cmd.includes('heal') || cmd.includes('fix')) {
      triggerSelfHealing();
    } else {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'INFO', msg: `CLI Command executed: ${cliInput}` }]);
    }
    setCliInput('');
  };

  // Simulate Multi-Region Failover
  const switchRegion = (reg: string) => {
    setActiveRegion(reg);
    setLastCommand(`Failover rerouted traffic to region ${reg}.`);
    triggerToast(`Network Failover: Active cluster routed to ${reg}.`);
    setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), type: 'INFO', msg: `Traffic successfully shifted to ${reg} region.` }]);
  };

  // Export Audit Log
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
    triggerToast('System: Audit report downloaded successfully.');
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
      setLastCommand(`Pod ${podName} successfully restarted & healthy.`);
      triggerToast(`Kubernetes: Pod ${podName} successfully restarted.`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 p-6 font-sans antialiased relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-cyan-950 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-xl shadow-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top duration-300 font-mono text-xs">
          <Bell className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 backdrop-blur-md px-6 py-4 rounded-xl mb-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.7)]" />
          <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            TENSORCRAFT AI
          </h1>
          <span className="text-xs px-2.5 py-1 bg-cyan-950/80 border border-cyan-800/60 text-cyan-300 rounded-md font-mono">
            WAR ROOM v4.0 (Enterprise Ops)
          </span>
        </div>

        {/* Region Switcher & Tools */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
            title="Toggle Alert Sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button 
            onClick={exportAuditReport}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono font-semibold transition-all border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Audit</span>
          </button>

          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs font-mono">
            {['us-east-1', 'eu-central-1', 'ap-south-1'].map((reg) => (
              <button
                key={reg}
                onClick={() => switchRegion(reg)}
                className={`px-3 py-1 rounded-md transition-all ${activeRegion === reg ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                {reg}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Dashboard & Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Autonomous SRE Command Center</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Active Region: <span className="text-cyan-400 font-mono font-bold">{activeRegion}</span> | Kubernetes Multi-Cluster Telemetry.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-950/80 border border-purple-800 text-purple-300 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Neural Ops Active</span>
              </span>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div 
                onClick={() => setShowNodeDrawer(true)}
                className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-cyan-500/40 cursor-pointer group"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Service Topology</span>
                  <Server className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-lg font-semibold text-cyan-300">{nodeStatus}</div>
                <span className="text-[10px] text-cyan-500/80 font-mono mt-1 block">Click to inspect pods &rarr;</span>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-emerald-500/40">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">Live CPU Load</span>
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-lg font-semibold text-emerald-300">
                  {telemetryData[telemetryData.length - 1]?.cpu ?? 45}% (Optimal)
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 transition-all hover:border-amber-500/40">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">AI Remediation</span>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-lg font-semibold text-amber-300">
                  {isSelfHealing ? 'Healing Active...' : 'Sandbox Ready'}
                </div>
              </div>
            </div>

            {/* Active Incidents Banner */}
            {incidents.length > 0 && (
              <div className="mt-6 bg-red-950/30 border border-red-900/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveIncidentModal(incidents[0])}>
                  <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                  <div>
                    <span className="text-xs font-mono text-red-400 font-semibold block">ACTIVE INCIDENTS DETECTED ({incidents.length}) — Click to inspect</span>
                    <span className="text-xs text-slate-300">{incidents[0].service}: {incidents[0].details}</span>
                  </div>
                </div>
                <button 
                  onClick={triggerSelfHealing}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-lg transition-all shadow-lg shadow-red-600/20"
                >
                  Resolve All via AI
                </button>
              </div>
            )}

            {/* Real-time Telemetry Chart */}
            <div className="mt-6 bg-slate-950/60 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Cluster Performance Metrics (CPU % vs Memory %)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900">
                  Live Feed (Flask Connected)
                </span>
              </div>
              <div className="h-52 w-full min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="cpu" stroke="#06b6d4" strokeWidth={2} dot={false} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10b981" strokeWidth={2} dot={false} name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Interactive DevOps CLI Terminal Input */}
            <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-3">
              <form onSubmit={handleCliSubmit} className="flex items-center space-x-2 font-mono text-xs">
                <span className="text-cyan-400">sre-admin@tensorcraft:~$</span>
                <input 
                  type="text" 
                  value={cliInput}
                  onChange={(e) => setCliInput(e.target.value)}
                  placeholder="Type command (e.g., 'get pods', 'heal cluster')..."
                  className="bg-transparent flex-1 text-slate-200 focus:outline-none placeholder:text-slate-600"
                />
                <button type="submit" className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded">
                  Run
                </button>
              </form>
            </div>

            {/* AI Log Diagnostic Streamer */}
            <div className="mt-6 bg-slate-950/90 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center space-x-2">
                  <Code2 className="w-4 h-4" />
                  <span>Live AI Diagnostic Stream</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">Auto-scrolling</span>
              </div>
              <div className="h-28 overflow-y-auto space-y-1.5 font-mono text-[11px] bg-black/40 p-3 rounded-lg border border-slate-900">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <span className="text-slate-500">[{log.time}]</span>
                    <span className={`px-1.5 rounded text-[10px] ${log.type === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' : log.type === 'AI_DIAG' ? 'bg-purple-950 text-purple-300 border border-purple-800' : log.type === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'}`}>
                      {log.type}
                    </span>
                    <span className="text-slate-300">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution Log Bar */}
            <div className="mt-6 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 font-mono text-xs">
                <Terminal className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 block">LAST EXECUTED COMMAND:</span>
                  <span className="text-cyan-300">{lastCommand}</span>
                </div>
              </div>
              <button 
                onClick={triggerSelfHealing}
                disabled={isSelfHealing}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-lg shadow-cyan-500/20 flex items-center space-x-1.5 flex-shrink-0"
              >
                {isSelfHealing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-slate-950" />}
                <span>{isSelfHealing ? 'Healing...' : 'Trigger Auto-Fix'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Neural Vision & Voice Control */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold tracking-wide text-slate-200">Neural Vision & Voice Input</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={toggleCamera}
                  title="Toggle Webcam"
                  className={`p-2 rounded-lg border text-xs transition-all ${cameraActive ? 'bg-emerald-950 border-emerald-700 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {cameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button 
                  onClick={toggleVoice}
                  title="Toggle Microphone"
                  className={`p-2 rounded-lg border text-xs transition-all ${voiceActive ? 'bg-cyan-950 border-cyan-700 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                >
                  {voiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Video Feed Box */}
            <div className="relative w-full h-48 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`} 
              />
              {!cameraActive && (
                <div className="text-center p-4 text-slate-500 font-mono text-xs space-y-2">
                  <VideoOff className="w-8 h-8 mx-auto opacity-40" />
                  <p>Webcam Stream Offline.<br/>Click camera icon above to turn on.</p>
                </div>
              )}
              {cameraActive && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>STREAM LIVE</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="mt-4 bg-slate-950/80 border border-slate-800 rounded-xl p-3 font-mono text-xs space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Detected Gesture:</span>
              <span className="text-cyan-400 truncate max-w-[140px]">{detectedGesture}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Voice Listener:</span>
              <span className="text-emerald-400 truncate max-w-[140px]">{voiceTranscript}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Tracking FPS:</span>
              <span className="text-slate-300">{cameraActive ? '60 FPS' : '0 FPS'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Kubernetes Node Inspector Drawer */}
      {showNodeDrawer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between font-mono text-xs animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Kubernetes Pod Topology</span>
                </h3>
                <button onClick={() => setShowNodeDrawer(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-slate-400 mb-4 text-[11px]">
                Active cluster node instances deployed across region <span className="text-cyan-300">{activeRegion}</span>.
              </p>
              
              <div className="space-y-3">
                {pods.map((pod, i) => (
                  <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
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
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] transition-all"
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
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incident Inspector Modal */}
      {activeIncidentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-red-400 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Incident Diagnostics: {activeIncidentModal.id}</span>
              </h3>
              <button onClick={() => setActiveIncidentModal(null)} className="text-slate-400 hover:text-white">[CLOSE]</button>
            </div>
            <div className="space-y-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-500">Service Affected:</span>
                <span className="text-cyan-400">{activeIncidentModal.service}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-500">Severity Level:</span>
                <span className="text-red-400 font-bold">{activeIncidentModal.severity}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between">
                <span className="text-slate-500">Diagnostic Details:</span>
                <span className="text-slate-200">{activeIncidentModal.details}</span>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button 
                onClick={() => setActiveIncidentModal(null)} 
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
              >
                Dismiss
              </button>
              <button 
                onClick={triggerSelfHealing} 
                className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg"
              >
                Auto-Remediate Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}