'use client';

import { useState } from 'react';
import { 
  AlertTriangle, Bug, Shield, Lock, Eye, 
  Network, Trash2, RotateCcw, Download, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Threat {
  id: string;
  name: string;
  type: 'virus' | 'trojan' | 'worm' | 'ransomware' | 'spyware' | 'adware' | 'rootkit' | 'backdoor';
  severity: 'critical' | 'high' | 'medium' | 'low';
  filePath: string;
  fileSize: number;
  detectionDate: Date;
  status: 'quarantined' | 'active' | 'removed' | 'allowed';
  description: string;
}

const mockThreats: Threat[] = [
  {
    id: '1',
    name: 'Trojan.GenericKD.46589',
    type: 'trojan',
    severity: 'critical',
    filePath: 'C:\\Users\\Downloads\\crack.exe',
    fileSize: 245760,
    detectionDate: new Date(Date.now() - 3600000),
    status: 'quarantined',
    description: 'Generic trojan detected with suspicious behavior patterns'
  },
  {
    id: '2',
    name: 'Ransom.LockBit',
    type: 'ransomware',
    severity: 'critical',
    filePath: 'C:\\Temp\\update.exe',
    fileSize: 512000,
    detectionDate: new Date(Date.now() - 7200000),
    status: 'quarantined',
    description: 'LockBit ransomware variant detected'
  },
  {
    id: '3',
    name: 'Adware.BrowserMod',
    type: 'adware',
    severity: 'low',
    filePath: 'C:\\Program Files\\FreeApp\\helper.dll',
    fileSize: 102400,
    detectionDate: new Date(Date.now() - 86400000),
    status: 'removed',
    description: 'Browser modification adware'
  },
  {
    id: '4',
    name: 'PUP.Optional.InstallCore',
    type: 'adware',
    severity: 'medium',
    filePath: 'C:\\Users\\Downloads\\installer.exe',
    fileSize: 2048000,
    detectionDate: new Date(Date.now() - 172800000),
    status: 'allowed',
    description: 'Potentially unwanted program detected'
  },
  {
    id: '5',
    name: 'Spyware.KeyLogger',
    type: 'spyware',
    severity: 'high',
    filePath: 'C:\\Windows\\Temp\\svchost.exe',
    fileSize: 86016,
    detectionDate: new Date(Date.now() - 259200000),
    status: 'quarantined',
    description: 'Keylogger component detected in system directory'
  },
  {
    id: '6',
    name: 'Backdoor.Agent',
    type: 'backdoor',
    severity: 'critical',
    filePath: 'C:\\ProgramData\\Microsoft\\svchost.exe',
    fileSize: 163840,
    detectionDate: new Date(Date.now() - 43200000),
    status: 'quarantined',
    description: 'Remote access trojan providing unauthorized system access'
  }
];

export function ThreatList() {
  const [threats, setThreats] = useState<Threat[]>(mockThreats);
  const [filter, setFilter] = useState<'all' | 'quarantined' | 'active' | 'removed' | 'allowed'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'virus': return <Bug className="h-5 w-5" />;
      case 'trojan': return <Shield className="h-5 w-5" />;
      case 'worm': return <Network className="h-5 w-5" />;
      case 'ransomware': return <Lock className="h-5 w-5" />;
      case 'spyware': return <Eye className="h-5 w-5" />;
      case 'rootkit': return <AlertTriangle className="h-5 w-5" />;
      case 'backdoor': return <Shield className="h-5 w-5" />;
      default: return <Bug className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quarantined': return 'bg-purple-500/20 text-purple-400';
      case 'active': return 'bg-red-500/20 text-red-400';
      case 'removed': return 'bg-green-500/20 text-green-400';
      case 'allowed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const handleAction = (threatId: string, action: 'remove' | 'restore' | 'allow') => {
    setThreats(prev => prev.map(t => {
      if (t.id === threatId) {
        return {
          ...t,
          status: action === 'remove' ? 'removed' : 
                  action === 'restore' ? 'active' : 
                  action === 'allow' ? 'allowed' : t.status
        };
      }
      return t;
    }));

    toast.success(`Threat ${action === 'remove' ? 'removed' : action === 'restore' ? 'restored' : 'allowed'}`);
  };

  const filteredThreats = threats.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (severityFilter !== 'all' && t.severity !== severityFilter) return false;
    return true;
  });

  const stats = {
    total: threats.length,
    quarantined: threats.filter(t => t.status === 'quarantined').length,
    active: threats.filter(t => t.status === 'active').length,
    removed: threats.filter(t => t.status === 'removed').length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Bug className="h-5 w-5 text-slate-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-xs text-slate-400">Total Detected</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-400">{stats.quarantined}</p>
                <p className="text-xs text-slate-400">Quarantined</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.active}</p>
                <p className="text-xs text-slate-400">Active Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.removed}</p>
                <p className="text-xs text-slate-400">Removed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Threats List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Threat Vault
              </CardTitle>
              <CardDescription>
                View and manage detected threats
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="quarantined">Quarantined</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="removed">Removed</SelectItem>
                  <SelectItem value="allowed">Allowed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v as typeof severityFilter)}>
                <SelectTrigger className="w-32 bg-slate-700/50 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {filteredThreats.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-green-400 mb-4" />
                  <p className="text-slate-300">No threats match the selected filters</p>
                </div>
              ) : (
                filteredThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:border-slate-500/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${
                        threat.severity === 'critical' ? 'bg-red-500/20' :
                        threat.severity === 'high' ? 'bg-orange-500/20' :
                        threat.severity === 'medium' ? 'bg-yellow-500/20' :
                        'bg-blue-500/20'
                      }`}>
                        {getThreatIcon(threat.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{threat.name}</h3>
                          <Badge className={getSeverityColor(threat.severity)}>
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(threat.status)}>
                            {threat.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-2">{threat.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                          <span>Path: {threat.filePath}</span>
                          <span>Size: {(threat.fileSize / 1024).toFixed(1)} KB</span>
                          <span>Detected: {threat.detectionDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        {threat.status === 'quarantined' && (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(threat.id, 'remove')}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAction(threat.id, 'restore')}
                              className="border-slate-600"
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Restore
                            </Button>
                          </>
                        )}
                        {threat.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(threat.id, 'remove')}
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Quarantine
                          </Button>
                        )}
                        {threat.status === 'allowed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAction(threat.id, 'remove')}
                            className="border-slate-600"
                          >
                            <Lock className="h-4 w-4 mr-1" />
                            Quarantine
                          </Button>
                        )}
                        {threat.status === 'removed' && (
                          <Badge className="bg-green-500/20 text-green-400">
                            <Shield className="h-3 w-3 mr-1" />
                            Removed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default ThreatList;
