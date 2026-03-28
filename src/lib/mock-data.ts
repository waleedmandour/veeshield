import type { 
  Threat, 
  NetworkActivity, 
  ProcessInfo, 
  CleanupItem, 
  ProtectionEvent,
  QuarantineItem,
  ScanResult 
} from './types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Mock Threats Database
export const mockThreats: Threat[] = [
  {
    id: generateId(),
    name: 'Trojan.GenericKD.47832',
    type: 'trojan',
    severity: 'critical',
    path: 'C:\\Users\\Admin\\Downloads\\crack.exe',
    size: 2457600,
    detectedAt: new Date(Date.now() - 30 * 60 * 1000),
    status: 'active',
    description: 'A trojan horse that can download additional malware and steal sensitive information.',
  },
  {
    id: generateId(),
    name: 'PUP.Optional.BundleInstaller',
    type: 'pup',
    severity: 'low',
    path: 'C:\\Program Files\\FreeApp\\installer.exe',
    size: 1048576,
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: 'quarantined',
    description: 'Potentially unwanted program that bundles additional software.',
  },
  {
    id: generateId(),
    name: 'Adware.BrowserMod',
    type: 'adware',
    severity: 'medium',
    path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\adware.dll',
    size: 524288,
    detectedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: 'removed',
    description: 'Adware that injects advertisements into web browsers.',
  },
  {
    id: generateId(),
    name: 'Ransom.LockBit',
    type: 'ransomware',
    severity: 'critical',
    path: 'C:\\Windows\\Temp\\malicious.exe',
    size: 1572864,
    detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'removed',
    description: 'Ransomware that encrypts files and demands payment.',
  },
  {
    id: generateId(),
    name: 'Spyware.KeyLogger',
    type: 'spyware',
    severity: 'high',
    path: 'C:\\Users\\Admin\\AppData\\Roaming\\keylog.sys',
    size: 262144,
    detectedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    status: 'quarantined',
    description: 'Keylogger that records keystrokes to steal passwords.',
  },
];

// Mock Network Activity
export const mockNetworkActivity: NetworkActivity[] = [
  {
    id: generateId(),
    process: 'chrome.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54321',
    remoteAddress: '142.250.185.46:443',
    bytes: 1572864,
    timestamp: new Date(Date.now() - 10 * 1000),
    suspicious: false,
  },
  {
    id: generateId(),
    process: 'svchost.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:49152',
    remoteAddress: '13.107.4.50:443',
    bytes: 262144,
    timestamp: new Date(Date.now() - 30 * 1000),
    suspicious: false,
  },
  {
    id: generateId(),
    process: 'unknown.exe',
    direction: 'outbound',
    protocol: 'TCP',
    localAddress: '192.168.1.100:54322',
    remoteAddress: '185.220.101.45:8443',
    bytes: 524288,
    timestamp: new Date(Date.now() - 60 * 1000),
    suspicious: true,
  },
  {
    id: generateId(),
    process: 'discord.exe',
    direction: 'outbound',
    protocol: 'HTTPS',
    localAddress: '192.168.1.100:54323',
    remoteAddress: '162.159.128.233:443',
    bytes: 3145728,
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    suspicious: false,
  },
  {
    id: generateId(),
    process: 'explorer.exe',
    direction: 'inbound',
    protocol: 'TCP',
    localAddress: '192.168.1.100:445',
    remoteAddress: '192.168.1.50:49153',
    bytes: 65536,
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    suspicious: false,
  },
];

