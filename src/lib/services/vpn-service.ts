// VeeShield VPN Service - Universal VPN Engine
// Client-side VPN simulation with realistic server database, protocols, and metrics

// ─── Types ───────────────────────────────────────────────────────────────────────

export type VPNStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
export type VPNProtocol = 'wireguard' | 'openvpn_tcp' | 'openvpn_udp' | 'ikev2';
export type VPNRegion = 'north_america' | 'europe' | 'asia_pacific' | 'south_america' | 'middle_east_africa';

export interface VPNServer {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  region: VPNRegion;
  latitude: number;
  longitude: number;
  load: number;
  ping: number;
  premium: boolean;
  features: string[];
  flag: string; // country flag emoji
}

export interface VPNConnectionInfo {
  server: VPNServer;
  protocol: VPNProtocol;
  assignedIP: string;
  encryption: string;
  dnsServer: string;
  connectedAt: number;
}

export interface VPNSpeedMetrics {
  downloadSpeed: number; // Mbps
  uploadSpeed: number;   // Mbps
  ping: number;          // ms
  jitter: number;        // ms
  packetLoss: number;    // percentage
}

export interface VPNStats {
  connectionStartTime: number | null;
  totalDataDownloaded: number; // bytes
  totalDataUploaded: number;   // bytes
  sessionDuration: number;     // seconds
}

export interface VPNState {
  status: VPNStatus;
  currentServer: VPNServer | null;
  protocol: VPNProtocol;
  connectionInfo: VPNConnectionInfo | null;
  speedMetrics: VPNSpeedMetrics;
  stats: VPNStats;
  killSwitch: boolean;
  splitTunneling: boolean;
  splitTunnelApps: string[];
  dnsLeakProtection: boolean;
  autoConnect: boolean;
  lastServerId: string | null;
  favorites: string[];
}

export type ConnectionStage = 'initializing' | 'connecting_to_server' | 'authenticating' | 'establishing_tunnel' | 'verifying' | 'connected';

// ─── Server Database ─────────────────────────────────────────────────────────────

