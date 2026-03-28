'use client';

import { useState, useCallback } from 'react';
import { 
  Shield, ShieldCheck, ShieldAlert, ShieldX, 
  Bug, Lock, Trash2, Volume2, Settings, 
  Activity, AlertTriangle, CheckCircle2, XCircle,
  FileSearch, HardDrive, Clock, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// Import components
import { VoiceAssistant } from '@/components/veeshield/VoiceAssistant';
import { ScanPanel } from '@/components/veeshield/ScanPanel';
import { CleanPanel } from '@/components/veeshield/CleanPanel';
import { ThreatList } from '@/components/veeshield/ThreatList';
import { StatusCards } from '@/components/veeshield/StatusCards';

export interface ProtectionStatus {
  status: 'protected' | 'at_risk' | 'scanning' | 'cleaning';
  lastScan: Date | null;
  threatsBlocked: number;
  filesScanned: number;
  realTimeProtection: boolean;
  autoUpdate: boolean;
}

export function VeeshieldDashboard() {
  const [protectionStatus, setProtectionStatus] = useState<ProtectionStatus>({
    status: 'protected',
    lastScan: new Date(Date.now() - 3600000),
    threatsBlocked: 12,
    filesScanned: 15420,
    realTimeProtection: true,
    autoUpdate: true
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);

  const handleQuickScan = useCallback(async () => {
    setProtectionStatus(prev => ({ ...prev, status: 'scanning' }));
    toast.info('Starting quick scan...');
    
    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_system_scan', scanType: 'quick' })
      });
      
      const data = await response.json();
      
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
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'quick_clean' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Cleaned ${data.summary.totalSpaceFreedFormatted}!`);
        setProtectionStatus(prev => ({ ...prev, status: 'protected' }));
      }
    } catch {
      toast.error('Cleanup failed. Please try again.');
      setProtectionStatus(prev => ({ ...prev, status: 'protected' }));
    }
  }, []);

  const handleVoiceCommand = useCallback((action: string, data?: Record<string, unknown>) => {
    switch (action) {
      case 'quick_scan':
        handleQuickScan();
        break;
      case 'full_scan':
        toast.info('Starting full system scan...');
        fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start_system_scan', scanType: 'full' })
        }).then(() => toast.success('Full scan completed'));
        break;
      case 'start_clean':
        handleQuickClean();
        break;
      case 'show_threats':
        setActiveTab('threats');
        break;
      case 'show_history':
        setActiveTab('history');
        break;
      case 'open_settings':
        setActiveTab('settings');
        break;
      case 'show_help':
        toast.info('Say "scan my computer", "clean up files", or "check status"');
        break;
    }
  }, [handleQuickScan, handleQuickClean]);

  const getStatusIcon = () => {
    switch (protectionStatus.status) {
      case 'protected':
        return <ShieldCheck className="h-16 w-16 text-green-500" />;
      case 'at_risk':
        return <ShieldAlert className="h-16 w-16 text-yellow-500" />;
      case 'scanning':
        return <FileSearch className="h-16 w-16 text-blue-500 animate-pulse" />;
      case 'cleaning':
        return <Trash2 className="h-16 w-16 text-purple-500 animate-pulse" />;
      default:
        return <Shield className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (protectionStatus.status) {
      case 'protected':
        return { title: 'Protected', description: 'Your system is secure', color: 'text-green-500' };
      case 'at_risk':
        return { title: 'At Risk', description: 'Action recommended', color: 'text-yellow-500' };
      case 'scanning':
        return { title: 'Scanning', description: 'Checking for threats...', color: 'text-blue-500' };
      case 'cleaning':
        return { title: 'Cleaning', description: 'Removing junk files...', color: 'text-purple-500' };
      default:
        return { title: 'Unknown', description: 'Status unavailable', color: 'text-gray-500' };
    }
  };

  const statusInfo = getStatusText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Shield className="h-10 w-10 text-emerald-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  VeeShield
                </h1>
                <p className="text-xs text-slate-400">AI-Powered Security Suite</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVoiceAssistantOpen(!isVoiceAssistantOpen)}
                className="relative text-slate-300 hover:text-white hover:bg-slate-700"
              >
                <Volume2 className="h-5 w-5" />
                {isVoiceAssistantOpen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                )}
              </Button>
              <Badge 
                variant="outline" 
                className="border-emerald-500/50 text-emerald-400"
              >
                v1.0.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Voice Assistant Overlay */}
      {isVoiceAssistantOpen && (
        <VoiceAssistant
          onCommand={handleVoiceCommand}
          onClose={() => setIsVoiceAssistantOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700/50">
            <TabsTrigger 
              value="dashboard" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <Shield className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="scan" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <Bug className="h-4 w-4 mr-2" />
              Scan
            </TabsTrigger>
            <TabsTrigger 
              value="clean" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean
            </TabsTrigger>
            <TabsTrigger 
              value="threats" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Threats
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-emerald-500/20 data-[state=active]:text-emerald-400"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Status Hero */}
            <Card className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-slate-700/50 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-shrink-0">
                    {getStatusIcon()}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className={`text-3xl font-bold ${statusInfo.color}`}>
                      {statusInfo.title}
                    </h2>
                    <p className="text-slate-400 mt-1">{statusInfo.description}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
                      <Button 
                        onClick={handleQuickScan}
                        disabled={protectionStatus.status === 'scanning'}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      >
                        <FileSearch className="h-4 w-4 mr-2" />
                        Quick Scan
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleQuickClean}
                        disabled={protectionStatus.status === 'cleaning'}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Quick Clean
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setIsVoiceAssistantOpen(true)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Volume2 className="h-4 w-4 mr-2" />
                        Hey Vee
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-emerald-400">{protectionStatus.threatsBlocked}</p>
                      <p className="text-xs text-slate-400">Threats Blocked</p>
                    </div>
                    <div className="text-center p-4 bg-slate-700/30 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-400">{protectionStatus.filesScanned.toLocaleString()}</p>
                      <p className="text-xs text-slate-400">Files Scanned</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Cards */}
            <StatusCards protectionStatus={protectionStatus} setProtectionStatus={setProtectionStatus} />
          </TabsContent>

          {/* Scan Tab */}
          <TabsContent value="scan">
            <ScanPanel />
          </TabsContent>

          {/* Clean Tab */}
          <TabsContent value="clean">
            <CleanPanel />
          </TabsContent>

          {/* Threats Tab */}
          <TabsContent value="threats">
            <ThreatList />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Configure your protection preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Protection Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Protection</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Real-time Protection</Label>
                      <p className="text-sm text-slate-400">
                        Monitor files and activities in real-time
                      </p>
                    </div>
                    <Switch 
                      checked={protectionStatus.realTimeProtection}
                      onCheckedChange={(checked) => 
                        setProtectionStatus(prev => ({ ...prev, realTimeProtection: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Auto-update Definitions</Label>
                      <p className="text-sm text-slate-400">
                        Automatically download the latest threat definitions
                      </p>
                    </div>
                    <Switch 
                      checked={protectionStatus.autoUpdate}
                      onCheckedChange={(checked) => 
                        setProtectionStatus(prev => ({ ...prev, autoUpdate: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Cloud-assisted Protection</Label>
                      <p className="text-sm text-slate-400">
                        Use cloud intelligence for enhanced detection
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">PUA Protection</Label>
                      <p className="text-sm text-slate-400">
                        Block potentially unwanted applications
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Voice Assistant Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Voice Assistant</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Enable "Hey Vee"</Label>
                      <p className="text-sm text-slate-400">
                        Activate voice assistant with wake word
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Voice Feedback</Label>
                      <p className="text-sm text-slate-400">
                        Vee will respond with spoken feedback
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Separator className="bg-slate-700" />

                {/* Schedule Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Scheduled Scans</h3>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Automatic Weekly Scan</Label>
                      <p className="text-sm text-slate-400">
                        Run a full scan every Sunday at 2:00 AM
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-white">Automatic Cleanup</Label>
                      <p className="text-sm text-slate-400">
                        Clean temporary files every week
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 bg-slate-900/80 mt-auto">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>VeeShield - AI-Powered Security</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Definitions: v2024.03.15</span>
              <span>•</span>
              <span>Engine: v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default VeeshieldDashboard;
