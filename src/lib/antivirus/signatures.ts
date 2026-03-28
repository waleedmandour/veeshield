// VeeShield Malware Signatures Database
// This file contains known malware hashes and signatures for detection

export interface MalwareSignature {
  id: string;
  name: string;
  type: 'virus' | 'trojan' | 'worm' | 'ransomware' | 'spyware' | 'adware' | 'rootkit' | 'backdoor';
  severity: 'critical' | 'high' | 'medium' | 'low';
  hash: string;
  description: string;
  firstSeen: string;
  lastUpdated: string;
  references: string[];
}

// Known malware MD5/SHA256 hashes (sample signatures for demonstration)
// In production, these would be updated from threat intelligence feeds
export const MALWARE_SIGNATURES: MalwareSignature[] = [
  // Ransomware signatures
  {
    id: 'RW-001',
    name: 'WannaCry',
    type: 'ransomware',
    severity: 'critical',
    hash: 'ed01ebfbc9eb5bbea545af4d01bf5f10716618404de04fe1aab1c7a9',
    description: 'Ransomware that encrypts files and demands Bitcoin payment. Spreads through SMB vulnerability.',
    firstSeen: '2017-05-12',
    lastUpdated: '2024-01-15',
    references: ['https://www.malwarebytes.com/wannacry']
  },
  {
    id: 'RW-002',
    name: 'Ryuk',
    type: 'ransomware',
    severity: 'critical',
    hash: 'a7cd5e6c8b9d4f3e2a1b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    description: 'Targeted ransomware used in attacks against enterprise environments.',
    firstSeen: '2018-08-01',
    lastUpdated: '2024-02-01',
    references: ['https://www.crowdstrike.com/resources/ransomware/ryuk-ransomware/']
  },
  {
    id: 'RW-003',
    name: 'LockBit',
    type: 'ransomware',
    severity: 'critical',
    hash: 'b8de6f7a9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
    description: 'Ransomware-as-a-Service (RaaS) known for fast encryption and double extortion.',
    firstSeen: '2019-09-01',
    lastUpdated: '2024-03-01',
    references: ['https://www.cisa.gov/news-events/cybersecurity-advisories']
  },
  
  // Trojan signatures
  {
    id: 'TR-001',
    name: 'Emotet',
    type: 'trojan',
    severity: 'high',
    hash: 'c9ef7a8b6d5c4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f',
    description: 'Banking trojan that steals sensitive information and spreads through email.',
    firstSeen: '2014-06-01',
    lastUpdated: '2024-01-20',
    references: ['https://www.us-cert.gov/ncas/alerts']
  },
  {
    id: 'TR-002',
    name: 'TrickBot',
    type: 'trojan',
    severity: 'high',
    hash: 'd0f8a9b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a',
    description: 'Modular banking trojan with capabilities for credential theft and lateral movement.',
    firstSeen: '2016-10-01',
    lastUpdated: '2024-02-15',
    references: ['https://www.malwarebytes.com/trickbot']
  },
  {
    id: 'TR-003',
    name: 'QakBot',
    type: 'trojan',
    severity: 'high',
    hash: 'e1f9a0b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a',
    description: 'Banking trojan that harvests financial credentials and corporate data.',
    firstSeen: '2007-01-01',
    lastUpdated: '2024-03-10',
    references: ['https://www.cisa.gov/news-events/cybersecurity-advisories']
  },

  // Backdoor signatures
  {
    id: 'BK-001',
    name: 'CobaltStrike',
    type: 'backdoor',
    severity: 'critical',
    hash: 'f2a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    description: 'Legitimate penetration testing tool often abused by threat actors for C2 communication.',
    firstSeen: '2012-03-01',
    lastUpdated: '2024-01-25',
    references: ['https://www.cobaltstrike.com/']
  },
  {
    id: 'BK-002',
    name: 'PlugX',
    type: 'backdoor',
    severity: 'critical',
    hash: 'a3b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
    description: 'Remote access trojan used in targeted attacks for persistent access.',
    firstSeen: '2008-01-01',
    lastUpdated: '2024-02-20',
    references: ['https://www.trendmicro.com/vinfo/us/threat-encyclopedia']
  },

  // Spyware signatures
  {
    id: 'SP-001',
    name: 'FinFisher',
    type: 'spyware',
    severity: 'critical',
    hash: 'b4c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    description: 'Commercial surveillance software used for targeted monitoring.',
    firstSeen: '2011-01-01',
    lastUpdated: '2024-01-30',
    references: ['https://www.amnesty.org/en/latest/research/']
  },
  {
    id: 'SP-002',
    name: 'Pegasus',
    type: 'spyware',
    severity: 'critical',
    hash: 'c5d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3',
    description: 'Advanced mobile spyware capable of zero-click exploitation.',
    firstSeen: '2016-08-01',
    lastUpdated: '2024-03-05',
    references: ['https://www.amnesty.org/en/latest/news/2021/07/']
  },

  // Worm signatures
  {
    id: 'WM-001',
    name: 'MyDoom',
    type: 'worm',
    severity: 'high',
    hash: 'd6e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4',
    description: 'Mass-mailing worm that creates botnets for DDoS attacks.',
    firstSeen: '2004-01-26',
    lastUpdated: '2024-01-15',
    references: ['https://www.f-secure.com/v-descs/mydoom_a.shtml']
  },
  {
    id: 'WM-002',
    name: 'Conficker',
    type: 'worm',
    severity: 'high',
    hash: 'e7f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
    description: 'Worm that spreads through network shares and exploits Windows vulnerability.',
    firstSeen: '2008-11-21',
    lastUpdated: '2024-02-10',
    references: ['https://www.microsoft.com/security/portal/threat/encyclopedia/']
  },

  // Rootkit signatures
  {
    id: 'RK-001',
    name: 'ZeroAccess',
    type: 'rootkit',
    severity: 'critical',
    hash: 'f8a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    description: 'Kernel-mode rootkit that hides malicious processes and files.',
    firstSeen: '2011-07-01',
    lastUpdated: '2024-01-20',
    references: ['https://www.symantec.com/security-center/writeup']
  },

  // Adware signatures
  {
    id: 'AD-001',
    name: 'Fireball',
    type: 'adware',
    severity: 'medium',
    hash: 'a9b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7',
    description: 'Adware that hijacks browsers and can execute arbitrary code.',
    firstSeen: '2017-06-01',
    lastUpdated: '2024-02-15',
    references: ['https://www.checkpoint.com/products/threat-emulation/']
  },
  {
    id: 'AD-002',
    name: 'SearchMine',
    type: 'adware',
    severity: 'low',
    hash: 'b0c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
    description: 'Browser hijacker that redirects searches and displays ads.',
    firstSeen: '2018-01-01',
    lastUpdated: '2024-03-01',
    references: ['https://www.malwarebytes.com/adware/']
  }
];

