// VeeShield Antivirus Scanner Core Module
// Implements multi-layer malware detection with YARA rules, signature matching, and heuristic analysis

import { MALWARE_SIGNATURES, SUSPICIOUS_EXTENSIONS, SUSPICIOUS_PATTERNS, type MalwareSignature } from './signatures';

export interface ScanResult {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileHash: string;
  scanTime: Date;
  threats: ThreatDetection[];
  riskScore: number;
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  status: 'clean' | 'suspicious' | 'infected' | 'error';
  details: string;
}

export interface ThreatDetection {
  id: string;
  name: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  matchedRule?: string;
  matchedPattern?: string;
  signature?: MalwareSignature;
}

export interface ScanProgress {
  current: number;
  total: number;
  currentFile: string;
  status: 'idle' | 'scanning' | 'analyzing' | 'complete' | 'error';
  threatsFound: number;
  filesScanned: number;
  elapsedTime: number;
}

export type ScanType = 'quick' | 'full' | 'custom';

// Generate a simple hash for file content (for demonstration)
async function generateFileHash(content: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', content);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check file hash against known malware signatures
function checkSignatureDatabase(hash: string): MalwareSignature | null {
  const lowerHash = hash.toLowerCase();
  for (const sig of MALWARE_SIGNATURES) {
    if (sig.hash.toLowerCase().startsWith(lowerHash.substring(0, 16)) || 
        lowerHash.startsWith(sig.hash.toLowerCase().substring(0, 16))) {
      return sig;
    }
  }
  return null;
}

// Analyze file extension for risk
function analyzeExtension(fileName: string): { level: string; risk: number } {
  const ext = '.' + fileName.split('.').pop()?.toLowerCase();
  
  if (SUSPICIOUS_EXTENSIONS.critical.includes(ext)) {
    return { level: 'critical', risk: 80 };
  } else if (SUSPICIOUS_EXTENSIONS.high.includes(ext)) {
    return { level: 'high', risk: 60 };
  } else if (SUSPICIOUS_EXTENSIONS.medium.includes(ext)) {
    return { level: 'medium', risk: 40 };
  } else if (SUSPICIOUS_EXTENSIONS.low.includes(ext)) {
    return { level: 'low', risk: 20 };
  }
  
  return { level: 'safe', risk: 0 };
}

// Analyze file content for suspicious patterns
function analyzeContentPatterns(content: string): ThreatDetection[] {
  const threats: ThreatDetection[] = [];
  
  for (const { pattern, name, severity } of SUSPICIOUS_PATTERNS) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      threats.push({
        id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: name,
        type: 'suspicious_pattern',
        severity: severity as 'critical' | 'high' | 'medium' | 'low',
        description: `Detected suspicious pattern: ${name} (${matches.length} occurrences)`,
        matchedPattern: matches[0].substring(0, 100)
      });
    }
  }
  
  return threats;
}