// Mock Processes
export const mockProcesses: ProcessInfo[] = [
  { pid: 4, name: 'System', cpu: 0.1, memory: 0.1, path: 'C:\\Windows\\System32\\ntoskrnl.exe', suspicious: false, networkActivity: false },
  { pid: 1234, name: 'chrome.exe', cpu: 5.2, memory: 12.5, path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', suspicious: false, networkActivity: true },
  { pid: 2345, name: 'veeshield.exe', cpu: 1.5, memory: 3.2, path: 'C:\\Program Files\\VeeShield\\veeshield.exe', suspicious: false, networkActivity: true },
  { pid: 3456, name: 'explorer.exe', cpu: 0.8, memory: 2.1, path: 'C:\\Windows\\explorer.exe', suspicious: false, networkActivity: true },
  { pid: 4567, name: 'svchost.exe', cpu: 0.3, memory: 1.5, path: 'C:\\Windows\\System32\\svchost.exe', suspicious: false, networkActivity: true },
  { pid: 5678, name: 'discord.exe', cpu: 2.1, memory: 8.4, path: 'C:\\Users\\Admin\\AppData\\Local\\Discord\\app-1.0.9027\\discord.exe', suspicious: false, networkActivity: true },
  { pid: 6789, name: 'suspicious.exe', cpu: 45.2, memory: 0.5, path: 'C:\\Users\\Admin\\AppData\\Local\\Temp\\suspicious.exe', suspicious: true, networkActivity: true },
  { pid: 7890, name: 'spoolsv.exe', cpu: 0.1, memory: 0.3, path: 'C:\\Windows\\System32\\spoolsv.exe', suspicious: false, networkActivity: false },
  { pid: 8901, name: 'code.exe', cpu: 3.5, memory: 6.8, path: 'C:\\Users\\Admin\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', suspicious: false, networkActivity: true },
  { pid: 9012, name: 'SearchIndexer.exe', cpu: 0.5, memory: 1.2, path: 'C:\\Windows\\System32\\SearchIndexer.exe', suspicious: false, networkActivity: false },
];

// Mock Cleanup Items
export const mockCleanupItems: CleanupItem[] = [
  {
    id: generateId(),
    name: 'Windows Temporary Files',
    description: 'Temporary files created by Windows and applications',
    category: 'temp',
    size: 1572864000, // ~1.5 GB
    fileCount: 2456,
    selected: true,
    path: 'C:\\Windows\\Temp',
  },
  {
    id: generateId(),
    name: 'User Temporary Files',
    description: 'Temporary files in user profile',
    category: 'temp',
    size: 524288000, // ~500 MB
    fileCount: 1234,
    selected: true,
    path: 'C:\\Users\\Admin\\AppData\\Local\\Temp',
  },
  {
    id: generateId(),
    name: 'Browser Cache (Chrome)',
    description: 'Cached images and files from Google Chrome',
    category: 'cache',
    size: 314572800, // ~300 MB
    fileCount: 5678,
    selected: true,
    path: 'C:\\Users\\Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache',
  },
  {
    id: generateId(),
    name: 'Browser Cache (Edge)',
    description: 'Cached images and files from Microsoft Edge',
    category: 'cache',
    size: 209715200, // ~200 MB
    fileCount: 3456,
    selected: false,
    path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Edge\\User Data\\Default\\Cache',
  },
  {
    id: generateId(),
    name: 'Windows Update Cleanup',
    description: 'Old Windows Update files that are no longer needed',
    category: 'update',
    size: 2147483648, // ~2 GB
    fileCount: 156,
    selected: true,
    path: 'C:\\Windows\\SoftwareDistribution\\Download',
  },
  {
    id: generateId(),
    name: 'System Logs',
    description: 'Windows system and application logs',
    category: 'logs',
    size: 104857600, // ~100 MB
    fileCount: 234,
    selected: false,
    path: 'C:\\Windows\\Logs',
  },
  {
    id: generateId(),
    name: 'Recycle Bin',
    description: 'Deleted files in Recycle Bin',
    category: 'recycle',
    size: 5242880000, // ~5 GB
    fileCount: 89,
    selected: false,
    path: 'C:\\$Recycle.Bin',
  },
  {
    id: generateId(),
    name: 'Thumbnail Cache',
    description: 'Cached thumbnails for images and videos',
    category: 'cache',
    size: 52428800, // ~50 MB
    fileCount: 123,
    selected: true,
    path: 'C:\\Users\\Admin\\AppData\\Local\\Microsoft\\Windows\\Explorer',
  },
];

// Mock Protection Events
export const mockProtectionEvents: ProtectionEvent[] = [
  {
    id: generateId(),
    type: 'threat_blocked',
    title: 'Trojan Blocked',
    description: 'Trojan.GenericKD.47832 was blocked from executing',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    severity: 'critical',
  },
  {
    id: generateId(),
    type: 'file_scanned',
    title: 'Download Scanned',
    description: 'File "document.pdf" was scanned - No threats found',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    severity: 'low',
  },
  {
    id: generateId(),
    type: 'network_blocked',
    title: 'Suspicious Connection Blocked',
    description: 'Blocked connection to known malicious IP 185.220.101.45',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'high',
  },
  {
    id: generateId(),
    type: 'update',
    title: 'Database Updated',
    description: 'Threat database updated to version 2024.12.15.001',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    severity: 'low',
  },
  {
    id: generateId(),
    type: 'scan',
    title: 'Quick Scan Completed',
    description: 'Quick scan completed - 1 threat found and quarantined',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    severity: 'medium',
  },
];

// Mock Quarantine Items
export const mockQuarantineItems: QuarantineItem[] = [
  {
    id: generateId(),
    originalPath: 'C:\\Program Files\\FreeApp\\installer.exe',
    threatName: 'PUP.Optional.BundleInstaller',
    threatType: 'pup',
    severity: 'low',
    quarantinedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    size: 1048576,
    canRestore: true,
  },
  {
    id: generateId(),
    originalPath: 'C:\\Users\\Admin\\AppData\\Roaming\\keylog.sys',
    threatName: 'Spyware.KeyLogger',
    threatType: 'spyware',
    severity: 'high',
    quarantinedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    size: 262144,
    canRestore: false,
  },
];

// Mock Scan History
export const mockScanHistory: ScanResult[] = [
  {
    id: generateId(),
    type: 'quick',
    startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000),
    status: 'completed',
    filesScanned: 45678,
    threatsFound: 1,
    threatsQuarantined: 1,
    threatsRemoved: 0,
    progress: 100,
    threats: [mockThreats[1]],
  },
  {
    id: generateId(),
    type: 'full',
    startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    status: 'completed',
    filesScanned: 567890,
    threatsFound: 2,
    threatsQuarantined: 1,
    threatsRemoved: 1,
    progress: 100,
    threats: [mockThreats[2], mockThreats[3]],
  },
];

