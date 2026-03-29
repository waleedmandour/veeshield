'use client';

import { useState, useCallback } from 'react';
import { 
  Bug, FileSearch, Shield, Loader2, 
  AlertTriangle, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface ScanResult {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  status: 'clean' | 'suspicious' | 'infected' | 'error';
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threats: Array<{
    name: string;
    type: string;
    severity: string;
  }>;
}

export function ScanPanel() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanType, setScanType] = useState<'quick' | 'full' | 'custom'>('quick');
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    scanned: 0,
    threats: 0,
    clean: 0
  });

  const startScan = useCallback(async (type: 'quick' | 'full' | 'custom') => {
    setIsScanning(true);
    setScanType(type);
    setProgress(0);
    setResults([]);
    setScanStats({ total: 0, scanned: 0, threats: 0, clean: 0 });

    try {
      const { startSystemScan } = await import('@/lib/services/scan-service');
      const data = await startSystemScan(type);

      if (data.success) {
        // Simulate progress updates
        const total = data.results.length;
        let current = 0;

        for (const result of data.results) {
          current++;
          setProgress(Math.round((current / total) * 100));
          setCurrentFile(result.fileName);
          setResults(prev => [...prev, result]);
          
          setScanStats({
            total,
            scanned: current,
            threats: data.results.slice(0, current).filter((r: ScanResult) => r.status !== 'clean').length,
            clean: data.results.slice(0, current).filter((r: ScanResult) => r.status === 'clean').length
          });

          await new Promise(resolve => setTimeout(resolve, 50));
        }

        toast.success(
          `Scan complete! ${data.summary.threatsFound} threats found in ${total} files`
        );
      }
    } catch (error) {
      console.error('Scan error:', error);
      toast.error('Scan failed. Please try again.');
    } finally {
      setIsScanning(false);
      setCurrentFile('');
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'clean':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'suspicious':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'infected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      safe: { bg: 'bg-green-500/20', text: 'text-green-400' },
      low: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      medium: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      high: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      critical: { bg: 'bg-red-500/20', text: 'text-red-400' }
    };
    const variant = variants[riskLevel] || variants.safe;
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        {riskLevel.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Scan Options */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Malware Scanner
          </CardTitle>
          <CardDescription>
            Scan your system for viruses, trojans, ransomware, and other threats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-700/30 border-slate-600/50 cursor-pointer hover:border-emerald-500/50 transition-colors"
                  onClick={() => !isScanning && startScan('quick')}>
              <CardContent className="p-6 text-center">
                <FileSearch className="h-12 w-12 mx-auto mb-4 text-emerald-400" />
                <h3 className="font-semibold text-white mb-2">Quick Scan</h3>
                <p className="text-sm text-slate-400">
                  Fast scan of critical areas (~2 minutes)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600/50 cursor-pointer hover:border-cyan-500/50 transition-colors"
                  onClick={() => !isScanning && startScan('full')}>
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-cyan-400" />
                <h3 className="font-semibold text-white mb-2">Full Scan</h3>
                <p className="text-sm text-slate-400">
                  Complete system scan (~15 minutes)
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700/30 border-slate-600/50 cursor-pointer hover:border-purple-500/50 transition-colors"
                  onClick={() => !isScanning && startScan('custom')}>
              <CardContent className="p-6 text-center">
                <Bug className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                <h3 className="font-semibold text-white mb-2">Custom Scan</h3>
                <p className="text-sm text-slate-400">
                  Select specific folders or drives
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Scan Progress */}
      {(isScanning || results.length > 0) && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                {isScanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Scan Complete
                  </>
                )}
              </CardTitle>
              <Badge variant="outline" className="border-slate-600">
                {scanType.toUpperCase()} SCAN
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            {isScanning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                {currentFile && (
                  <p className="text-sm text-slate-400 truncate">
                    Scanning: {currentFile}
                  </p>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{scanStats.total}</p>
                <p className="text-xs text-slate-400">Total Files</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-cyan-400">{scanStats.scanned}</p>
                <p className="text-xs text-slate-400">Scanned</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{scanStats.clean}</p>
                <p className="text-xs text-slate-400">Clean</p>
              </div>
              <div className="bg-slate-700/30 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">{scanStats.threats}</p>
                <p className="text-xs text-slate-400">Threats</p>
              </div>
            </div>

            {/* Results List */}
            {results.length > 0 && (
              <Tabs defaultValue="all" className="mt-4">
                <TabsList className="bg-slate-700/30">
                  <TabsTrigger value="all">All ({results.length})</TabsTrigger>
                  <TabsTrigger value="threats">Threats ({scanStats.threats})</TabsTrigger>
                  <TabsTrigger value="clean">Clean ({scanStats.clean})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {results.map((result) => (
                        <div
                          key={result.id}
                          className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
                        >
                          {getStatusIcon(result.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {result.fileName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {result.filePath}
                            </p>
                          </div>
                          {getRiskBadge(result.riskLevel)}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="threats" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {results
                        .filter(r => r.status !== 'clean')
                        .map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                          >
                            {getStatusIcon(result.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {result.fileName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {result.filePath}
                              </p>
                              {result.threats.length > 0 && (
                                <p className="text-xs text-red-400 mt-1">
                                  {result.threats.map(t => t.name).join(', ')}
                                </p>
                              )}
                            </div>
                            {getRiskBadge(result.riskLevel)}
                            <Button size="sm" variant="destructive" className="flex-shrink-0">
                              Quarantine
                            </Button>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="clean" className="mt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {results
                        .filter(r => r.status === 'clean')
                        .map((result) => (
                          <div
                            key={result.id}
                            className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg"
                          >
                            {getStatusIcon(result.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {result.fileName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {result.filePath}
                              </p>
                            </div>
                            <Badge className="bg-green-500/20 text-green-400">
                              SAFE
                            </Badge>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ScanPanel;