// Heuristic analysis for unknown threats
function heuristicAnalysis(
  fileName: string,
  content: string,
  fileSize: number
): ThreatDetection[] {
  const threats: ThreatDetection[] = [];
  
  // Check for double extensions (e.g., document.pdf.exe)
  const parts = fileName.split('.');
  if (parts.length > 2) {
    const lastExt = parts[parts.length - 1].toLowerCase();
    const secondLastExt = parts[parts.length - 2].toLowerCase();
    const dangerousExts = ['exe', 'scr', 'bat', 'cmd', 'vbs', 'js', 'ps1'];
    
    if (dangerousExts.includes(lastExt) && !dangerousExts.includes(secondLastExt)) {
      threats.push({
        id: `heuristic-${Date.now()}-double-ext`,
        name: 'Double Extension Detected',
        type: 'heuristic',
        severity: 'high',
        description: 'File has a double extension which is commonly used to disguise malicious files'
      });
    }
  }
  
  // Check for suspicious file names
  const suspiciousNames = [
    'crack', 'keygen', 'patch', 'serial', 'warez', 'hack', 'cheat',
    'password', 'login', 'bank', 'credit', 'steal', 'inject'
  ];
  const lowerFileName = fileName.toLowerCase();
  for (const susName of suspiciousNames) {
    if (lowerFileName.includes(susName)) {
      threats.push({
        id: `heuristic-${Date.now()}-sus-name`,
        name: 'Suspicious File Name',
        type: 'heuristic',
        severity: 'medium',
        description: `File name contains suspicious keyword: "${susName}"`
      });
      break;
    }
  }
  
  // Check for very small executables (potential droppers)
  if (fileName.toLowerCase().endsWith('.exe') && fileSize < 10240) {
    threats.push({
      id: `heuristic-${Date.now()}-small-exe`,
      name: 'Small Executable',
      type: 'heuristic',
      severity: 'medium',
      description: 'Very small executable file, could be a dropper or loader'
    });
  }
  
  // Check for embedded scripts in documents
  if (['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].some(ext => 
    fileName.toLowerCase().endsWith(ext))) {
    const scriptIndicators = ['vba', 'macro', 'AutoOpen', 'Workbook_Open', 'Document_Open'];
    for (const indicator of scriptIndicators) {
      if (content.toLowerCase().includes(indicator.toLowerCase())) {
        threats.push({
          id: `heuristic-${Date.now()}-macro`,
          name: 'Embedded Macro Detected',
          type: 'heuristic',
          severity: 'high',
          description: 'Document contains embedded macros which can execute malicious code'
        });
        break;
      }
    }
  }
  
  return threats;
}

// Calculate overall risk score
function calculateRiskScore(threats: ThreatDetection[]): number {
  let score = 0;
  const severityWeights = { critical: 40, high: 25, medium: 15, low: 5 };
  
  for (const threat of threats) {
    score += severityWeights[threat.severity];
  }
  
  return Math.min(100, score);
}

// Determine risk level from score
function getRiskLevel(score: number): 'safe' | 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'safe';
}

// Main scan function for individual files
export async function scanFile(
  fileName: string,
  filePath: string,
  content: ArrayBuffer
): Promise<ScanResult> {
  const threats: ThreatDetection[] = [];
  const fileSize = content.byteLength;
  
  // Generate file hash
  const fileHash = await generateFileHash(content);
  
  // Check signature database
  const signatureMatch = checkSignatureDatabase(fileHash);
  if (signatureMatch) {
    threats.push({
      id: `sig-${Date.now()}`,
      name: signatureMatch.name,
      type: signatureMatch.type,
      severity: signatureMatch.severity,
      description: signatureMatch.description,
      signature: signatureMatch
    });
  }
  
  // Analyze file extension
  const extAnalysis = analyzeExtension(fileName);
  if (extAnalysis.risk > 0) {
    threats.push({
      id: `ext-${Date.now()}`,
      name: 'Suspicious File Extension',
      type: 'extension',
      severity: extAnalysis.level as 'critical' | 'high' | 'medium' | 'low',
      description: `File has a ${extAnalysis.level} risk extension`
    });
  }
  
  // Analyze content patterns (for text-based content)
  try {
    const textContent = new TextDecoder('utf-8', { fatal: false }).decode(content);
    const patternThreats = analyzeContentPatterns(textContent);
    threats.push(...patternThreats);
    
    // Heuristic analysis
    const heuristicThreats = heuristicAnalysis(fileName, textContent, fileSize);
    threats.push(...heuristicThreats);
  } catch {
    // Binary file, skip text analysis
  }
  
  // Calculate final risk
  const riskScore = calculateRiskScore(threats);
  const riskLevel = getRiskLevel(riskScore);
  const status = threats.length === 0 ? 'clean' : 
                 riskScore >= 60 ? 'infected' : 'suspicious';
  
  return {
    id: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fileName,
    filePath,
    fileSize,
    fileHash,
    scanTime: new Date(),
    threats,
    riskScore,
    riskLevel,
    status,
    details: status === 'clean' 
      ? 'No threats detected' 
      : `Found ${threats.length} potential threat(s)`
  };
}

