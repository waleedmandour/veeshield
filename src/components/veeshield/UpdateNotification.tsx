'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Download, RefreshCw, CheckCircle2, AlertCircle, ArrowDownCircle,
  Loader2, X, Rocket, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

// ─── Types ──────────────────────────────────────────────────────────────────────────
// These match the payloads sent from electron/main.js via IPC.

interface UpdateInfo {
  version: string;
  currentVersion: string;
  releaseDate: string;
  releaseNotes: string;
}

interface DownloadProgress {
  percent: number;
  transferredMB: string;
  totalMB: string;
  speedKBps: number;
}

type UpdateState =
  | 'idle'           // no update check has happened yet
  | 'checking'       // currently checking for updates
  | 'up-to-date'     // checked, already on latest
  | 'available'      // update found, waiting for user
  | 'downloading'    // update is being downloaded in background
  | 'downloaded'     // update downloaded, ready to install
  | 'error';         // something went wrong

// ─── Hook ────────────────────────────────────────────────────────────────────────────
// Encapsulates all auto-update logic so the dashboard stays clean.

export function useAutoUpdate() {
  const [state, setState] = useState<UpdateState>('idle');
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentVersion, setCurrentVersion] = useState('0.0.0');
  const [dismissed, setDismissed] = useState(false);

  const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;

  // Get the current app version on mount
  useEffect(() => {
    if (!api) return;
    api.getAppVersion().then((v: string) => setCurrentVersion(v));
  }, [api]);

  // ── Register all event listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!api) return;

    const unsubs: Array<() => void> = [];

    // An update IS available — new version found on GitHub
    unsubs.push(api.onUpdateAvailable((data: UpdateInfo) => {
      setUpdateInfo(data);
      setState('available');
      setDismissed(false);
      setError(null);
      toast.info(`VeeShield v${data.version} is available`, {
        description: 'You can update now or on next quit.',
        duration: 6000,
      });
    }));

    // Already up-to-date
    unsubs.push(api.onUpdateNotAvailable((data: { version: string }) => {
      setState('up-to-date');
      setUpdateInfo(null);
      setError(null);
    }));

    // Download progress (fired repeatedly during download)
    unsubs.push(api.onUpdateProgress((data: DownloadProgress) => {
      setState('downloading');
      setProgress(data);
    }));

    // Download complete — ready to install
    unsubs.push(api.onUpdateDownloaded((data: UpdateInfo) => {
      setUpdateInfo(data);
      setState('downloaded');
      setProgress(null);
      toast.success(`VeeShield v${data.version} downloaded!`, {
        description: 'Restart to apply the update.',
        duration: 8000,
      });
    }));

    // Error
    unsubs.push(api.onUpdateError((data: { message: string; code: string }) => {
      setState('error');
      setError(data.message);
    }));

    return () => unsubs.forEach(fn => fn());
  }, [api]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const checkNow = useCallback(async () => {
    if (!api) return;
    setState('checking');
    setError(null);
    try {
      const result = await api.checkForUpdates();
      if (result.updateAvailable) {
        setUpdateInfo(result.updateInfo);
        setState('available');
      } else {
        setState('up-to-date');
        toast.success('You\'re on the latest version!');
      }
    } catch (err: any) {
      setState('error');
      setError(err.message || 'Update check failed');
    }
  }, [api]);

  const downloadAndInstall = useCallback(async () => {
    if (!api) return;
    setState('downloading');
    setProgress(null);
    try {
      await api.downloadAndInstall();
      // The download-progress and update-downloaded events will handle state
    } catch (err: any) {
      setState('error');
      setError(err.message || 'Download failed');
    }
  }, [api]);

  const quitAndInstall = useCallback(() => {
    if (!api) return;
    api.quitAndInstall();
  }, [api]);

  const dismiss = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    state,
    updateInfo,
    progress,
    error,
    currentVersion,
    dismissed,
    checkNow,
    downloadAndInstall,
    quitAndInstall,
    dismiss,
  };
}

// ─── Component ───────────────────────────────────────────────────────────────────────

