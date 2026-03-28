import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { 
  AppState, 
  ProtectionStatus, 
  SystemMetrics, 
  Threat, 
  ScanResult, 
  ScanType,
  CleanupItem,
  NetworkActivity,
  ProcessInfo,
  ProtectionEvent,
  ChatMessage,
  QuarantineItem
} from './types';

const generateId = () => Math.random().toString(36).substring(2, 15);

// Initial state with mock data
const initialState: AppState = {
  // Protection Status
  protectionStatus: 'protected',
  realTimeProtectionEnabled: true,
  lastScanDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  threatDatabaseVersion: '2024.12.15.001',
  lastDatabaseUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
  
  // System Metrics
  systemMetrics: {
    cpu: 23,
    memory: 45,
    disk: 67,
    network: 12,
    lastUpdated: new Date(),
  },
  
  // Threats
  recentThreats: [],
  quarantineItems: [],
  
  // Scanning
  currentScan: null,
  scanHistory: [],
  
  // Cleanup
  cleanupItems: [],
  cleanupHistory: [],
  
  // Network & Processes
  networkActivity: [],
  processes: [],
  
  // Protection Events
  protectionEvents: [],
  
  // Voice Assistant
  voiceEnabled: false,
  voiceListening: false,
  chatMessages: [],
  
  // Settings
  settings: {
    realTimeProtection: true,
    autoUpdate: true,
    notifications: {
      threats: true,
      scans: true,
      updates: true,
      sound: true,
      desktop: true,
    },
    cloudProtection: true,
    autoQuarantine: true,
    scheduledScans: [],
    exclusions: [],
  },
  
  // UI State
  activeTab: 'dashboard',
  isLoading: false,
  error: null,
};

export const useVeeShieldStore = create<AppState>()(
  subscribeWithSelector(() => initialState)
);

