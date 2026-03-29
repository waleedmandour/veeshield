'use client';

import { useState } from 'react';
import { Lock, Trash2, RotateCcw, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface QuarantineItem {
  id: string;
  name: string;
  originalPath: string;
  threatType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  size: number;
  date: string;
  canRestore: boolean;
}

const mockQuarantineItems: QuarantineItem[] = [
  {
    id: 'q1',
    name: 'Trojan.GenericKD.46589.exe',
    originalPath: 'C:\\Users\\Downloads\\crack.exe',
    threatType: 'Trojan',
    severity: 'critical',
    size: 245760,
    date: '2024-03-14',
    canRestore: true
  },
  {
    id: 'q2',
    name: 'Ransom.LockBit.exe',
    originalPath: 'C:\\Temp\\update.exe',
    threatType: 'Ransomware',
    severity: 'critical',
    size: 512000,
    date: '2024-03-13',
    canRestore: true
  },
  {
    id: 'q3',
    name: 'Spyware.KeyLogger.dll',
    originalPath: 'C:\\Windows\\Temp\\svchost.exe',
    threatType: 'Spyware',
    severity: 'high',
    size: 86016,
    date: '2024-03-12',
    canRestore: true
  },
  {
    id: 'q4',
    name: 'Backdoor.Agent.exe',
    originalPath: 'C:\\ProgramData\\Microsoft\\svchost.exe',
    threatType: 'Backdoor',
    severity: 'critical',
    size: 163840,
    date: '2024-03-11',
    canRestore: false
  }
];

export function QuarantinePanel() {
  const [items, setItems] = useState<QuarantineItem[]>(mockQuarantineItems);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const selectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(i => i.id)));
    }
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedItems(prev => { const n = new Set(prev); n.delete(id); return n; });
    toast.success('Threat permanently deleted');
  };

  const handleRestore = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success('File restored to original location');
  };

  const handleDeleteSelected = () => {
    setItems(prev => prev.filter(i => !selectedItems.has(i.id)));
    toast.success(`${selectedItems.size} threats permanently deleted`);
    setSelectedItems(new Set());
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getThreatTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'ransomware': return 'text-red-400';
      case 'trojan': return 'text-orange-400';
      case 'spyware': return 'text-purple-400';
      case 'backdoor': return 'text-red-300';
      case 'worm': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = items.reduce((sum, i) => sum + i.size, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Lock className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{items.length}</p>
                <p className="text-xs text-slate-400">Quarantined Items</p>
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
                <p className="text-2xl font-bold text-red-400">{items.filter(i => i.severity === 'critical').length}</p>
                <p className="text-xs text-slate-400">Critical Threats</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-400">{formatBytes(totalSize)}</p>
                <p className="text-xs text-slate-400">Total Quarantine Size</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quarantine List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Quarantine Vault
              </CardTitle>
              <CardDescription>
                Safely isolated threats - restore or permanently delete
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {selectedItems.size === items.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedItems.size > 0 && (
                <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete ({selectedItems.size})
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto text-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Quarantine is Empty</h3>
              <p className="text-slate-400">No threats are currently quarantined. Your system is clean!</p>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      selectedItems.has(item.id)
                        ? 'bg-slate-700/50 border-emerald-500/50'
                        : 'bg-slate-700/30 border-slate-600/50 hover:border-slate-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          <Badge className={getSeverityColor(item.severity)}>
                            {item.severity.toUpperCase()}
                          </Badge>
                          <span className={`text-xs font-medium ${getThreatTypeColor(item.threatType)}`}>
                            {item.threatType}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1 truncate">{item.originalPath}</p>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>Size: {formatBytes(item.size)}</span>
                          <span>Quarantined: {item.date}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {item.canRestore && (
                          <Button size="sm" variant="outline" onClick={() => handleRestore(item.id)} className="border-slate-600">
                            <RotateCcw className="h-4 w-4 mr-1" />
                            Restore
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuarantinePanel;
