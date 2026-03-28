'use client';

import { 
  Shield, Activity, Lock, Clock, TrendingUp, 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ProtectionStatus } from './VeeshieldDashboard';

interface StatusCardsProps {
  protectionStatus: ProtectionStatus;
  setProtectionStatus: React.Dispatch<React.SetStateAction<ProtectionStatus>>;
}

export function StatusCards({ protectionStatus, setProtectionStatus }: StatusCardsProps) {
  const statusCards = [
    {
      title: 'Real-time Protection',
      description: 'Monitor files and activities for threats',
      icon: Shield,
      enabled: protectionStatus.realTimeProtection,
      onToggle: () => setProtectionStatus(prev => ({ 
        ...prev, 
        realTimeProtection: !prev.realTimeProtection 
      })),
      status: protectionStatus.realTimeProtection ? 'active' : 'disabled',
      color: protectionStatus.realTimeProtection ? 'text-green-400' : 'text-slate-400'
    },
    {
      title: 'Virus Definitions',
      description: 'Threat database version v2024.03.15',
      icon: Lock,
      enabled: true,
      status: 'up-to-date',
      color: 'text-green-400',
      extra: (
        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          <RefreshCw className="h-3 w-3 mr-1" />
          Update
        </Button>
      )
    },
    {
      title: 'Auto-update',
      description: 'Automatically update definitions',
      icon: Activity,
      enabled: protectionStatus.autoUpdate,
      onToggle: () => setProtectionStatus(prev => ({ 
        ...prev, 
        autoUpdate: !prev.autoUpdate 
      })),
      status: protectionStatus.autoUpdate ? 'enabled' : 'disabled',
      color: protectionStatus.autoUpdate ? 'text-green-400' : 'text-slate-400'
    },
    {
      title: 'Last Scan',
      description: protectionStatus.lastScan 
        ? `${Math.round((Date.now() - protectionStatus.lastScan.getTime()) / 3600000)} hours ago`
        : 'Never',
      icon: Clock,
      enabled: true,
      status: protectionStatus.lastScan ? 'completed' : 'pending',
      color: 'text-cyan-400'
    }
  ];

  const protectionScore = [
    { label: 'Signature Detection', score: 95, color: 'bg-green-500' },
    { label: 'Heuristic Analysis', score: 88, color: 'bg-emerald-500' },
    { label: 'Behavior Monitoring', score: 92, color: 'bg-cyan-500' },
    { label: 'Cloud Protection', score: 90, color: 'bg-blue-500' }
  ];

  const recentActivity = [
    { type: 'scan', message: 'Quick scan completed', time: '1 hour ago', status: 'success' },
    { type: 'threat', message: 'Trojan.GenericKD blocked', time: '2 hours ago', status: 'blocked' },
    { type: 'update', message: 'Definitions updated', time: '5 hours ago', status: 'success' },
    { type: 'clean', message: 'Cleaned 245 MB temp files', time: '1 day ago', status: 'success' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Protection Status Cards */}
      {statusCards.map((card, index) => (
        <Card key={index} className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <card.icon className={`h-5 w-5 ${card.color}`} />
              {card.status && (
                <Badge 
                  variant="outline" 
                  className={
                    card.status === 'active' || card.status === 'up-to-date' || card.status === 'enabled' || card.status === 'completed'
                      ? 'border-green-500/50 text-green-400'
                      : card.status === 'pending' || card.status === 'disabled'
                      ? 'border-slate-500/50 text-slate-400'
                      : 'border-slate-500/50 text-slate-400'
                  }
                >
                  {card.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-white">{card.title}</h3>
            <p className="text-sm text-slate-400 mt-1">{card.description}</p>
            {card.onToggle && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {card.enabled ? 'Enabled' : 'Disabled'}
                </span>
                <div 
                  onClick={card.onToggle}
                  className={`w-10 h-6 rounded-full cursor-pointer transition-colors ${
                    card.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform mt-1 ${
                    card.enabled ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
            )}
            {card.extra && <div className="mt-3">{card.extra}</div>}
          </CardContent>
        </Card>
      ))}

      {/* Protection Score */}
      <Card className="md:col-span-2 bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Protection Score
          </CardTitle>
          <CardDescription>Your overall security posture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {protectionScore.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">{item.label}</span>
                <span className="text-white font-medium">{item.score}%</span>
              </div>
              <Progress value={item.score} className="h-2" />
            </div>
          ))}
          <div className="pt-4 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Overall Score</span>
              <span className="text-2xl font-bold text-emerald-400">91%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="md:col-span-2 bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest security events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg">
                <div className={`p-1 rounded-full ${
                  activity.status === 'success' ? 'bg-green-500/20' :
                  activity.status === 'blocked' ? 'bg-red-500/20' :
                  'bg-slate-600/50'
                }`}>
                  {activity.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : activity.status === 'blocked' ? (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{activity.message}</p>
                  <p className="text-xs text-slate-400">{activity.time}</p>
                </div>
                <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatusCards;