// Actions
export const actions = {
  // Protection Actions
  setProtectionStatus: (status: ProtectionStatus) => {
    useVeeShieldStore.setState({ protectionStatus: status });
  },
  
  toggleRealTimeProtection: () => {
    const state = useVeeShieldStore.getState();
    const newStatus = !state.realTimeProtectionEnabled;
    useVeeShieldStore.setState({ 
      realTimeProtectionEnabled: newStatus,
      protectionStatus: newStatus ? 'protected' : 'at_risk'
    });
  },
  
  // System Metrics Actions
  updateSystemMetrics: (metrics: Partial<SystemMetrics>) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      systemMetrics: {
        ...state.systemMetrics,
        ...metrics,
        lastUpdated: new Date(),
      }
    });
  },
  
  // Threat Actions
  addThreat: (threat: Threat) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      recentThreats: [threat, ...state.recentThreats].slice(0, 20),
      protectionStatus: 'at_risk',
    });
  },
  
  removeThreat: (threatId: string) => {
    const state = useVeeShieldStore.getState();
    const updatedThreats = state.recentThreats.filter(t => t.id !== threatId);
    useVeeShieldStore.setState({
      recentThreats: updatedThreats,
      protectionStatus: updatedThreats.length === 0 ? 'protected' : 'at_risk',
    });
  },
  
  quarantineThreat: (threatId: string) => {
    const state = useVeeShieldStore.getState();
    const threat = state.recentThreats.find(t => t.id === threatId);
    if (!threat) return;
    
    const quarantineItem: QuarantineItem = {
      id: generateId(),
      originalPath: threat.path,
      threatName: threat.name,
      threatType: threat.type,
      severity: threat.severity,
      quarantinedAt: new Date(),
      size: threat.size,
      canRestore: true,
    };
    
    useVeeShieldStore.setState({
      recentThreats: state.recentThreats.map(t => 
        t.id === threatId ? { ...t, status: 'quarantined' } : t
      ),
      quarantineItems: [quarantineItem, ...state.quarantineItems],
    });
  },
  
  // Scan Actions
  startScan: (type: ScanType) => {
    const scanResult: ScanResult = {
      id: generateId(),
      type,
      startedAt: new Date(),
      status: 'scanning',
      filesScanned: 0,
      threatsFound: 0,
      threatsQuarantined: 0,
      threatsRemoved: 0,
      progress: 0,
      threats: [],
    };
    
    useVeeShieldStore.setState({
      currentScan: scanResult,
      protectionStatus: 'scanning',
    });
  },
  
  updateScanProgress: (progress: number, currentPath?: string, filesScanned?: number) => {
    const state = useVeeShieldStore.getState();
    if (!state.currentScan) return;
    
    useVeeShieldStore.setState({
      currentScan: {
        ...state.currentScan,
        progress,
        currentPath,
        filesScanned: filesScanned ?? state.currentScan.filesScanned,
      }
    });
  },
  
  completeScan: (threatsFound: number, threats: Threat[]) => {
    const state = useVeeShieldStore.getState();
    if (!state.currentScan) return;
    
    const completedScan: ScanResult = {
      ...state.currentScan,
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      threatsFound,
      threats,
    };
    
    useVeeShieldStore.setState({
      currentScan: null,
      scanHistory: [completedScan, ...state.scanHistory].slice(0, 10),
      lastScanDate: new Date(),
      protectionStatus: threatsFound > 0 ? 'at_risk' : 'protected',
      recentThreats: threats.length > 0 
        ? [...threats, ...state.recentThreats].slice(0, 20) 
        : state.recentThreats,
    });
  },
  
  cancelScan: () => {
    const state = useVeeShieldStore.getState();
    if (!state.currentScan) return;
    
    const cancelledScan: ScanResult = {
      ...state.currentScan,
      status: 'cancelled',
      completedAt: new Date(),
    };
    
    useVeeShieldStore.setState({
      currentScan: null,
      scanHistory: [cancelledScan, ...state.scanHistory].slice(0, 10),
      protectionStatus: 'protected',
    });
  },
  
  // Cleanup Actions
  setCleanupItems: (items: CleanupItem[]) => {
    useVeeShieldStore.setState({ cleanupItems: items });
  },
  
  toggleCleanupItem: (itemId: string) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      cleanupItems: state.cleanupItems.map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    });
  },
  
  // Network Actions
  setNetworkActivity: (activity: NetworkActivity[]) => {
    useVeeShieldStore.setState({ networkActivity: activity });
  },
  
  addNetworkActivity: (activity: NetworkActivity) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      networkActivity: [activity, ...state.networkActivity].slice(0, 100)
    });
  },
  
  // Process Actions
  setProcesses: (processes: ProcessInfo[]) => {
    useVeeShieldStore.setState({ processes });
  },
  
  // Protection Events Actions
  addProtectionEvent: (event: ProtectionEvent) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      protectionEvents: [event, ...state.protectionEvents].slice(0, 50)
    });
  },
  
  // Voice Assistant Actions
  setVoiceEnabled: (enabled: boolean) => {
    useVeeShieldStore.setState({ voiceEnabled: enabled });
  },
  
  setVoiceListening: (listening: boolean) => {
    useVeeShieldStore.setState({ voiceListening: listening });
  },
  
  addChatMessage: (message: ChatMessage) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      chatMessages: [...state.chatMessages, message].slice(-50)
    });
  },
  
  clearChatMessages: () => {
    useVeeShieldStore.setState({ chatMessages: [] });
  },
  
  // Settings Actions
  updateSettings: (settings: Partial<AppState['settings']>) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      settings: { ...state.settings, ...settings }
    });
  },
  
  // UI Actions
  setActiveTab: (tab: string) => {
    useVeeShieldStore.setState({ activeTab: tab });
  },
  
  setLoading: (loading: boolean) => {
    useVeeShieldStore.setState({ isLoading: loading });
  },
  
  setError: (error: string | null) => {
    useVeeShieldStore.setState({ error });
  },
  
  // Quarantine Actions
  deleteQuarantineItem: (itemId: string) => {
    const state = useVeeShieldStore.getState();
    useVeeShieldStore.setState({
      quarantineItems: state.quarantineItems.filter(item => item.id !== itemId)
    });
  },
  
  restoreQuarantineItem: (itemId: string) => {
    const state = useVeeShieldStore.getState();
    const item = state.quarantineItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Add back to threats as a new detection
    const threat: Threat = {
      id: generateId(),
      name: item.threatName,
      type: item.threatType,
      severity: item.severity,
      path: item.originalPath,
      size: item.size,
      detectedAt: new Date(),
      status: 'active',
      description: `Restored from quarantine`,
    };
    
    useVeeShieldStore.setState({
      quarantineItems: state.quarantineItems.filter(i => i.id !== itemId),
      recentThreats: [threat, ...state.recentThreats].slice(0, 20),
      protectionStatus: 'at_risk',
    });
  },
};

export default useVeeShieldStore;
