'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Power, Globe, Zap, Shield, Lock, Unlock, MapPin, Star, Search,
  ChevronDown, ChevronUp, ChevronRight, Signal, Timer, ArrowDown,
  ArrowUp, RefreshCw, Eye, EyeOff, Settings, Wifi, Activity,
  Server, ArrowLeftRight, Droplets, Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { vpnEngine, type VPNState, type VPNServer, type VPNProtocol, type VPNRegion, type VPNSpeedMetrics } from '@/lib/services/vpn-service';

// ─── Connection Power Button ────────────────────────────────────────────────────

function ConnectButton({ status, onToggle }: { status: VPNState['status']; onToggle: () => void }) {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isDisconnecting = status === 'disconnecting';
  const isActive = isConnected || isConnecting;

  return (
    <button
      onClick={onToggle}
      className="relative group w-36 h-36 flex items-center justify-center focus:outline-none"
      aria-label={isConnected ? 'Disconnect VPN' : 'Connect VPN'}
    >
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
        isConnected
          ? 'bg-emerald-500/10 shadow-[0_0_60px_rgba(16,185,129,0.15)] animate-pulse-glow'
          : isConnecting
          ? 'bg-cyan-500/10 shadow-[0_0_40px_rgba(6,182,212,0.1)]'
          : 'bg-white/[0.02]'
      }`} />

      {/* Animated ring */}
      {(isConnecting || isDisconnecting) && (
        <svg className="absolute inset-0 w-full h-full animate-ring-spin" viewBox="0 0 144 144">
          <circle
            cx="72" cy="72" r="68"
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
            strokeDasharray="80 348"
            strokeLinecap="round"
            className="animate-ring-dash"
          />
        </svg>
      )}

      {/* Static ring */}
      <div className={`absolute inset-2 rounded-full border-2 transition-all duration-500 ${
        isConnected
          ? 'border-emerald-500/40'
          : isConnecting
          ? 'border-cyan-500/30 animate-pulse'
          : 'border-white/10'
      }`} />

      {/* Inner circle */}
      <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${
        isConnected
          ? 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.4)]'
          : isConnecting
          ? 'bg-cyan-500/80 shadow-[0_4px_16px_rgba(6,182,212,0.3)]'
          : isDisconnecting
          ? 'bg-amber-500/80'
          : 'bg-white/[0.06] group-hover:bg-white/[0.1]'
      }`}>
        <Power
          className={`w-10 h-10 transition-all duration-300 ${
            isConnected
              ? 'text-white rotate-0'
              : isConnecting
              ? 'text-white animate-pulse'
              : isDisconnecting
              ? 'text-white'
              : 'text-white/40 group-hover:text-white/60 -rotate-90'
          }`}
          strokeWidth={2}
        />
      </div>

      {/* Label */}
      <div className="absolute -bottom-8 text-center">
        <span className={`text-xs font-medium transition-colors duration-300 ${
          isConnected ? 'text-emerald-400' :
          isConnecting ? 'text-cyan-400' :
          isDisconnecting ? 'text-amber-400' :
          'text-white/40'
        }`}>
          {isConnected ? 'CONNECTED' :
           isConnecting ? 'CONNECTING...' :
           isDisconnecting ? 'DISCONNECTING...' :
           'NOT CONNECTED'}
        </span>
      </div>
    </button>
  );
}

// ─── Speed Gauge ───────────────────────────────────────────────────────────────

function SpeedGauge({ metrics, connected }: { metrics: VPNSpeedMetrics; connected: boolean }) {
  if (!connected) {
    return (
      <div className="flex items-center justify-center h-32 text-white/20">
        <Wifi className="w-8 h-8 mr-2" />
        <span className="text-sm">Connect to view speed</span>
      </div>
    );
  }

  const maxSpeed = 200;
  const dlAngle = Math.min((metrics.downloadSpeed / maxSpeed) * 180, 180);
  const ulAngle = Math.min((metrics.uploadSpeed / maxSpeed) * 180, 180);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center">
        <svg viewBox="0 0 100 60" className="w-28 h-auto mx-auto">
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(0 0% 18%)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(199 89% 48%)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${dlAngle * 0.7} 200`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-2xl font-semibold text-white tabular-nums">{metrics.downloadSpeed.toFixed(1)}</div>
        <div className="text-xs text-white/40 mt-0.5">Mbps ↓</div>
      </div>
      <div className="text-center">
        <svg viewBox="0 0 100 60" className="w-28 h-auto mx-auto">
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(0 0% 18%)" strokeWidth="6" strokeLinecap="round" />
          <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(160 84% 39%)" strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${ulAngle * 0.7} 200`}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="text-2xl font-semibold text-white tabular-nums">{metrics.uploadSpeed.toFixed(1)}</div>
        <div className="text-xs text-white/40 mt-0.5">Mbps ↑</div>
      </div>
    </div>
  );
}

