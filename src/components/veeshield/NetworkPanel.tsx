'use client';

import { useState } from 'react';
import { Network, Shield, ShieldAlert, Globe, ArrowDown, ArrowUp, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface NetworkEvent {
  id: string;
  process: string;
  direction: 'inbound' | 'outbound';
  protocol: string;
  localAddress: string;
  remoteAddress: string;
  remoteHost: string;
  bytes: number;
  timestamp: string;
  suspicious: boolean;
  blocked: boolean;
}

const mockNetworkEvents: NetworkEvent[] = [
  {
    id: 'n1',
    process: 'chrome.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54321',
    remoteAddress: '142.250.80.46:443',
    remoteHost: 'google.com',
    bytes: 15420,
    timestamp: '2 min ago',
    suspicious: false,
    blocked: false
  },
  {
    id: 'n2',
    process: 'firefox.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54322',
    remoteAddress: '151.101.1.69:443',
    remoteHost: 'reddit.com',
    bytes: 89200,
    timestamp: '3 min ago',
    suspicious: false,
    blocked: false
  },
  {
    id: 'n3',
    process: 'svchost.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54323',
    remoteAddress: '20.190.159.2:443',
    remoteHost: 'microsoft.com',
    bytes: 4200,
    timestamp: '5 min ago',
    suspicious: false,
    blocked: false
  },
  {
    id: 'n4',
    process: 'update_agent.exe',
    direction: 'outbound',
    protocol: 'HTTP',
    localAddress: '192.168.1.100:54324',
    remoteAddress: '185.234.72.45:80',
    remoteHost: 'malware-c2.xyz',
    bytes: 1024,
    timestamp: '8 min ago',
    suspicious: true,
    blocked: true
  },
  {
    id: 'n5',
    process: 'discord.exe',
    direction: 'outbound',
    protocol: 'WSS',
    localAddress: '192.168.1.100:54325',
    remoteAddress: '162.159.128.233:443',
    remoteHost: 'discord.gg',
    bytes: 45600,
    timestamp: '10 min ago',
    suspicious: false,
    blocked: false
  },
  {
    id: 'n6',
    process: 'windowsdefender.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54326',
    remoteAddress: '20.190.160.14:443',
    remoteHost: 'windowsupdate.com',
    bytes: 234000,
    timestamp: '15 min ago',
    suspicious: false,
    blocked: false
  },
  {
    id: 'n7',
    process: 'unknown_process.exe',
    direction: 'inbound',
    protocol: 'TCP',
    localAddress: '192.168.1.100:4444',
    remoteAddress: '91.134.245.78:52341',
    remoteHost: 'unknown',
    bytes: 512,
    timestamp: '20 min ago',
    suspicious: true,
    blocked: true
  }
];

export function NetworkPanel() {
  const [events] = useState<NetworkEvent[]>(mockNetworkEvents);
  const [filter, setFilter] = useState<'all' | 'blocked' | 'suspicious' | 'allowed'>('all');

  const filtered = events.filter(e => {
    if (filter === 'blocked') return e.blocked;
    if (filter === 'suspicious') return e.suspicious;
    if (filter === 'allowed') return !e.blocked && !e.suspicious;
    return true;
  });

  const blockedCount = events.filter(e => e.blocked).length;
  const suspiciousCount = events.filter(e => e.suspicious).length;
  const totalBytesOut = events.filter(e => e.direction === 'outbound').reduce((s, e) => s + e.bytes, 0);
  const totalBytesIn = events.filter(e => e.direction === 'inbound').reduce((s, e) => s + e.bytes, 0);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <ArrowUp className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-green-400">{formatBytes(totalBytesOut)}</p>
                <p className="text-xs text-slate-400">Outbound</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <ArrowDown className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">{formatBytes(totalBytesIn)}</p>
                <p className="text-xs text-slate-400">Inbound</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-red-400">{blockedCount}</p>
                <p className="text-xs text-slate-400">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-yellow-400">{suspiciousCount}</p>
                <p className="text-xs text-slate-400">Suspicious</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Activity */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Activity
              </CardTitle>
              <CardDescription>
                Real-time network connections monitoring
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {(['all', 'blocked', 'suspicious', 'allowed'] as const).map(f => (
                <Button
                  key={f}
                  size="sm"
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                  className={filter === f ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-slate-600 text-slate-300'}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filtered.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${
                    event.blocked
                      ? 'bg-red-500/10 border-red-500/30'
                      : event.suspicious
                      ? 'bg-yellow-500/10 border-yellow-500/30'
                      : 'bg-slate-700/30 border-slate-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${
                      event.blocked ? 'bg-red-500/20' :
                      event.suspicious ? 'bg-yellow-500/20' :
                      'bg-green-500/20'
                    }`}>
                      {event.direction === 'outbound' 
                        ? <ArrowUp className={`h-4 w-4 ${event.blocked ? 'text-red-400' : event.suspicious ? 'text-yellow-400' : 'text-green-400'}`} />
                        : <ArrowDown className={`h-4 w-4 ${event.blocked ? 'text-red-400' : event.suspicious ? 'text-yellow-400' : 'text-blue-400'}`} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white text-sm">{event.process}</span>
                        <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">{event.protocol}</Badge>
                        {event.blocked && <Badge className="bg-red-500/20 text-red-400 text-xs">BLOCKED</Badge>}
                        {event.suspicious && !event.blocked && <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">SUSPICIOUS</Badge>}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{event.remoteHost} ({event.remoteAddress})</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-white">{formatBytes(event.bytes)}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {event.timestamp}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Firewall Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Firewall Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-white">Windows Firewall</p>
                <p className="text-xs text-green-400">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-white">VeeShield Firewall</p>
                <p className="text-xs text-green-400">Monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <p className="text-sm font-medium text-white">Intrusion Detection</p>
                <p className="text-xs text-green-400">Enabled</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default NetworkPanel;
