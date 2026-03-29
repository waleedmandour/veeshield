'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Shield, ShieldCheck, ShieldAlert, FileSearch, HardDrive,
  Trash2, Volume2, Settings, AlertTriangle, Lock, Network,
  RefreshCw, Globe, Activity, Bug, ChevronRight, Wifi,
  Power
} from 'lucide-react';
import { toast } from 'sonner';

// Import components
import { VoiceAssistant } from '@/components/veeshield/VoiceAssistant';
import { ScanPanel } from '@/components/veeshield/ScanPanel';
import { CleanPanel } from '@/components/veeshield/CleanPanel';
import { ThreatList } from '@/components/veeshield/ThreatList';
import { StatusCards } from '@/components/veeshield/StatusCards';
import { QuarantinePanel } from '@/components/veeshield/QuarantinePanel';
import { NetworkPanel } from '@/components/veeshield/NetworkPanel';
import { UpdateNotification } from '@/components/veeshield/UpdateNotification';
import { VPNPanel } from '@/components/veeshield/VPNPanel';

import { vpnEngine } from '@/lib/services/vpn-service';

// ─── Types ───────────────────────────────────────────────────────────────────────

export interface ProtectionStatus {
  status: 'protected' | 'at_risk' | 'scanning' | 'cleaning';
  lastScan: Date | null;
  threatsBlocked: number;
  filesScanned: number;
  realTimeProtection: boolean;
  autoUpdate: boolean;
}

type TabId = 'dashboard' | 'scan' | 'clean' | 'threats' | 'quarantine' | 'network' | 'vpn' | 'settings';

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Shield },
  { id: 'scan', label: 'Scan', icon: Bug },
  { id: 'clean', label: 'Clean', icon: Trash2 },
  { id: 'threats', label: 'Threats', icon: AlertTriangle },
  { id: 'quarantine', label: 'Quarantine', icon: Lock },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'vpn', label: 'VPN', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────────

