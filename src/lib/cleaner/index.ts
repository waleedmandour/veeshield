// VeeShield Windows System Cleaner Module
// Implements deep cleaning of Windows temporary files, cache, and system junk

export interface CleanTarget {
  id: string;
  name: string;
  description: string;
  path: string;
  category: 'temp' | 'cache' | 'logs' | 'browser' | 'system' | 'updates';
  riskLevel: 'safe' | 'low' | 'medium' | 'high';
  enabled: boolean;
  size: number;
  fileCount: number;
}

export interface CleanResult {
  id: string;
  targetId: string;
  targetName: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  filesDeleted: number;
  spaceFreed: number;
  errors: string[];
  duration: number;
  timestamp: Date;
}

export interface CleanProgress {
  current: number;
  total: number;
  currentTarget: string;
  status: 'idle' | 'scanning' | 'cleaning' | 'complete' | 'error';
  totalSpaceFreed: number;
  totalFilesDeleted: number;
  elapsedTime: number;
}

export interface CleanOptions {
  targets: string[]; // Target IDs to clean
  deepClean: boolean;
  secureDelete: boolean;
  createRestorePoint: boolean;
  excludePaths: string[];
}

// Predefined clean targets for Windows 11
export const CLEAN_TARGETS: CleanTarget[] = [
  // Temporary Files
  {
    id: 'temp-user',
    name: 'User Temporary Files',
    description: 'Temporary files created by applications in user profile',
    path: '%TEMP%',
    category: 'temp',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'temp-windows',
    name: 'Windows Temporary Files',
    description: 'System temporary files in Windows folder',
    path: 'C:\\Windows\\Temp',
    category: 'temp',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'temp-prefetch',
    name: 'Prefetch Files',
    description: 'Application prefetch data for faster startup',
    path: 'C:\\Windows\\Prefetch',
    category: 'temp',
    riskLevel: 'low',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  
  // Cache Files
  {
    id: 'cache-thumbnail',
    name: 'Thumbnail Cache',
    description: 'Cached thumbnails for images and videos',
    path: '%LOCALAPPDATA%\\Microsoft\\Windows\\Explorer',
    category: 'cache',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'cache-icon',
    name: 'Icon Cache',
    description: 'Cached icons for files and applications',
    path: '%LOCALAPPDATA%\\IconCache.db',
    category: 'cache',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'cache-font',
    name: 'Font Cache',
    description: 'Cached font data for faster rendering',
    path: 'C:\\Windows\\ServiceProfiles\\LocalService\\AppData\\Local\\FontCache',
    category: 'cache',
    riskLevel: 'low',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'cache-dns',
    name: 'DNS Cache',
    description: 'Cached DNS entries (will flush DNS)',
    path: 'DNS_CACHE',
    category: 'cache',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  
  // Browser Cache
  {
    id: 'browser-chrome',
    name: 'Google Chrome Cache',
    description: 'Cache, cookies, and browsing data from Chrome',
    path: '%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\Cache',
    category: 'browser',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'browser-edge',
    name: 'Microsoft Edge Cache',
    description: 'Cache and browsing data from Edge',
    path: '%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\Cache',
    category: 'browser',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'browser-firefox',
    name: 'Firefox Cache',
    description: 'Cache and browsing data from Firefox',
    path: '%LOCALAPPDATA%\\Mozilla\\Firefox\\Profiles',
    category: 'browser',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  
  // Log Files
  {
    id: 'logs-windows',
    name: 'Windows Logs',
    description: 'System and application log files',
    path: 'C:\\Windows\\Logs',
    category: 'logs',
    riskLevel: 'low',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'logs-cbs',
    name: 'CBS Logs',
    description: 'Component-Based Servicing logs from Windows Update',
    path: 'C:\\Windows\\Logs\\CBS',
    category: 'logs',
    riskLevel: 'low',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'logs-dism',
    name: 'DISM Logs',
    description: 'Deployment Image Servicing and Management logs',
    path: 'C:\\Windows\\Logs\\DISM',
    category: 'logs',
    riskLevel: 'low',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  
  // System Files
  {
    id: 'system-recycle',
    name: 'Recycle Bin',
    description: 'Deleted files in Recycle Bin',
    path: 'RECYCLE_BIN',
    category: 'system',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'system-error-reports',
    name: 'Error Reports',
    description: 'Windows Error Reporting files',
    path: 'C:\\ProgramData\\Microsoft\\Windows\\WER',
    category: 'system',
    riskLevel: 'safe',
    enabled: true,
    size: 0,
    fileCount: 0
  },
  {
    id: 'system-minidump',
    name: 'Memory Dump Files',
    description: 'Crash dump files for debugging',
    path: 'C:\\Windows\\Minidump',
    category: 'system',
    riskLevel: 'low',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  
  // Windows Update
  {
    id: 'updates-cache',
    name: 'Windows Update Cache',
    description: 'Downloaded Windows Update files',
    path: 'C:\\Windows\\SoftwareDistribution\\Download',
    category: 'updates',
    riskLevel: 'medium',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'updates-old',
    name: 'Old Windows Installation',
    description: 'Windows.old folder from previous Windows version',
    path: 'C:\\Windows.old',
    category: 'updates',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'updates-backup',
    name: 'Windows Update Backup',
    description: 'Backup files created during Windows updates',
    path: 'C:\\Windows\\WinSxS\\Backup',
    category: 'updates',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  }
];

// Deep clean additional targets
export const DEEP_CLEAN_TARGETS: CleanTarget[] = [
  {
    id: 'deep-telemetry',
    name: 'Windows Telemetry',
    description: 'Telemetry and diagnostic data collected by Windows',
    path: 'C:\\ProgramData\\Microsoft\\Diagnosis',
    category: 'system',
    riskLevel: 'medium',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'deep-delivery-optimization',
    name: 'Delivery Optimization Cache',
    description: 'P2P update delivery cache files',
    path: 'C:\\Windows\\ServiceProfiles\\NetworkService\\AppData\\Local\\Microsoft\\Windows\\DeliveryOptimization',
    category: 'updates',
    riskLevel: 'safe',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'deep-usn-journal',
    name: 'USN Journal',
    description: 'NTFS change journal (can be very large)',
    path: 'USN_JOURNAL',
    category: 'system',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'deep-hibernation',
    name: 'Hibernation File',
    description: 'Hiberfil.sys used for hibernation',
    path: 'C:\\hiberfil.sys',
    category: 'system',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'deep-pagefile',
    name: 'Page File',
    description: 'Virtual memory pagefile.sys',
    path: 'C:\\pagefile.sys',
    category: 'system',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  },
  {
    id: 'deep-volume-shadow',
    name: 'Volume Shadow Copies',
    description: 'System restore points and shadow copies',
    path: 'SHADOW_COPIES',
    category: 'system',
    riskLevel: 'high',
    enabled: false,
    size: 0,
    fileCount: 0
  }
];

// Simulate scanning for clean targets
export async function scanCleanTargets(
  targets: CleanTarget[],
  onProgress?: (current: number, total: number, currentTarget: string) => void
): Promise<CleanTarget[]> {
  const results: CleanTarget[] = [];
  
  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    
    if (onProgress) {
      onProgress(i + 1, targets.length, target.name);
    }
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
    
    // Simulate random sizes and file counts
    const simulatedTarget: CleanTarget = {
      ...target,
      size: Math.floor(Math.random() * 500 * 1024 * 1024), // Up to 500MB
      fileCount: Math.floor(Math.random() * 5000)
    };
    
    results.push(simulatedTarget);
  }
  
  return results;
}

// Perform cleaning
export async function performClean(
  options: CleanOptions,
  onProgress?: (progress: CleanProgress) => void
): Promise<CleanResult[]> {
  const results: CleanResult[] = [];
  const startTime = Date.now();
  let totalSpaceFreed = 0;
  let totalFilesDeleted = 0;
  
  // Get targets to clean
  const allTargets = options.deepClean 
    ? [...CLEAN_TARGETS, ...DEEP_CLEAN_TARGETS]
    : CLEAN_TARGETS;
  const targetsToClean = allTargets.filter(t => 
    options.targets.includes(t.id) || t.enabled
  );
  
  for (let i = 0; i < targetsToClean.length; i++) {
    const target = targetsToClean[i];
    const targetStartTime = Date.now();
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total: targetsToClean.length,
        currentTarget: target.name,
        status: 'cleaning',
        totalSpaceFreed,
        totalFilesDeleted,
        elapsedTime: Date.now() - startTime
      });
    }
    
    // Simulate cleaning delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Simulate cleaning result
    const filesDeleted = Math.floor(Math.random() * target.fileCount * 0.9);
    const spaceFreed = Math.floor(Math.random() * target.size * 0.85);
    
    const result: CleanResult = {
      id: `clean-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      targetId: target.id,
      targetName: target.name,
      status: filesDeleted > 0 ? 'success' : 'partial',
      filesDeleted,
      spaceFreed,
      errors: Math.random() > 0.9 ? ['Permission denied for some files'] : [],
      duration: Date.now() - targetStartTime,
      timestamp: new Date()
    };
    
    totalSpaceFreed += spaceFreed;
    totalFilesDeleted += filesDeleted;
    
    results.push(result);
  }
  
  if (onProgress) {
    onProgress({
      current: targetsToClean.length,
      total: targetsToClean.length,
      currentTarget: 'Complete',
      status: 'complete',
      totalSpaceFreed,
      totalFilesDeleted,
      elapsedTime: Date.now() - startTime
    });
  }
  
  return results;
}

// Format bytes to human readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get total cleanable space
export function calculateTotalCleanableSpace(targets: CleanTarget[]): {
  totalSize: number;
  totalFiles: number;
  safeSize: number;
} {
  const safeTargets = targets.filter(t => t.riskLevel === 'safe');
  
  return {
    totalSize: targets.reduce((sum, t) => sum + t.size, 0),
    totalFiles: targets.reduce((sum, t) => sum + t.fileCount, 0),
    safeSize: safeTargets.reduce((sum, t) => sum + t.size, 0)
  };
}

// Get default quick clean targets
export function getQuickCleanTargets(): CleanTarget[] {
  return CLEAN_TARGETS.filter(t => 
    t.riskLevel === 'safe' && t.enabled
  );
}

// Get all clean targets with categories
export function getCleanTargetsByCategory(): Record<string, CleanTarget[]> {
  const categories: Record<string, CleanTarget[]> = {
    temp: [],
    cache: [],
    logs: [],
    browser: [],
    system: [],
    updates: []
  };
  
  for (const target of CLEAN_TARGETS) {
    categories[target.category].push(target);
  }
  
  return categories;
}

export default CLEAN_TARGETS;
