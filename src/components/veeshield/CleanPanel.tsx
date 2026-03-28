'use client';

import { useState, useCallback } from 'react';
import { Trash2, HardDrive, Loader2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface CleanTarget {
  id: string;
  name: string;
  description: string;
  path: string;
  category: string;
  riskLevel: string;
  enabled: boolean;
  size: number;
  fileCount: number;
}

export function CleanPanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [targets, setTargets] = useState<CleanTarget[]>([]);
  const [selectedTargets, setSelectedTargets] = useState<Set<string>>(new Set());
  const [deepClean, setDeepClean] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanResult, setCleanResult] = useState<{
    spaceFreed: number;
    spaceFreedFormatted: string;
    filesDeleted: number;
  } | null>(null);

  const scanTargets = useCallback(async () => {
    setIsScanning(true);
    setCleanResult(null);

    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'scan_targets' })
      });

      const data = await response.json();

      if (data.success) {
        setTargets(data.targets);
        const safeTargetIds = data.targets
          .filter((t: CleanTarget) => t.riskLevel === 'safe')
          .map((t: CleanTarget) => t.id);
        setSelectedTargets(new Set(safeTargetIds));
        toast.success(`Found ${data.targets.length} cleanable locations`);
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Failed to scan clean targets');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const startClean = useCallback(async () => {
    if (selectedTargets.size === 0) {
      toast.error('Please select at least one target to clean');
      return;
    }

    setIsCleaning(true);
    setCleanProgress(0);
    setCleanResult(null);

    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_clean',
          options: {
            targets: Array.from(selectedTargets),
            deepClean,
            secureDelete: false
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        for (let i = 0; i <= 100; i += 10) {
          setCleanProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setCleanResult({
          spaceFreed: data.summary.totalSpaceFreed,
          spaceFreedFormatted: data.summary.totalSpaceFreedFormatted,
          filesDeleted: data.summary.totalFilesDeleted
        });

        toast.success(`Cleaned ${data.summary.totalSpaceFreedFormatted}!`);
      }
    } catch (error) {
      console.error('Clean error:', error);
      toast.error('Failed to clean files');
    } finally {
      setIsCleaning(false);
    }
  }, [selectedTargets, deepClean]);

  const toggleTarget = (targetId: string) => {
    const newSelected = new Set(selectedTargets);
    if (newSelected.has(targetId)) {
      newSelected.delete(targetId);
    } else {
      newSelected.add(targetId);
    }
    setSelectedTargets(newSelected);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRiskColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'safe': return 'text-green-400';
      case 'low': return 'text-blue-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const totalSelectedSize = targets
    .filter(t => selectedTargets.has(t.id))
    .reduce((sum, t) => sum + t.size, 0);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                System Cleaner
              </CardTitle>
              <CardDescription>
                Free up disk space by removing temporary and unnecessary files
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="deep-clean"
                checked={deepClean}
                onCheckedChange={setDeepClean}
              />
              <Label htmlFor="deep-clean" className="text-sm text-slate-300">
                Deep Clean
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={scanTargets}
              disabled={isScanning || isCleaning}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Scan for Files
                </>
              )}
            </Button>
            
            {targets.length > 0 && (
              <Button
                onClick={startClean}
                disabled={isCleaning || selectedTargets.size === 0}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                {isCleaning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cleaning...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clean Selected ({formatBytes(totalSelectedSize)})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isCleaning && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">Cleaning in progress...</h3>
                <Progress value={cleanProgress} className="h-2 mt-2" />
              </div>
              <span className="text-lg font-medium text-white">{cleanProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {cleanResult && (
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-emerald-400" />
              <div>
                <h3 className="text-xl font-semibold text-white">Cleaning Complete!</h3>
                <p className="text-slate-300">
                  Freed <span className="font-bold text-emerald-400">{cleanResult.spaceFreedFormatted}</span> by deleting {cleanResult.filesDeleted.toLocaleString()} files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {targets.length > 0 && !isCleaning && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Cleanable Files</CardTitle>
            <Badge variant="outline" className="border-slate-600 w-fit">
              {selectedTargets.size} selected
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {targets.map(target => (
                  <div
                    key={target.id}
                    className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg hover:bg-slate-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={selectedTargets.has(target.id)}
                        onCheckedChange={() => toggleTarget(target.id)}
                      />
                      <div>
                        <p className="text-sm font-medium text-white">{target.name}</p>
                        <p className="text-xs text-slate-400">{target.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">{formatBytes(target.size)}</p>
                        <p className="text-xs text-slate-400">{target.fileCount.toLocaleString()} files</p>
                      </div>
                      <span className={`text-xs ${getRiskColor(target.riskLevel)}`}>
                        {target.riskLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default CleanPanel;