export function VeeshieldDashboard() {
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus>({
    status: 'protected',
    lastScan: new Date(Date.now() - 3600000),
    threatsBlocked: 12,
    filesScanned: 15420,
    realTimeProtection: true,
    autoUpdate: true
  });

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('2.0.0');
  const [navCollapsed, setNavCollapsed] = useState(false);

  // Get app version from Electron if available
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      (window as any).electronAPI.getAppVersion().then((v: string) => setAppVersion(v));
    }
  }, []);

  const handleQuickScan = useCallback(async () => {
    setProtectionStatus(prev => ({ ...prev, status: 'scanning' }));
    toast.info('Starting quick scan...');
    try {
      const { startSystemScan } = await import('@/lib/services/scan-service');
      const data = await startSystemScan('quick');
      if (data.success) {
        toast.success(`Scan complete! ${data.summary.threatsFound} threats found`);
        setProtectionStatus(prev => ({
          ...prev,
          status: 'protected',
          lastScan: new Date(),
          filesScanned: data.summary.totalScanned
        }));
      }
    } catch {
      toast.error('Scan failed. Please try again.');
      setProtectionStatus(prev => ({ ...prev, status: 'protected' }));
    }
  }, []);

  const handleQuickClean = useCallback(async () => {
    setProtectionStatus(prev => ({ ...prev, status: 'cleaning' }));
    toast.info('Starting system cleanup...');
    try {
      const { quickClean } = await import('@/lib/services/clean-service');
      const data = await quickClean();
      if (data.success) {
        toast.success(`Cleaned ${data.summary.totalSpaceFreedFormatted}!`);
        setProtectionStatus(prev => ({ ...prev, status: 'protected' }));
      }
    } catch {
      toast.error('Cleanup failed. Please try again.');
      setProtectionStatus(prev => ({ ...prev, status: 'protected' }));
    }
  }, []);

  // Handle voice commands — including VPN
  const handleVoiceCommand = useCallback(async (action: string, data?: Record<string, unknown>) => {
    switch (action) {
      case 'quick_scan':
        handleQuickScan();
        break;
      case 'full_scan':
        toast.info('Starting full system scan...');
        import('@/lib/services/scan-service').then(({ startSystemScan }) =>
          startSystemScan('full').then(() => toast.success('Full scan completed'))
        );
        break;
      case 'start_clean':
        handleQuickClean();
        break;
      case 'show_threats':
        setActiveTab('threats');
        break;
      case 'show_history':
        setActiveTab('dashboard');
        break;
      case 'show_quarantine':
        setActiveTab('quarantine');
        break;
      case 'open_settings':
        setActiveTab('settings');
        break;
      case 'show_help':
        toast.info('Say "scan my computer", "clean up files", "connect VPN", or "check status"');
        break;
      case 'vpn_connect':
        setActiveTab('vpn');
        setTimeout(() => vpnEngine.connect(), 500);
        break;
      case 'vpn_disconnect':
        vpnEngine.disconnect();
        toast.success('VPN disconnected');
        break;
      case 'vpn_connect_server': {
        setActiveTab('vpn');
        const location = String(data?.location || '').toLowerCase();
        const allServers = vpnEngine.getAllServers();
        const match = allServers.find(s =>
          s.city.toLowerCase().includes(location) ||
          s.country.toLowerCase().includes(location) ||
          s.countryCode.toLowerCase().includes(location)
        );
        if (match) {
          setTimeout(() => vpnEngine.connect(match.id), 500);
        } else {
          toast.info(`Could not find a server for "${location}". Showing VPN panel.`);
        }
        break;
      }
      case 'show_vpn':
        setActiveTab('vpn');
        break;
      case 'vpn_protocol': {
        const transcript = String(data?.location || '').toLowerCase();
        if (transcript.includes('wireguard')) vpnEngine.setProtocol('wireguard');
        else if (transcript.includes('udp')) vpnEngine.setProtocol('openvpn_udp');
        else if (transcript.includes('tcp')) vpnEngine.setProtocol('openvpn_tcp');
        else if (transcript.includes('ikev2')) vpnEngine.setProtocol('ikev2');
        toast.success('Protocol updated');
        break;
      }
    }
  }, [handleQuickScan, handleQuickClean]);

  const getStatusIcon = () => {
    switch (protectionStatus.status) {
      case 'protected': return <ShieldCheck className="w-14 h-14 text-emerald-400" />;
      case 'at_risk': return <ShieldAlert className="w-14 h-14 text-amber-400" />;
      case 'scanning': return <FileSearch className="w-14 h-14 text-cyan-400 animate-pulse" />;
      case 'cleaning': return <Trash2 className="w-14 h-14 text-purple-400 animate-pulse" />;
      default: return <Shield className="w-14 h-14 text-white/30" />;
    }
  };

  const statusText: Record<string, { title: string; sub: string; color: string }> = {
    protected: { title: 'Protected', sub: 'Your system is secure', color: 'text-emerald-400' },
    at_risk: { title: 'Attention Needed', sub: 'Review recommended', color: 'text-amber-400' },
    scanning: { title: 'Scanning', sub: 'Checking for threats...', color: 'text-cyan-400' },
    cleaning: { title: 'Cleaning', sub: 'Removing junk files...', color: 'text-purple-400' },
  };
  const st = statusText[protectionStatus.status];

  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--bg-solid))] overflow-hidden">
      {/* ─── Title Bar (Windows 11 frame) ──────────────────────────────────── */}
      <header className="h-9 flex items-center justify-between px-3 bg-[hsl(var(--bg-mica))] border-b border-[hsl(var(--border-subtle)/0.3)] flex-shrink-0 select-none">
        <div className="flex items-center gap-2.5">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Shield className="w-4 h-4 text-hsl(var(--accent))" />
            {protectionStatus.status === 'protected' && (
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-breathe" />
            )}
          </div>
          <span className="text-xs font-semibold text-[hsl(var(--text-secondary))]">VeeShield</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
            className={`w-7 h-7 rounded flex items-center justify-center transition-colors ${
              isVoiceAssistantOpen ? 'bg-hsl(var(--accent)/0.15) text-hsl(var(--accent))' : 'text-[hsl(var(--text-tertiary))] hover:bg-white/[0.05]'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-[hsl(var(--text-disabled))]">v{appVersion}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ─── Navigation Rail (Win11 style) ────────────────────────────────── */}
        <nav className="w-16 flex flex-col items-center py-3 gap-0.5 bg-[hsl(var(--bg-mica))] border-r border-[hsl(var(--border-subtle)/0.3)] flex-shrink-0">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            // VPN badge for connected state
            const showVPNBadge = item.id === 'vpn' && vpnEngine.getState().status === 'connected';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-12 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all duration-150 group ${
                  isActive
                    ? 'bg-hsl(var(--accent)/0.12)'
                    : 'text-[hsl(var(--text-tertiary))] hover:bg-white/[0.04] hover:text-[hsl(var(--text-secondary))]'
                }`}
                title={item.label}
              >
                <div className="relative">
                  <Icon className={`w-[18px] h-[18px] transition-colors ${
                    isActive ? 'text-hsl(var(--accent))' : ''
                  }`} />
                  {showVPNBadge && (
                    <div className="absolute -top-1 -right-1.5 w-2 h-2 bg-emerald-400 rounded-full animate-breathe" />
                  )}
                </div>
                <span className={`text-[9px] leading-none transition-colors ${
                  isActive ? 'text-hsl(var(--accent)) font-medium' : ''
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-hsl(var(--accent))" />
                )}
              </button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Voice Assistant Toggle */}
          <button
            onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
            className={`relative w-12 h-10 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
              isVoiceAssistantOpen
                ? 'bg-red-500/10 text-red-400'
                : 'text-[hsl(var(--text-tertiary))] hover:bg-white/[0.04]'
            }`}
            title="Voice Assistant"
          >
            <div className="relative">
              <Volume2 className="w-[18px] h-[18px]" />
              {isVoiceAssistantOpen && (
                <div className="absolute -top-1 -right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </div>
            <span className="text-[9px] leading-none">Voice</span>
          </button>
        </nav>

        {/* ─── Main Content Area ───────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 max-w-[1200px] mx-auto">
            {/* Tab header bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {(() => {
                  const CurrentIcon = NAV_ITEMS.find(n => n.id === activeTab)?.icon || Shield;
                  return <CurrentIcon className="w-5 h-5 text-hsl(var(--accent))" />;
                })()}
                <h1 className="text-lg font-semibold text-[hsl(var(--text-primary))]">
                  {NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[hsl(var(--text-tertiary))]">
                <span>Definitions: v2024.03.15</span>
                <span className="text-hsl(var(--border-subtle))">·</span>
                <span>Engine: v2.1.0</span>
              </div>
            </div>

            {/* ─── Tab Content ────────────────────────────────────────────── */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-tab-enter">
                {/* Hero Status Card */}
                <div className="win-card p-8 reveal-highlight">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      {getStatusIcon()}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h2 className={`text-2xl font-bold ${st.color}`}>{st.title}</h2>
                      <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">{st.sub}</p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        <button onClick={handleQuickScan} disabled={protectionStatus.status === 'scanning'}
                          className="win-btn win-btn-primary text-sm px-5 py-2">
                          <FileSearch className="w-4 h-4" /> Quick Scan
                        </button>
                        <button onClick={handleQuickClean} disabled={protectionStatus.status === 'cleaning'}
                          className="win-btn win-btn-secondary text-sm px-5 py-2">
                          <Trash2 className="w-4 h-4" /> Quick Clean
                        </button>
                        <button onClick={() => setIsVoiceAssistantOpen(true)}
                          className="win-btn win-btn-secondary text-sm px-5 py-2">
                          <Volume2 className="w-4 h-4" /> Hey Vee
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 flex-shrink-0">
                      <div className="text-center p-3 rounded-lg bg-white/[0.03] border border-[hsl(var(--border-subtle)/0.3)]">
                        <p className="text-xl font-bold text-emerald-400">{protectionStatus.threatsBlocked}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Blocked</p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-white/[0.03] border border-[hsl(var(--border-subtle)/0.3)]">
                        <p className="text-xl font-bold text-cyan-400">{protectionStatus.filesScanned.toLocaleString()}</p>
                        <p className="text-[10px] text-[hsl(var(--text-tertiary))]">Scanned</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Cards */}
                <StatusCards protectionStatus={protectionStatus} setProtectionStatus={setProtectionStatus} />
              </div>
            )}

            {activeTab === 'scan' && <div className="animate-tab-enter"><ScanPanel /></div>}
            {activeTab === 'clean' && <div className="animate-tab-enter"><CleanPanel /></div>}
            {activeTab === 'threats' && <div className="animate-tab-enter"><ThreatList /></div>}
            {activeTab === 'quarantine' && <div className="animate-tab-enter"><QuarantinePanel /></div>}
            {activeTab === 'network' && <div className="animate-tab-enter"><NetworkPanel /></div>}
            {activeTab === 'vpn' && <div className="animate-tab-enter h-[calc(100vh-120px)]"><VPNPanel /></div>}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-tab-enter max-w-2xl">
                {/* Protection */}
                <div className="win-card p-5">
                  <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-hsl(var(--accent))" /> Protection
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Real-time Protection', desc: 'Monitor files and activities', enabled: protectionStatus.realTimeProtection, toggle: () => setProtectionStatus(p => ({ ...p, realTimeProtection: !p.realTimeProtection })) },
                      { label: 'Auto-update Definitions', desc: 'Download latest threat signatures', enabled: protectionStatus.autoUpdate, toggle: () => setProtectionStatus(p => ({ ...p, autoUpdate: !p.autoUpdate })) },
                      { label: 'Cloud-assisted Protection', desc: 'Use cloud intelligence for detection', enabled: true, toggle: () => {} },
                      { label: 'PUA Protection', desc: 'Block potentially unwanted applications', enabled: true, toggle: () => {} },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="text-sm text-[hsl(var(--text-primary))]">{item.label}</p>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{item.desc}</p>
                        </div>
                        <button onClick={item.toggle}
                          className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${item.enabled ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Voice */}
                <div className="win-card p-5">
                  <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-hsl(var(--accent))" /> Voice Assistant
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Enable "Hey Vee" wake word', enabled: true },
                      { label: 'Voice feedback', enabled: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                        <p className="text-sm text-[hsl(var(--text-primary))]">{item.label}</p>
                        <button className={`w-9 h-5 rounded-full transition-colors relative ${item.enabled ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Updates */}
                <div className="win-card p-5">
                  <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-hsl(var(--accent))" /> Application Updates
                  </h3>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] mb-3">
                    <div>
                      <p className="text-sm text-[hsl(var(--text-primary))]">Current Version</p>
                      <p className="text-[11px] text-[hsl(var(--text-tertiary))]">VeeShield v{appVersion}</p>
                    </div>
                    <span className="win-badge win-badge-success text-[10px]">Up to date</span>
                  </div>
                  <div className="space-y-3 mb-3">
                    {[
                      { label: 'Auto-check for Updates', desc: 'Every 4 hours, download silently', enabled: true },
                      { label: 'Install on Quit', desc: 'Apply updates when closing', enabled: true },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="text-sm text-[hsl(var(--text-primary))]">{item.label}</p>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{item.desc}</p>
                        </div>
                        <button className={`w-9 h-5 rounded-full transition-colors relative ${item.enabled ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      if (typeof window !== 'undefined' && (window as any).electronAPI) {
                        const result = await (window as any).electronAPI.checkForUpdates();
                        if (result.updateAvailable) {
                          toast.info(`Update available: v${result.updateInfo.version}`);
                        } else {
                          toast.success('Already on the latest version');
                        }
                      } else {
                        toast.info('Updates managed automatically every 4 hours');
                      }
                    }}
                    className="win-btn win-btn-secondary w-full text-sm py-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Check for Updates Now
                  </button>
                </div>

                {/* Scheduled Scans */}
                <div className="win-card p-5">
                  <h3 className="text-sm font-semibold text-[hsl(var(--text-primary))] mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-hsl(var(--accent))" /> Scheduled Scans
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Automatic Weekly Scan', desc: 'Full scan every Sunday at 2:00 AM', enabled: true },
                      { label: 'Automatic Cleanup', desc: 'Clean temp files every week', enabled: false },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
                        <div>
                          <p className="text-sm text-[hsl(var(--text-primary))]">{item.label}</p>
                          <p className="text-[11px] text-[hsl(var(--text-tertiary))]">{item.desc}</p>
                        </div>
                        <button className={`w-9 h-5 rounded-full transition-colors relative ${item.enabled ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}>
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'left-[18px]' : 'left-0.5'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Voice Assistant Overlay */}
      {isVoiceAssistantOpen && (
        <VoiceAssistant onCommand={handleVoiceCommand} onClose={() => setIsVoiceAssistantOpen(false)} />
      )}

      {/* Auto-Update Notification */}
      <UpdateNotification />
    </div>
  );
}

export default VeeshieldDashboard;