// File extension risk levels
export const SUSPICIOUS_EXTENSIONS = {
  critical: [
    '.exe', '.scr', '.pif', '.com', '.bat', '.cmd', '.vbs', '.vbe', '.js', '.jse',
    '.wsf', '.wsh', '.msi', '.ps1', '.ps2', '.psm1', '.psd1', '.hta', '.inf'
  ],
  high: [
    '.dll', '.sys', '.ocx', '.cpl', '.drv', '.jar', '.swf', '.deb', '.rpm',
    '.dmg', '.pkg', '.app', '.run', '.bin'
  ],
  medium: [
    '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2', '.xz', '.cab', '.iso',
    '.img', '.vhd', '.vmdk'
  ],
  low: [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf',
    '.odt', '.ods', '.odp'
  ]
};

// Suspicious file patterns in content
export const SUSPICIOUS_PATTERNS = [
  // Script patterns
  { pattern: /eval\s*\(/gi, name: 'JavaScript eval()', severity: 'high' },
  { pattern: /Function\s*\(/gi, name: 'Dynamic Function creation', severity: 'high' },
  { pattern: /document\.write/gi, name: 'document.write()', severity: 'medium' },
  { pattern: /<script[^>]*>[\s\S]*?<\/script>/gi, name: 'Inline script tag', severity: 'medium' },
  
  // PowerShell patterns
  { pattern: /powershell.*-encodedcommand/gi, name: 'Encoded PowerShell', severity: 'critical' },
  { pattern: /powershell.*-executionpolicy\s+bypass/gi, name: 'PowerShell bypass', severity: 'critical' },
  { pattern: /Invoke-Expression|IEX/gi, name: 'PowerShell IEX', severity: 'high' },
  
  // Registry patterns
  { pattern: /HKEY_[A-Z_]+\\Software\\Microsoft\\Windows\\CurrentVersion\\Run/gi, name: 'Run key modification', severity: 'high' },
  
  // Network patterns
  { pattern: /https?:\/\/[^\s\"'<>]+\.(ru|cn|tk|ml|ga|cf|xyz|top|pw|cc)/gi, name: 'Suspicious TLD URL', severity: 'medium' },
  
  // Obfuscation patterns
  { pattern: /\\x[0-9a-f]{2}/gi, name: 'Hex-encoded string', severity: 'medium' },
  { pattern: /[A-Za-z0-9+\/]{40,}={0,2}/g, name: 'Base64 encoded content', severity: 'low' }
];

// Threat categories for classification
export const THREAT_CATEGORIES = {
  malware: {
    name: 'Malware',
    description: 'Malicious software designed to harm or exploit systems',
    icon: 'bug'
  },
  ransomware: {
    name: 'Ransomware',
    description: 'Encrypts files and demands payment for decryption',
    icon: 'lock'
  },
  spyware: {
    name: 'Spyware',
    description: 'Secretly monitors and collects user information',
    icon: 'eye'
  },
  trojan: {
    name: 'Trojan',
    description: 'Disguises as legitimate software to gain access',
    icon: 'shield-alert'
  },
  worm: {
    name: 'Worm',
    description: 'Self-replicating malware that spreads across networks',
    icon: 'network'
  },
  backdoor: {
    name: 'Backdoor',
    description: 'Provides unauthorized remote access to systems',
    icon: 'door-open'
  },
  rootkit: {
    name: 'Rootkit',
    description: 'Hides malicious processes and maintains persistence',
    icon: 'layers'
  },
  adware: {
    name: 'Adware',
    description: 'Displays unwanted advertisements and popups',
    icon: 'popup'
  },
  pup: {
    name: 'Potentially Unwanted Program',
    description: 'Software that may have unwanted behaviors',
    icon: 'alert-triangle'
  }
};

export default MALWARE_SIGNATURES;