const SERVERS: VPNServer[] = [
  // North America
  { id: 'us-east-1', name: 'US East - New York', city: 'New York', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 40.71, longitude: -74.01, load: 62, ping: 12, premium: false, features: ['p2p', 'streaming'], flag: '🇺🇸' },
  { id: 'us-east-2', name: 'US East - Washington DC', city: 'Washington', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 38.91, longitude: -77.04, load: 48, ping: 15, premium: false, features: ['streaming'], flag: '🇺🇸' },
  { id: 'us-west-1', name: 'US West - Los Angeles', city: 'Los Angeles', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 34.05, longitude: -118.24, load: 55, ping: 22, premium: false, features: ['p2p', 'streaming'], flag: '🇺🇸' },
  { id: 'us-west-2', name: 'US West - San Francisco', city: 'San Francisco', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 37.77, longitude: -122.42, load: 71, ping: 20, premium: false, features: ['p2p'], flag: '🇺🇸' },
  { id: 'us-central-1', name: 'US Central - Chicago', city: 'Chicago', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 41.88, longitude: -87.63, load: 39, ping: 18, premium: false, features: ['streaming'], flag: '🇺🇸' },
  { id: 'us-central-2', name: 'US Central - Dallas', city: 'Dallas', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 32.78, longitude: -96.80, load: 44, ping: 19, premium: false, features: ['p2p'], flag: '🇺🇸' },
  { id: 'us-south-1', name: 'US South - Miami', city: 'Miami', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 25.76, longitude: -80.19, load: 58, ping: 24, premium: false, features: ['streaming'], flag: '🇺🇸' },
  { id: 'us-seattle-1', name: 'US West - Seattle', city: 'Seattle', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 47.61, longitude: -122.33, load: 33, ping: 16, premium: false, features: ['p2p'], flag: '🇺🇸' },
  { id: 'us-denver-1', name: 'US Mountain - Denver', city: 'Denver', country: 'United States', countryCode: 'US', region: 'north_america', latitude: 39.74, longitude: -104.99, load: 27, ping: 21, premium: false, features: [], flag: '🇺🇸' },
  { id: 'ca-toronto-1', name: 'Canada - Toronto', city: 'Toronto', country: 'Canada', countryCode: 'CA', region: 'north_america', latitude: 43.65, longitude: -79.38, load: 35, ping: 28, premium: false, features: ['p2p', 'streaming'], flag: '🇨🇦' },
  { id: 'ca-vancouver-1', name: 'Canada - Vancouver', city: 'Vancouver', country: 'Canada', countryCode: 'CA', region: 'north_america', latitude: 49.28, longitude: -123.12, load: 42, ping: 32, premium: false, features: ['p2p'], flag: '🇨🇦' },
  { id: 'ca-montreal-1', name: 'Canada - Montreal', city: 'Montreal', country: 'Canada', countryCode: 'CA', region: 'north_america', latitude: 45.50, longitude: -73.57, load: 38, ping: 30, premium: false, features: ['streaming'], flag: '🇨🇦' },
  { id: 'mx-mexico-1', name: 'Mexico - Mexico City', city: 'Mexico City', country: 'Mexico', countryCode: 'MX', region: 'north_america', latitude: 19.43, longitude: -99.13, load: 51, ping: 45, premium: false, features: [], flag: '🇲🇽' },

  // Europe
  { id: 'uk-london-1', name: 'UK - London', city: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'europe', latitude: 51.51, longitude: -0.13, load: 67, ping: 35, premium: false, features: ['p2p', 'streaming'], flag: '🇬🇧' },
  { id: 'uk-london-2', name: 'UK - London #2', city: 'London', country: 'United Kingdom', countryCode: 'GB', region: 'europe', latitude: 51.52, longitude: -0.10, load: 54, ping: 33, premium: false, features: ['streaming'], flag: '🇬🇧' },
  { id: 'de-frankfurt-1', name: 'Germany - Frankfurt', city: 'Frankfurt', country: 'Germany', countryCode: 'DE', region: 'europe', latitude: 50.11, longitude: 8.68, load: 59, ping: 40, premium: false, features: ['p2p', 'streaming'], flag: '🇩🇪' },
  { id: 'de-berlin-1', name: 'Germany - Berlin', city: 'Berlin', country: 'Germany', countryCode: 'DE', region: 'europe', latitude: 52.52, longitude: 13.41, load: 41, ping: 43, premium: false, features: ['p2p'], flag: '🇩🇪' },
  { id: 'de-munich-1', name: 'Germany - Munich', city: 'Munich', country: 'Germany', countryCode: 'DE', region: 'europe', latitude: 48.14, longitude: 11.58, load: 37, ping: 42, premium: false, features: ['streaming'], flag: '🇩🇪' },
  { id: 'fr-paris-1', name: 'France - Paris', city: 'Paris', country: 'France', countryCode: 'FR', region: 'europe', latitude: 48.86, longitude: 2.35, load: 53, ping: 38, premium: false, features: ['p2p', 'streaming'], flag: '🇫🇷' },
  { id: 'nl-amsterdam-1', name: 'Netherlands - Amsterdam', city: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', region: 'europe', latitude: 52.37, longitude: 4.90, load: 62, ping: 36, premium: false, features: ['p2p', 'streaming'], flag: '🇳🇱' },
  { id: 'se-stockholm-1', name: 'Sweden - Stockholm', city: 'Stockholm', country: 'Sweden', countryCode: 'SE', region: 'europe', latitude: 59.33, longitude: 18.07, load: 28, ping: 48, premium: true, features: ['p2p', 'double_vpn'], flag: '🇸🇪' },
  { id: 'ch-zurich-1', name: 'Switzerland - Zurich', city: 'Zurich', country: 'Switzerland', countryCode: 'CH', region: 'europe', latitude: 47.37, longitude: 8.54, load: 44, ping: 41, premium: true, features: ['p2p', 'double_vpn'], flag: '🇨🇭' },
  { id: 'es-madrid-1', name: 'Spain - Madrid', city: 'Madrid', country: 'Spain', countryCode: 'ES', region: 'europe', latitude: 40.42, longitude: -3.70, load: 39, ping: 44, premium: false, features: ['streaming'], flag: '🇪🇸' },
  { id: 'it-milan-1', name: 'Italy - Milan', city: 'Milan', country: 'Italy', countryCode: 'IT', region: 'europe', latitude: 45.46, longitude: 9.19, load: 46, ping: 46, premium: false, features: ['streaming'], flag: '🇮🇹' },
  { id: 'it-rome-1', name: 'Italy - Rome', city: 'Rome', country: 'Italy', countryCode: 'IT', region: 'europe', latitude: 41.90, longitude: 12.50, load: 33, ping: 47, premium: false, features: [], flag: '🇮🇹' },
  { id: 'no-oslo-1', name: 'Norway - Oslo', city: 'Oslo', country: 'Norway', countryCode: 'NO', region: 'europe', latitude: 59.91, longitude: 10.75, load: 22, ping: 50, premium: true, features: ['p2p'], flag: '🇳🇴' },
  { id: 'pl-warsaw-1', name: 'Poland - Warsaw', city: 'Warsaw', country: 'Poland', countryCode: 'PL', region: 'europe', latitude: 52.23, longitude: 21.01, load: 36, ping: 44, premium: false, features: ['p2p'], flag: '🇵🇱' },
  { id: 'ro-bucharest-1', name: 'Romania - Bucharest', city: 'Bucharest', country: 'Romania', countryCode: 'RO', region: 'europe', latitude: 44.43, longitude: 26.10, load: 29, ping: 52, premium: false, features: ['p2p', 'obfuscated'], flag: '🇷🇴' },
  { id: 'ie-dublin-1', name: 'Ireland - Dublin', city: 'Dublin', country: 'Ireland', countryCode: 'IE', region: 'europe', latitude: 53.35, longitude: -6.26, load: 31, ping: 37, premium: false, features: ['streaming'], flag: '🇮🇪' },
  { id: 'pt-lisbon-1', name: 'Portugal - Lisbon', city: 'Lisbon', country: 'Portugal', countryCode: 'PT', region: 'europe', latitude: 38.72, longitude: -9.14, load: 25, ping: 49, premium: false, features: [], flag: '🇵🇹' },
  { id: 'at-vienna-1', name: 'Austria - Vienna', city: 'Vienna', country: 'Austria', countryCode: 'AT', region: 'europe', latitude: 48.21, longitude: 16.37, load: 32, ping: 43, premium: false, features: ['p2p'], flag: '🇦🇹' },

  // Asia Pacific
  { id: 'jp-tokyo-1', name: 'Japan - Tokyo', city: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'asia_pacific', latitude: 35.68, longitude: 139.69, load: 65, ping: 95, premium: false, features: ['p2p', 'streaming'], flag: '🇯🇵' },
  { id: 'jp-tokyo-2', name: 'Japan - Tokyo #2', city: 'Tokyo', country: 'Japan', countryCode: 'JP', region: 'asia_pacific', latitude: 35.67, longitude: 139.71, load: 58, ping: 93, premium: false, features: ['streaming'], flag: '🇯🇵' },
  { id: 'jp-osaka-1', name: 'Japan - Osaka', city: 'Osaka', country: 'Japan', countryCode: 'JP', region: 'asia_pacific', latitude: 34.69, longitude: 135.50, load: 42, ping: 97, premium: false, features: ['p2p'], flag: '🇯🇵' },
  { id: 'sg-singapore-1', name: 'Singapore - Singapore', city: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'asia_pacific', latitude: 1.35, longitude: 103.82, load: 57, ping: 88, premium: false, features: ['p2p', 'streaming'], flag: '🇸🇬' },
  { id: 'sg-singapore-2', name: 'Singapore - Singapore #2', city: 'Singapore', country: 'Singapore', countryCode: 'SG', region: 'asia_pacific', latitude: 1.30, longitude: 103.85, load: 49, ping: 86, premium: false, features: ['p2p'], flag: '🇸🇬' },
  { id: 'au-sydney-1', name: 'Australia - Sydney', city: 'Sydney', country: 'Australia', countryCode: 'AU', region: 'asia_pacific', latitude: -33.87, longitude: 151.21, load: 44, ping: 120, premium: false, features: ['p2p', 'streaming'], flag: '🇦🇺' },
  { id: 'au-melbourne-1', name: 'Australia - Melbourne', city: 'Melbourne', country: 'Australia', countryCode: 'AU', region: 'asia_pacific', latitude: -37.81, longitude: 144.96, load: 36, ping: 125, premium: false, features: ['streaming'], flag: '🇦🇺' },
  { id: 'kr-seoul-1', name: 'South Korea - Seoul', city: 'Seoul', country: 'South Korea', countryCode: 'KR', region: 'asia_pacific', latitude: 37.57, longitude: 126.98, load: 52, ping: 100, premium: false, features: ['p2p', 'streaming'], flag: '🇰🇷' },
  { id: 'in-mumbai-1', name: 'India - Mumbai', city: 'Mumbai', country: 'India', countryCode: 'IN', region: 'asia_pacific', latitude: 19.08, longitude: 72.88, load: 63, ping: 135, premium: false, features: ['streaming'], flag: '🇮🇳' },
  { id: 'in-delhi-1', name: 'India - Delhi', city: 'Delhi', country: 'India', countryCode: 'IN', region: 'asia_pacific', latitude: 28.61, longitude: 77.21, load: 58, ping: 140, premium: false, features: [], flag: '🇮🇳' },
  { id: 'hk-hongkong-1', name: 'Hong Kong', city: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', region: 'asia_pacific', latitude: 22.32, longitude: 114.17, load: 61, ping: 85, premium: false, features: ['p2p', 'streaming'], flag: '🇭🇰' },
  { id: 'tw-taipei-1', name: 'Taiwan - Taipei', city: 'Taipei', country: 'Taiwan', countryCode: 'TW', region: 'asia_pacific', latitude: 25.03, longitude: 121.57, load: 38, ping: 90, premium: false, features: ['p2p'], flag: '🇹🇼' },
  { id: 'nz-auckland-1', name: 'New Zealand - Auckland', city: 'Auckland', country: 'New Zealand', countryCode: 'NZ', region: 'asia_pacific', latitude: -36.85, longitude: 174.76, load: 19, ping: 145, premium: true, features: ['p2p'], flag: '🇳🇿' },

  // South America
  { id: 'br-saopaulo-1', name: 'Brazil - São Paulo', city: 'São Paulo', country: 'Brazil', countryCode: 'BR', region: 'south_america', latitude: -23.55, longitude: -46.63, load: 47, ping: 130, premium: false, features: ['p2p', 'streaming'], flag: '🇧🇷' },
  { id: 'br-rio-1', name: 'Brazil - Rio de Janeiro', city: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', region: 'south_america', latitude: -22.91, longitude: -43.17, load: 41, ping: 135, premium: false, features: ['streaming'], flag: '🇧🇷' },
  { id: 'ar-buenosaires-1', name: 'Argentina - Buenos Aires', city: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', region: 'south_america', latitude: -34.60, longitude: -58.38, load: 33, ping: 155, premium: true, features: ['p2p'], flag: '🇦🇷' },
  { id: 'cl-santiago-1', name: 'Chile - Santiago', city: 'Santiago', country: 'Chile', countryCode: 'CL', region: 'south_america', latitude: -33.45, longitude: -70.67, load: 28, ping: 160, premium: true, features: [], flag: '🇨🇱' },
  { id: 'co-bogota-1', name: 'Colombia - Bogota', city: 'Bogota', country: 'Colombia', countryCode: 'CO', region: 'south_america', latitude: 4.71, longitude: -74.07, load: 25, ping: 140, premium: false, features: [], flag: '🇨🇴' },

  // Middle East & Africa
  { id: 'ae-dubai-1', name: 'UAE - Dubai', city: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', region: 'middle_east_africa', latitude: 25.20, longitude: 55.27, load: 44, ping: 110, premium: false, features: ['streaming'], flag: '🇦🇪' },
  { id: 'il-telaviv-1', name: 'Israel - Tel Aviv', city: 'Tel Aviv', country: 'Israel', countryCode: 'IL', region: 'middle_east_africa', latitude: 32.09, longitude: 34.77, load: 36, ping: 105, premium: false, features: ['p2p'], flag: '🇮🇱' },
  { id: 'za-johannesburg-1', name: 'South Africa - Johannesburg', city: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', region: 'middle_east_africa', latitude: -26.20, longitude: 28.05, load: 22, ping: 175, premium: true, features: ['p2p'], flag: '🇿🇦' },
  { id: 'za-capetown-1', name: 'South Africa - Cape Town', city: 'Cape Town', country: 'South Africa', countryCode: 'ZA', region: 'middle_east_africa', latitude: -33.93, longitude: 18.42, load: 18, ping: 180, premium: true, features: [], flag: '🇿🇦' },
  { id: 'tr-istanbul-1', name: 'Turkey - Istanbul', city: 'Istanbul', country: 'Turkey', countryCode: 'TR', region: 'middle_east_africa', latitude: 41.01, longitude: 28.98, load: 53, ping: 75, premium: false, features: ['p2p', 'obfuscated'], flag: '🇹🇷' },
  { id: 'eg-cairo-1', name: 'Egypt - Cairo', city: 'Cairo', country: 'Egypt', countryCode: 'EG', region: 'middle_east_africa', latitude: 30.04, longitude: 31.24, load: 39, ping: 115, premium: false, features: [], flag: '🇪🇬' },
];

// ─── Protocol Configurations ────────────────────────────────────────────────────

const PROTOCOL_CONFIG: Record<VPNProtocol, {
  name: string;
  encryption: string;
  defaultPort: number;
  speedMultiplier: { download: number; upload: number };
  description: string;
}> = {
  wireguard: {
    name: 'WireGuard',
    encryption: 'ChaCha20-Poly1305 (256-bit)',
    defaultPort: 51820,
    speedMultiplier: { download: 1.0, upload: 1.0 },
    description: 'Fastest protocol with modern encryption'
  },
  openvpn_tcp: {
    name: 'OpenVPN (TCP)',
    encryption: 'AES-256-GCM',
    defaultPort: 443,
    speedMultiplier: { download: 0.7, upload: 0.7 },
    description: 'Most reliable, works on restricted networks'
  },
  openvpn_udp: {
    name: 'OpenVPN (UDP)',
    encryption: 'AES-256-GCM',
    defaultPort: 1194,
    speedMultiplier: { download: 0.85, upload: 0.8 },
    description: 'Balanced speed and reliability'
  },
  ikev2: {
    name: 'IKEv2/IPSec',
    encryption: 'AES-256-CBC + HMAC-SHA2-256',
    defaultPort: 500,
    speedMultiplier: { download: 0.95, upload: 0.9 },
    description: 'Best for mobile, fast reconnection'
  },
};

// ─── Helper Functions ───────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateIP(countryCode: string): string {
  // Generate a realistic-looking IP for each country
  const ipRanges: Record<string, [number, number]> = {
    US: [3, 224], GB: [1, 200], DE: [2, 249], FR: [1, 200],
    NL: [1, 200], SE: [1, 200], CH: [1, 200], ES: [1, 200],
    IT: [1, 200], NO: [1, 200], PL: [1, 200], RO: [1, 200],
    IE: [1, 200], PT: [1, 200], AT: [1, 200], CA: [1, 200],
    MX: [1, 200], JP: [1, 200], SG: [1, 200], AU: [1, 200],
    KR: [1, 200], IN: [1, 200], HK: [1, 200], TW: [1, 200],
    NZ: [1, 200], BR: [1, 200], AR: [1, 200], CL: [1, 200],
    CO: [1, 200], AE: [1, 200], IL: [1, 200], ZA: [1, 200],
    TR: [1, 200], EG: [1, 200],
  };
  const range = ipRanges[countryCode] || [1, 200];
  const a = Math.floor(randomBetween(range[0], range[1]));
  const b = Math.floor(randomBetween(0, 256));
  const c = Math.floor(randomBetween(0, 256));
  const d = Math.floor(randomBetween(1, 255));
  return `${a}.${b}.${c}.${d}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── VPN Service Class ──────────────────────────────────────────────────────────

let statsInterval: ReturnType<typeof setInterval> | null = null;

class VPNEngine {
  private state: VPNState = {
    status: 'disconnected',
    currentServer: null,
    protocol: 'wireguard',
    connectionInfo: null,
    speedMetrics: { downloadSpeed: 0, uploadSpeed: 0, ping: 0, jitter: 0, packetLoss: 0 },
    stats: { connectionStartTime: null, totalDataDownloaded: 0, totalDataUploaded: 0, sessionDuration: 0 },
    killSwitch: true,
    splitTunneling: false,
    splitTunnelApps: [],
    dnsLeakProtection: true,
    autoConnect: true,
    lastServerId: null,
    favorites: [],
  };

  private listeners: Set<(state: VPNState) => void> = new Set();
  private stageListeners: Set<(stage: ConnectionStage) => void> = new Set();

  // ── State Management ──────────────────────────────────────────────────────

  getState(): VPNState {
    return { ...this.state };
  }

  subscribe(listener: (state: VPNState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onStage(stageListener: (stage: ConnectionStage) => void): () => void {
    this.stageListeners.add(stageListener);
    return () => this.stageListeners.delete(stageListener);
  }

  private emit(): void {
    const snapshot = this.getState();
    this.listeners.forEach(fn => fn(snapshot));
  }

  private emitStage(stage: ConnectionStage): void {
    this.stageListeners.forEach(fn => fn(stage));
  }

  // ── Server Operations ────────────────────────────────────────────────────

  getAllServers(): VPNServer[] {
    return [...SERVERS];
  }

  getServerById(id: string): VPNServer | undefined {
    return SERVERS.find(s => s.id === id);
  }

  getServersByRegion(region: VPNRegion): VPNServer[] {
    return SERVERS.filter(s => s.region === region);
  }

  getServerRegions(): { region: VPNRegion; label: string; count: number }[] {
    const regionLabels: Record<VPNRegion, string> = {
      north_america: 'North America',
      europe: 'Europe',
      asia_pacific: 'Asia Pacific',
      south_america: 'South America',
      middle_east_africa: 'Middle East & Africa',
    };
    const counts = new Map<VPNRegion, number>();
    SERVERS.forEach(s => counts.set(s.region, (counts.get(s.region) || 0) + 1));
    return Object.entries(regionLabels).map(([region, label]) => ({
      region: region as VPNRegion,
      label,
      count: counts.get(region as VPNRegion) || 0,
    }));
  }

  searchServers(query: string): VPNServer[] {
    const lower = query.toLowerCase();
    return SERVERS.filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.city.toLowerCase().includes(lower) ||
      s.country.toLowerCase().includes(lower) ||
      s.countryCode.toLowerCase().includes(lower)
    );
  }

  getRecommendedServer(): VPNServer {
    // Pick the server with lowest load that has best ping
    const sorted = [...SERVERS].sort((a, b) => {
      const scoreA = a.load * 0.6 + a.ping * 0.4;
      const scoreB = b.load * 0.6 + b.ping * 0.4;
      return scoreA - scoreB;
    });
    return sorted[0];
  }

  getFastestServer(): VPNServer {
    const sorted = [...SERVERS].sort((a, b) => a.ping - b.ping);
    return sorted[0];
  }

  // ── Connection Management ────────────────────────────────────────────────

  async connect(serverId?: string, protocol?: VPNProtocol): Promise<VPNState> {
    if (this.state.status === 'connecting' || this.state.status === 'connected') {
      return this.state;
    }

    const server = serverId ? this.getServerById(serverId) : this.state.lastServerId
      ? this.getServerById(this.state.lastServerId)
      : this.getRecommendedServer();

    if (!server) {
      throw new Error('Server not found');
    }

    const proto = protocol || this.state.protocol;

    // Update state
    this.state = {
      ...this.state,
      status: 'connecting',
      currentServer: server,
      protocol: proto,
    };
    this.emit();

    // Simulate connection stages
    const stages: { stage: ConnectionStage; duration: number }[] = [
      { stage: 'initializing', duration: randomBetween(400, 800) },
      { stage: 'connecting_to_server', duration: randomBetween(600, 1200) },
      { stage: 'authenticating', duration: randomBetween(400, 800) },
      { stage: 'establishing_tunnel', duration: randomBetween(800, 1500) },
      { stage: 'verifying', duration: randomBetween(300, 600) },
    ];

    for (const { stage, duration } of stages) {
      this.emitStage(stage);
      await delay(duration);
    }

    const protoConfig = PROTOCOL_CONFIG[proto];
    const connectionInfo: VPNConnectionInfo = {
      server,
      protocol: proto,
      assignedIP: generateIP(server.countryCode),
      encryption: protoConfig.encryption,
      dnsServer: `10.${Math.floor(randomBetween(0, 256))}.0.1`,
      connectedAt: Date.now(),
    };

    // Calculate initial speed metrics based on protocol and server load
    const baseDownload = randomBetween(60, 150) * protoConfig.speedMultiplier.download;
    const baseUpload = randomBetween(20, 50) * protoConfig.speedMultiplier.upload;
    const loadFactor = 1 - (server.load / 200); // Load reduces speed by up to 50%

    this.state = {
      ...this.state,
      status: 'connected',
      connectionInfo,
      speedMetrics: {
        downloadSpeed: Math.round(baseDownload * loadFactor * 10) / 10,
        uploadSpeed: Math.round(baseUpload * loadFactor * 10) / 10,
        ping: server.ping + Math.floor(randomBetween(-3, 8)),
        jitter: Math.round(randomBetween(1, 12) * 10) / 10,
        packetLoss: Math.round(randomBetween(0, 1.5) * 100) / 100,
      },
      stats: {
        connectionStartTime: Date.now(),
        totalDataDownloaded: 0,
        totalDataUploaded: 0,
        sessionDuration: 0,
      },
      lastServerId: server.id,
    };
    this.emit();

    // Start stats tracking
    this.startStatsTracking();

    return this.getState();
  }

  async disconnect(): Promise<VPNState> {
    if (this.state.status !== 'connected') {
      return this.state;
    }

    this.state = { ...this.state, status: 'disconnecting' };
    this.emit();

    await delay(randomBetween(500, 1000));

    this.stopStatsTracking();

    this.state = {
      ...this.state,
      status: 'disconnected',
      currentServer: null,
      connectionInfo: null,
      speedMetrics: { downloadSpeed: 0, uploadSpeed: 0, ping: 0, jitter: 0, packetLoss: 0 },
      stats: { connectionStartTime: null, totalDataDownloaded: 0, totalDataUploaded: 0, sessionDuration: 0 },
    };
    this.emit();

    return this.getState();
  }

  setProtocol(protocol: VPNProtocol): void {
    this.state = { ...this.state, protocol };
    this.emit();
    // If connected, reconnect with new protocol
    if (this.state.status === 'connected' && this.state.currentServer) {
      this.disconnect().then(() => {
        setTimeout(() => this.connect(this.state.lastServerId || undefined, protocol), 500);
      });
    }
  }

  // ── Stats Tracking ───────────────────────────────────────────────────────

  private startStatsTracking(): void {
    this.stopStatsTracking();
    statsInterval = setInterval(() => {
      if (this.state.status !== 'connected') return;

      // Simulate data transfer
      const dlRate = this.state.speedMetrics.downloadSpeed * 1024 * 1024 / 8; // bytes per second
      const ulRate = this.state.speedMetrics.uploadSpeed * 1024 * 1024 / 8;
      const dlDelta = dlRate * randomBetween(0.7, 1.3);
      const ulDelta = ulRate * randomBetween(0.5, 1.1);

      // Simulate speed fluctuations
      const dlFluctuation = 1 + randomBetween(-0.08, 0.08);
      const ulFluctuation = 1 + randomBetween(-0.1, 0.1);

      this.state = {
        ...this.state,
        speedMetrics: {
          ...this.state.speedMetrics,
          downloadSpeed: Math.max(1, Math.round(this.state.speedMetrics.downloadSpeed * dlFluctuation * 10) / 10),
          uploadSpeed: Math.max(0.5, Math.round(this.state.speedMetrics.uploadSpeed * ulFluctuation * 10) / 10),
          jitter: Math.max(0.1, Math.round(randomBetween(0.5, 15) * 10) / 10),
          ping: this.state.currentServer
            ? this.state.currentServer.ping + Math.floor(randomBetween(-5, 10))
            : 0,
        },
        stats: {
          ...this.state.stats,
          totalDataDownloaded: this.state.stats.totalDataDownloaded + dlDelta,
          totalDataUploaded: this.state.stats.totalDataUploaded + ulDelta,
          sessionDuration: this.state.stats.connectionStartTime
            ? Math.floor((Date.now() - this.state.stats.connectionStartTime) / 1000)
            : 0,
        },
      };
      this.emit();
    }, 1000);
  }

  private stopStatsTracking(): void {
    if (statsInterval) {
      clearInterval(statsInterval);
      statsInterval = null;
    }
  }

  // ── Feature Toggles ──────────────────────────────────────────────────────

  toggleKillSwitch(enabled: boolean): void {
    this.state = { ...this.state, killSwitch: enabled };
    this.emit();
  }

  toggleSplitTunneling(enabled: boolean): void {
    this.state = { ...this.state, splitTunneling: enabled };
    this.emit();
  }

  setSplitTunnelApps(apps: string[]): void {
    this.state = { ...this.state, splitTunnelApps: apps };
    this.emit();
  }

  toggleDnsLeakProtection(enabled: boolean): void {
    this.state = { ...this.state, dnsLeakProtection: enabled };
    this.emit();
  }

  toggleAutoConnect(enabled: boolean): void {
    this.state = { ...this.state, autoConnect: enabled };
    this.emit();
  }

  // ── Favorites ────────────────────────────────────────────────────────────

  toggleFavorite(serverId: string): void {
    const favs = new Set(this.state.favorites);
    if (favs.has(serverId)) {
      favs.delete(serverId);
    } else {
      favs.add(serverId);
    }
    this.state = { ...this.state, favorites: [...favs] };
    this.emit();
  }

  isFavorite(serverId: string): boolean {
    return this.state.favorites.includes(serverId);
  }

  getFavorites(): VPNServer[] {
    return this.state.favorites
      .map(id => this.getServerById(id))
      .filter((s): s is VPNServer => s !== undefined);
  }

  // ── DNS Leak Test ────────────────────────────────────────────────────────

  async testDnsLeak(): Promise<{
    protected: boolean;
    dnsServers: Array<{ ip: string; location: string; isp: string }>;
  }> {
    await delay(randomBetween(1500, 2500));

    if (this.state.status === 'connected' && this.state.dnsLeakProtection) {
      return {
        protected: true,
        dnsServers: [
          { ip: this.state.connectionInfo?.dnsServer || '10.8.0.1', location: 'Secure VPN DNS', isp: 'VeeShield DNS' },
        ],
      };
    }

    return {
      protected: false,
      dnsServers: [
        { ip: '8.8.8.8', location: 'United States', isp: 'Google LLC' },
        { ip: '1.1.1.1', location: 'Australia', isp: 'Cloudflare Inc.' },
        { ip: '192.168.1.1', location: 'Local Network', isp: 'ISP Router' },
      ],
    };
  }

  // ── Utilities ────────────────────────────────────────────────────────────

  getProtocolInfo(protocol: VPNProtocol) {
    return PROTOCOL_CONFIG[protocol];
  }

  getAllProtocols(): VPNProtocol[] {
    return ['wireguard', 'openvpn_tcp', 'openvpn_udp', 'ikev2'];
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  }

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  }
}

// ── Singleton ───────────────────────────────────────────────────────────────────

export const vpnEngine = new VPNEngine();

export default vpnEngine;