// ─── World Map ─────────────────────────────────────────────────────────────────

function WorldMap({ servers, activeServer, onSelect, connected }: {
  servers: VPNServer[];
  activeServer: VPNServer | null;
  onSelect: (s: VPNServer) => void;
  connected: boolean;
}) {
  const [hoveredServer, setHoveredServer] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert lat/lng to SVG coordinates (Mercator-ish projection)
  const toXY = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - lat) / 180) * 100;
    return { x, y };
  };

  return (
    <div className="relative rounded-xl overflow-hidden bg-[hsl(var(--bg-card)/0.3)] border border-[hsl(var(--border-card)/0.3)]">
      {/* Simplified world map background SVG */}
      <svg viewBox="0 0 100 55" className="w-full" ref={svgRef}>
        {/* Grid lines */}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 6.875} x2="100" y2={i * 6.875} stroke="hsl(0 0% 14%)" strokeWidth="0.15" />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * 8.33} y1="0" x2={i * 8.33} y2="55" stroke="hsl(0 0% 14%)" strokeWidth="0.15" />
        ))}

        {/* Connection line to active server */}
        {connected && activeServer && (
          <line
            x1="25" y1="35" // approximate user location
            x2={toXY(activeServer.latitude, activeServer.longitude).x}
            y2={toXY(activeServer.latitude, activeServer.longitude).y}
            stroke="hsl(var(--accent))"
            strokeWidth="0.3"
            strokeDasharray="1 1"
            className="animate-pulse"
            opacity="0.5"
          />
        )}

        {/* Server dots */}
        {servers.map(server => {
          const { x, y } = toXY(server.latitude, server.longitude);
          const isActive = activeServer?.id === server.id;
          const isHovered = hoveredServer === server.id;

          return (
            <g
              key={server.id}
              onClick={() => onSelect(server)}
              onMouseEnter={() => setHoveredServer(server.id)}
              onMouseLeave={() => setHoveredServer(null)}
              className="cursor-pointer"
            >
              {/* Pulse for active */}
              {isActive && connected && (
                <>
                  <circle cx={x} cy={y} r="2" fill="hsl(var(--accent))" opacity="0.2" className="animate-ping" />
                  <circle cx={x} cy={y} r="1.2" fill="hsl(var(--accent))" opacity="0.3" />
                </>
              )}

              {/* Dot */}
              <circle
                cx={x} cy={y}
                r={isActive ? 0.8 : isHovered ? 0.7 : 0.45}
                fill={isActive ? 'hsl(var(--accent))' : isHovered ? 'hsl(0 0% 70%)' : server.premium ? 'hsl(280 60% 60%)' : 'hsl(0 0% 45%)'}
                className="transition-all duration-200"
              />
            </g>
          );
        })}

        {/* User location indicator */}
        <circle cx="25" cy="35" r="0.6" fill="hsl(var(--accent))" />
        <circle cx="25" cy="35" r="1.5" fill="none" stroke="hsl(var(--accent))" strokeWidth="0.2" className="animate-breathe" />
      </svg>

      {/* Tooltip */}
      {hoveredServer && !activeServer?.id?.includes(hoveredServer) && (
        <div className="absolute top-2 right-2 px-3 py-1.5 rounded-lg bg-[hsl(var(--bg-elevated))] border border-[hsl(var(--border-card))] text-xs pointer-events-none animate-fluent-in">
          <div className="flex items-center gap-1.5">
            <span>{servers.find(s => s.id === hoveredServer)?.flag}</span>
            <span className="text-white font-medium">{servers.find(s => s.id === hoveredServer)?.city}</span>
            <span className="text-white/40">{servers.find(s => s.id === hoveredServer)?.country}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Server List ───────────────────────────────────────────────────────────────

function ServerList({ servers, activeServer, onSelect, onFavorite, favorites, selectedRegion, onRegionChange }: {
  servers: VPNServer[];
  activeServer: VPNServer | null;
  onSelect: (s: VPNServer) => void;
  onFavorite: (id: string) => void;
  favorites: string[];
  selectedRegion: VPNRegion | 'all' | 'favorites';
  onRegionChange: (r: VPNRegion | 'all' | 'favorites') => void;
}) {
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredServers = useMemo(() => {
    let list = servers;

    if (selectedRegion !== 'all') {
      if (selectedRegion === 'favorites') {
        list = list.filter(s => favorites.includes(s.id));
      } else {
        list = list.filter(s => s.region === selectedRegion);
      }
    }

    if (showFavoritesOnly) {
      list = list.filter(s => favorites.includes(s.id));
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q)
      );
    }

    return list;
  }, [servers, selectedRegion, search, showFavoritesOnly, favorites]);

  // Group by country
  const grouped = useMemo(() => {
    const map = new Map<string, VPNServer[]>();
    filteredServers.forEach(s => {
      const key = `${s.flag} ${s.country}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [filteredServers]);

  const regions = vpnEngine.getServerRegions();

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Search servers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[hsl(var(--bg-input))] border border-[hsl(var(--border-subtle)/0.4)] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-hsl(var(--accent)) transition-colors"
        />
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${showFavoritesOnly ? 'text-amber-400' : 'text-white/30 hover:text-white/50'}`}
        >
          <Star className="w-3.5 h-3.5" fill={showFavoritesOnly ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Region tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => onRegionChange('all')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedRegion === 'all' ? 'bg-hsl(var(--accent))/15 text-hsl(var(--accent))' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
        >
          All
        </button>
        {regions.map(r => (
          <button
            key={r.region}
            onClick={() => onRegionChange(r.region)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              selectedRegion === r.region ? 'bg-hsl(var(--accent))/15 text-hsl(var(--accent))' : 'text-white/40 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Server list */}
      <div className="flex-1 overflow-y-auto space-y-0.5 -mx-1 px-1">
        {Array.from(grouped.entries()).map(([country, svrs]) => (
          <div key={country}>
            <div className="px-2 py-1 text-xs text-white/30 font-medium">{country}</div>
            {svrs.map(server => {
              const isActive = activeServer?.id === server.id;
              const isFav = favorites.includes(server.id);

              return (
                <button
                  key={server.id}
                  onClick={() => onSelect(server)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 group ${
                    isActive
                      ? 'bg-hsl(var(--accent)/0.1) border border-hsl(var(--accent)/0.2)'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  }`}
                >
                  <span className="text-sm">{server.flag}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-sm truncate ${isActive ? 'text-hsl(var(--accent)) font-medium' : 'text-white/70'}`}>
                      {server.city}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <span>{server.ping}ms</span>
                      <span>·</span>
                      <span>{server.load}% load</span>
                      {server.premium && (
                        <>
                          <span>·</span>
                          <span className="text-purple-400">PRO</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Load indicator */}
                  <div className="w-8 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        server.load > 80 ? 'bg-red-400' :
                        server.load > 60 ? 'bg-amber-400' :
                        'bg-emerald-400'
                      }`}
                      style={{ width: `${server.load}%` }}
                    />
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); onFavorite(server.id); }}
                    className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className={`w-3 h-3 ${isFav ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} />
                  </button>

                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {filteredServers.length === 0 && (
          <div className="text-center py-8 text-white/30 text-sm">No servers found</div>
        )}
      </div>
    </div>
  );
}

// ─── Protocol Selector ─────────────────────────────────────────────────────────

function ProtocolSelector({ protocol, onChange }: { protocol: VPNProtocol; onChange: (p: VPNProtocol) => void }) {
  const protocols = vpnEngine.getAllProtocols();

  return (
    <div className="grid grid-cols-2 gap-2">
      {protocols.map(p => {
        const info = vpnEngine.getProtocolInfo(p);
        const isActive = protocol === p;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 ${
              isActive
                ? 'bg-hsl(var(--accent)/0.1) border-hsl(var(--accent)/0.3)'
                : 'bg-hsl(var(--bg-card)/0.3) border-[hsl(var(--border-card)/0.3)] hover:border-white/10'
            }`}
          >
            <div className={`text-xs font-semibold mb-0.5 ${isActive ? 'text-hsl(var(--accent))' : 'text-white/60'}`}>
              {info.name}
            </div>
            <div className="text-[10px] text-white/30 leading-tight">{info.description}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Stats Panel ───────────────────────────────────────────────────────────────

function StatsPanel({ state }: { state: VPNState }) {
  const { stats, speedMetrics, connectionInfo } = state;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
        <div className="flex items-center gap-2 mb-1">
          <Timer className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Session</span>
        </div>
        <div className="text-lg font-semibold text-white tabular-nums">
          {vpnEngine.formatDuration(stats.sessionDuration)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
        <div className="flex items-center gap-2 mb-1">
          <Signal className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Ping</span>
        </div>
        <div className="text-lg font-semibold text-white tabular-nums">
          {speedMetrics.ping}<span className="text-xs text-white/30 ml-1">ms</span>
        </div>
      </div>
      <div className="p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
        <div className="flex items-center gap-2 mb-1">
          <ArrowDown className="w-3.5 h-3.5 text-blue-400/60" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Downloaded</span>
        </div>
        <div className="text-lg font-semibold text-white tabular-nums">
          {vpnEngine.formatBytes(stats.totalDataDownloaded)}
        </div>
      </div>
      <div className="p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
        <div className="flex items-center gap-2 mb-1">
          <ArrowUp className="w-3.5 h-3.5 text-emerald-400/60" />
          <span className="text-[10px] text-white/30 uppercase tracking-wider">Uploaded</span>
        </div>
        <div className="text-lg font-semibold text-white tabular-nums">
          {vpnEngine.formatBytes(stats.totalDataUploaded)}
        </div>
      </div>
    </div>
  );
}

// ─── Main VPN Panel ────────────────────────────────────────────────────────────

export function VPNPanel() {
  const [state, setState] = useState<VPNState>(vpnEngine.getState());
  const [selectedRegion, setSelectedRegion] = useState<VPNRegion | 'all' | 'favorites'>('all');
  const [connectionStage, setConnectionStage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    const unsub = vpnEngine.subscribe(setState);
    const unsubStage = vpnEngine.onStage(stage => setConnectionStage(stage));
    return () => { unsub(); unsubStage(); };
  }, []);

  const handleToggle = useCallback(async () => {
    try {
      if (state.status === 'connected' || state.status === 'disconnecting') {
        await vpnEngine.disconnect();
        toast.success('VPN disconnected');
      } else {
        await vpnEngine.connect();
        toast.success(`Connected to ${state.currentServer?.city || 'VPN'}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Connection failed');
    }
  }, [state.status, state.currentServer]);

  const handleSelectServer = useCallback(async (server: VPNServer) => {
    if (state.status === 'connected') {
      try {
        await vpnEngine.disconnect();
        await vpnEngine.connect(server.id);
        toast.success(`Connected to ${server.city}`);
      } catch (err: any) {
        toast.error(err.message || 'Connection failed');
      }
    } else {
      setState(prev => ({ ...prev, currentServer: server }));
    }
  }, [state.status]);

  const handleToggleFavorite = useCallback((id: string) => {
    vpnEngine.toggleFavorite(id);
  }, []);

  const handleProtocolChange = useCallback((p: VPNProtocol) => {
    if (state.status === 'connected') {
      toast.info('Reconnecting with new protocol...');
    }
    vpnEngine.setProtocol(p);
  }, [state.status]);

  const servers = vpnEngine.getAllServers();
  const isConnected = state.status === 'connected';

  return (
    <div className="h-full animate-tab-enter">
      <div className="flex gap-5 h-full">
        {/* Left — Connection Panel */}
        <div className="flex-1 flex flex-col items-center">
          {/* Connect Button */}
          <div className="pt-4 pb-10 flex flex-col items-center">
            <ConnectButton status={state.status} onToggle={handleToggle} />
          </div>

          {/* Server info */}
          {state.currentServer && (
            <div className="text-center mb-6 animate-fluent-in">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-xl">{state.currentServer.flag}</span>
                <span className="text-lg font-semibold text-white">{state.currentServer.city}</span>
                <span className="text-sm text-white/40">{state.currentServer.country}</span>
              </div>
              {state.connectionInfo && (
                <div className="text-xs text-white/30 space-y-0.5">
                  <div>IP: {state.connectionInfo.assignedIP}</div>
                  <div>{vpnEngine.getProtocolInfo(state.protocol).name} · {state.connectionInfo.encryption}</div>
                </div>
              )}
            </div>
          )}

          {/* Connection stage */}
          {state.status === 'connecting' && connectionStage && (
            <div className="mb-6 text-center animate-fluent-in">
              <div className="flex items-center justify-center gap-2 text-sm text-cyan-400">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="capitalize">{connectionStage.replace(/_/g, ' ')}</span>
              </div>
            </div>
          )}

          {/* Speed Gauge */}
          <div className="w-full max-w-xs mb-5">
            <SpeedGauge metrics={state.speedMetrics} connected={isConnected} />
          </div>

          {/* Stats */}
          {isConnected && (
            <div className="w-full max-w-xs animate-fluent-in">
              <StatsPanel state={state} />
            </div>
          )}

          {/* Quick features when disconnected */}
          {!isConnected && state.status !== 'connecting' && (
            <div className="w-full max-w-xs mt-6 space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400/60" />
                  <span className="text-xs text-white/50">Recommended</span>
                </div>
                <button
                  onClick={() => {
                    const server = vpnEngine.getRecommendedServer();
                    setState(prev => ({ ...prev, currentServer: server }));
                  }}
                  className="text-xs text-hsl(var(--accent)) hover:underline"
                >
                  {vpnEngine.getRecommendedServer().flag} {vpnEngine.getRecommendedServer().city}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-hsl(var(--bg-card)/0.3) border border-[hsl(var(--border-card)/0.3)]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-400/60" />
                  <span className="text-xs text-white/50">Fastest</span>
                </div>
                <button
                  onClick={() => {
                    const server = vpnEngine.getFastestServer();
                    setState(prev => ({ ...prev, currentServer: server }));
                  }}
                  className="text-xs text-hsl(var(--accent)) hover:underline"
                >
                  {vpnEngine.getFastestServer().flag} {vpnEngine.getFastestServer().city}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right — Server List + Map */}
        <div className="w-80 flex flex-col min-w-0">
          {/* Toggle map/list */}
          <div className="flex items-center gap-1 mb-3">
            <button
              onClick={() => setShowMap(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                showMap ? 'bg-hsl(var(--accent)/0.15) text-hsl(var(--accent))' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Globe className="w-3.5 h-3.5 inline mr-1" />Map
            </button>
            <button
              onClick={() => setShowMap(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors text-center ${
                !showMap ? 'bg-hsl(var(--accent)/0.15) text-hsl(var(--accent))' : 'text-white/40 hover:text-white/60'
              }`}
            >
              <Server className="w-3.5 h-3.5 inline mr-1" />Servers
            </button>
          </div>

          {showMap ? (
            <div className="flex-1 space-y-3">
              <WorldMap
                servers={servers}
                activeServer={state.currentServer}
                onSelect={handleSelectServer}
                connected={isConnected}
              />
              {/* Protocol selector below map */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Radio className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/30 uppercase tracking-wider font-medium">Protocol</span>
                </div>
                <ProtocolSelector protocol={state.protocol} onChange={handleProtocolChange} />
              </div>
              {/* Security features */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-hsl(var(--bg-card)/0.3)">
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-red-400/60" />
                    <span className="text-xs text-white/50">Kill Switch</span>
                  </div>
                  <button
                    onClick={() => vpnEngine.toggleKillSwitch(!state.killSwitch)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${state.killSwitch ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${state.killSwitch ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-hsl(var(--bg-card)/0.3)">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-400/60" />
                    <span className="text-xs text-white/50">DNS Leak Protection</span>
                  </div>
                  <button
                    onClick={() => vpnEngine.toggleDnsLeakProtection(!state.dnsLeakProtection)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${state.dnsLeakProtection ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${state.dnsLeakProtection ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-hsl(var(--bg-card)/0.3)">
                  <div className="flex items-center gap-2">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400/60" />
                    <span className="text-xs text-white/50">Split Tunneling</span>
                  </div>
                  <button
                    onClick={() => vpnEngine.toggleSplitTunneling(!state.splitTunneling)}
                    className={`w-9 h-5 rounded-full transition-colors relative ${state.splitTunneling ? 'bg-hsl(var(--accent))' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${state.splitTunneling ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <ServerList
              servers={servers}
              activeServer={state.currentServer}
              onSelect={handleSelectServer}
              onFavorite={handleToggleFavorite}
              favorites={state.favorites}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default VPNPanel;