export function UpdateNotification() {
  const {
    state, updateInfo, progress, error, currentVersion,
    dismissed, checkNow, downloadAndInstall, quitAndInstall, dismiss,
  } = useAutoUpdate();

  // Don't render anything if:
  // - no electron API (web preview)
  // - up-to-date and user hasn't interacted
  // - idle (no check yet)
  // - user dismissed a non-critical state
  const isHidden =
    state === 'idle' ||
    state === 'up-to-date' ||
    (dismissed && (state === 'available' || state === 'downloaded')) ||
    (!updateInfo && state === 'error');

  if (isHidden) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[60] animate-in slide-in-from-bottom-5 duration-300">
      <Card className="bg-slate-900/95 border-slate-700/70 backdrop-blur-xl shadow-2xl max-w-lg mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${
              state === 'downloaded' ? 'bg-emerald-500/20' :
              state === 'downloading' ? 'bg-blue-500/20' :
              state === 'error' ? 'bg-red-500/20' :
              state === 'checking' ? 'bg-cyan-500/20' :
              'bg-amber-500/20'
            }`}>
              {state === 'downloaded' && <Rocket className="h-4 w-4 text-emerald-400" />}
              {state === 'downloading' && <Download className="h-4 w-4 text-blue-400 animate-pulse" />}
              {state === 'error' && <AlertCircle className="h-4 w-4 text-red-400" />}
              {state === 'checking' && <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />}
              {state === 'available' && <ArrowDownCircle className="h-4 w-4 text-amber-400" />}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {state === 'checking' && 'Checking for updates...'}
                {state === 'available' && `Update Available: v${updateInfo?.version}`}
                {state === 'downloading' && 'Downloading Update...'}
                {state === 'downloaded' && 'Update Ready to Install'}
                {state === 'error' && 'Update Error'}
              </p>
              {state !== 'checking' && updateInfo && (
                <p className="text-xs text-slate-400">
                  v{currentVersion} → v{updateInfo.version}
                  {updateInfo.releaseDate && ` · ${new Date(updateInfo.releaseDate).toLocaleDateString()}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {state === 'available' && (
              <Badge className="bg-amber-500/20 text-amber-400 text-xs">NEW</Badge>
            )}
            {state === 'downloaded' && (
              <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">READY</Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={dismiss}
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ── Download Progress ── */}
        {state === 'downloading' && progress && (
          <div className="px-4 pt-3 pb-1">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400">
                {progress.transferredMB} / {progress.totalMB} MB
              </span>
              <span className="text-white font-medium">{progress.percent}%</span>
            </div>
            <Progress value={progress.percent} className="h-1.5" />
            <p className="text-xs text-slate-500 mt-1">
              {progress.speedKBps > 1024
                ? `${(progress.speedKBps / 1024).toFixed(1)} MB/s`
                : `${progress.speedKBps} KB/s`}
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {state === 'error' && (
          <div className="px-4 py-2">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* ── Release Notes (collapsed) ── */}
        {updateInfo?.releaseNotes && (state === 'available' || state === 'downloaded') && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-slate-300 mb-1">Release Notes:</p>
            <div className="max-h-24 overflow-y-auto rounded-md bg-slate-800/60 p-2">
              <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">
                {updateInfo.releaseNotes}
              </pre>
            </div>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {state === 'available' && 'VeeShield can download and install silently in the background.'}
            {state === 'downloaded' && 'Close VeeShield to apply the update, or restart now.'}
            {state === 'checking' && 'Connecting to update server...'}
            {state === 'error' && 'Failed to check for updates. You can retry.'}
          </p>
          <div className="flex gap-2">
            {(state === 'available' || state === 'error') && (
              <Button
                size="sm"
                variant="outline"
                onClick={checkNow}
                disabled={state === 'checking'}
                className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
              >
                {state === 'checking' ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                {state === 'error' ? 'Retry' : 'Download Update'}
              </Button>
            )}
            {state === 'downloaded' && (
              <Button
                size="sm"
                onClick={quitAndInstall}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
              >
                <Rocket className="h-3 w-3 mr-1" />
                Restart Now
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default UpdateNotification;