// Threat name generator for scan simulation
export const threatNames = [
  'Trojan.GenericKD.47832',
  'PUP.Optional.BundleInstaller',
  'Adware.BrowserMod',
  'Ransom.LockBit',
  'Spyware.KeyLogger',
  'Virus.Win32.Sality',
  'Worm.AutoRun',
  'Backdoor.Agent',
  'Rootkit.ZeroAccess',
  'Exploit.CVE-2024-1234',
];

export const threatTypes: Array<'virus' | 'trojan' | 'ransomware' | 'spyware' | 'adware' | 'pup' | 'suspicious'> = [
  'virus', 'trojan', 'ransomware', 'spyware', 'adware', 'pup', 'suspicious'
];

export const threatSeverities: Array<'critical' | 'high' | 'medium' | 'low'> = [
  'critical', 'high', 'medium', 'low'
];

// Helper to generate random threat during scan
export const generateRandomThreat = (filePath: string): Threat => ({
  id: generateId(),
  name: threatNames[Math.floor(Math.random() * threatNames.length)],
  type: threatTypes[Math.floor(Math.random() * threatTypes.length)],
  severity: threatSeverities[Math.floor(Math.random() * threatSeverities.length)],
  path: filePath,
  size: Math.floor(Math.random() * 5000000) + 100000,
  detectedAt: new Date(),
  status: 'active',
  description: 'Detected during system scan',
});

// System paths for scan simulation
export const scanPaths = {
  quick: [
    'C:\\Windows\\System32',
    'C:\\Windows\\SysWOW64',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\Users\\Admin\\AppData\\Roaming',
    'C:\\Users\\Admin\\AppData\\Local',
    'C:\\Windows\\Temp',
    'C:\\Users\\Admin\\Downloads',
  ],
  full: [
    'C:\\Windows',
    'C:\\Program Files',
    'C:\\Program Files (x86)',
    'C:\\ProgramData',
    'C:\\Users',
    'D:\\',
  ],
  custom: [
    'C:\\Users\\Admin\\Documents',
    'C:\\Users\\Admin\\Downloads',
    'C:\\Users\\Admin\\Desktop',
  ],
};
