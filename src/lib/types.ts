// VeeShield Type Definitions

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ThreatType = 'virus' | 'trojan' | 'ransomware' | 'spyware' | 'adware' | 'pup' | 'suspicious';
export type ScanType = 'quick' | 'full' | 'custom';
export type ScanStatus = 'idle' | 'scanning' | 'paused' | 'completed' | 'cancelled';
export type ProtectionStatus = 'protected' | 'at_risk' | 'scanning' | 'updating';

export interface Threat {
  id: string;
  name: string;
  type: ThreatType;
  severity: ThreatSeverity;
  path: string;
  size: number;
  detectedAt: Date;
  status: 'active' | 'quarantined' | 'removed';
  description: string;
}

export interface ScanResult {
  id: string;
  type: ScanType;
  startedAt: Date;
  completedAt?: Date;
  status: ScanStatus;
  filesScanned: number;
  threatsFound: number;
  threatsQuarantined: number;
  threatsRemoved: number;
  progress: number;
  currentPath?: string;
  threats: Threat[];
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  lastUpdated: Date;
}

export interface NetworkActivity {
  id: string;
  process: string;
  direction: 'inbound' | 'outbound';
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
  localAddress: string;
  remoteAddress: string;
  bytes: number;
  timestamp: Date;
  suspicious: boolean;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  path: string;
  suspicious: boolean;
  networkActivity: boolean;
}

export interface CleanupItem {
  id: string;
  name: string;
  description: string;
  category: 'temp' | 'cache' | 'logs' | 'update' | 'recycle';
  size: number;
  fileCount: number;
  selected: boolean;
  path: string;
}

export interface CleanupResult {
  id: string;
  startedAt: Date;
  completedAt?: Date;
  itemsCleaned: number;
  spaceRecovered: number;
  errors: string[];
}

export interface ProtectionEvent {
  id: string;
  type: 'threat_blocked' | 'file_scanned' | 'network_blocked' | 'process_blocked' | 'update' | 'scan';
  title: string;
  description: string;
  timestamp: Date;
  severity: ThreatSeverity;
  details?: Record<string, unknown>;
}

export interface VoiceCommand {
  id: string;
  command: string;
  response: string;
  timestamp: Date;
  executed: boolean;
}

export interface ScanSchedule {
  id: string;
  type: ScanType;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  enabled: boolean;
  lastRun?: Date;
  nextRun: Date;
}

export interface ExclusionItem {
  id: string;
  path: string;
  type: 'file' | 'folder' | 'extension' | 'process';
  addedAt: Date;
  description?: string;
}

export interface QuarantineItem {
  id: string;
  originalPath: string;
  threatName: string;
  threatType: ThreatType;
  severity: ThreatSeverity;
  quarantinedAt: Date;
  size: number;
  canRestore: boolean;
}

export interface NotificationSettings {
  threats: boolean;
  scans: boolean;
  updates: boolean;
  sound: boolean;
  desktop: boolean;
}

export interface AppSettings {
  realTimeProtection: boolean;
  autoUpdate: boolean;
  notifications: NotificationSettings;
  cloudProtection: boolean;
  autoQuarantine: boolean;
  scheduledScans: ScanSchedule[];
  exclusions: ExclusionItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  voiceInput?: boolean;
  voiceOutput?: boolean;
}

export interface AppState {
  // Protection Status
  protectionStatus: ProtectionStatus;
  realTimeProtectionEnabled: boolean;
  lastScanDate?: Date;
  threatDatabaseVersion: string;
  lastDatabaseUpdate?: Date;
  
  // System Metrics
  systemMetrics: SystemMetrics;
  
  // Threats
  recentThreats: Threat[];
  quarantineItems: QuarantineItem[];
  
  // Scanning
  currentScan: ScanResult | null;
  scanHistory: ScanResult[];
  
  // Cleanup
  cleanupItems: CleanupItem[];
  cleanupHistory: CleanupResult[];
  
  // Network & Processes
  networkActivity: NetworkActivity[];
  processes: ProcessInfo[];
  
  // Protection Events
  protectionEvents: ProtectionEvent[];
  
  // Voice Assistant
  voiceEnabled: boolean;
  voiceListening: boolean;
  chatMessages: ChatMessage[];
  
  // Settings
  settings: AppSettings;
  
  // UI State
  activeTab: string;
  isLoading: boolean;
  error: string | null;
}