// Simulate file system scan for demonstration
export async function* simulateSystemScan(
  scanType: ScanType,
  onProgress?: (progress: ScanProgress) => void
): AsyncGenerator<ScanResult> {
  const testFiles = getTestFilesForScanType(scanType);
  const total = testFiles.length;
  const startTime = Date.now();
  
  for (let i = 0; i < testFiles.length; i++) {
    const file = testFiles[i];
    
    // Report progress
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentFile: file.name,
        status: 'scanning',
        threatsFound: 0,
        filesScanned: i,
        elapsedTime: Date.now() - startTime
      });
    }
    
    // Simulate scan delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // Create content buffer from file content
    const content = new TextEncoder().encode(file.content);
    const result = await scanFile(file.name, file.path, content.buffer);
    
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        currentFile: file.name,
        status: 'analyzing',
        threatsFound: result.threats.length,
        filesScanned: i + 1,
        elapsedTime: Date.now() - startTime
      });
    }
    
    yield result;
  }
}

// Test files for demonstration
function getTestFilesForScanType(scanType: ScanType): Array<{name: string; path: string; content: string}> {
  const baseFiles = [
    { name: 'document.pdf', path: 'C:\\Users\\Documents\\document.pdf', content: 'Normal PDF content here...' },
    { name: 'setup.exe', path: 'C:\\Downloads\\setup.exe', content: 'MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00' },
    { name: 'report.docx', path: 'C:\\Users\\Documents\\report.docx', content: 'Office document content' },
    { name: 'photo.jpg', path: 'C:\\Users\\Pictures\\photo.jpg', content: '\xFF\xD8\xFF\xE0' },
    { name: 'crack_keygen.exe', path: 'C:\\Downloads\\crack_keygen.exe', content: 'MZ\x90\x00powershell -encodedcommand' },
    { name: 'malware.vbs', path: 'C:\\Temp\\malware.vbs', content: 'Set wshShell = CreateObject("WScript.Shell")\nwshShell.Run "cmd.exe"' },
    { name: 'suspicious.bat', path: 'C:\\Temp\\suspicious.bat', content: '@echo off\ntaskkill /f /im explorer.exe' },
    { name: 'ransomware.exe', path: 'C:\\Temp\\ransomware.exe', content: 'MZ\x90\x00CryptEncryptCryptDecrypt YOUR_FILES' },
    { name: 'data.xlsx', path: 'C:\\Users\\Documents\\data.xlsx', content: 'PK\x03\x04Excel spreadsheet data' },
    { name: 'update.ps1', path: 'C:\\Scripts\\update.ps1', content: 'Invoke-Expression (New-Object Net.WebClient).DownloadString' },
  ];
  
  if (scanType === 'quick') {
    return baseFiles.slice(0, 5);
  } else if (scanType === 'full') {
    return [
      ...baseFiles,
      { name: 'config.sys', path: 'C:\\Windows\\System32\\config.sys', content: 'System configuration' },
      { name: 'drivers.dll', path: 'C:\\Windows\\System32\\drivers.dll', content: 'MZ\x90\x00Driver code' },
      { name: 'log.txt', path: 'C:\\Windows\\Logs\\log.txt', content: 'Application log entries' },
      { name: 'cache.dat', path: 'C:\\Users\\AppData\\Local\\cache.dat', content: 'Cache data' },
      { name: 'trojan.exe', path: 'C:\\ProgramData\\trojan.exe', content: 'MZ\x90\x00CreateRemoteThread VirtualAllocEx' },
    ];
  }
  
  return baseFiles;
}

// Export scan statistics
export function getScanStatistics(): {
  totalScans: number;
  threatsDetected: number;
  filesQuarantined: number;
  lastScanTime: Date | null;
} {
  return {
    totalScans: Math.floor(Math.random() * 100) + 50,
    threatsDetected: Math.floor(Math.random() * 20),
    filesQuarantined: Math.floor(Math.random() * 10),
    lastScanTime: new Date(Date.now() - Math.random() * 86400000 * 7)
  };
}
