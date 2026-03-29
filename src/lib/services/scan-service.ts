// VeeShield Scan Service - Client-side service layer for scan operations
// Replaces API route calls with direct lib function calls for static export (Electron) compatibility

import {
  scanFile,
  simulateSystemScan,
  getScanStatistics,
  type ScanResult,
  type ScanType,
} from '@/lib/antivirus/scanner';

/**
 * Start a system scan and collect all results
 * Returns the same shape as the /api/scan POST with action 'start_system_scan'
 */
export async function startSystemScan(scanType: 'quick' | 'full' | 'custom') {
  const results: ScanResult[] = [];

  for await (const result of simulateSystemScan(scanType)) {
    results.push(result);
  }

  return {
    success: true as const,
    scanType: scanType as ScanType,
    results,
    summary: {
      totalScanned: results.length,
      threatsFound: results.filter(r => r.status !== 'clean').length,
      cleanFiles: results.filter(r => r.status === 'clean').length,
      infectedFiles: results.filter(r => r.status === 'infected').length,
      suspiciousFiles: results.filter(r => r.status === 'suspicious').length,
    },
  };
}

/**
 * Scan a single file
 * Returns the same shape as the /api/scan POST with action 'scan_file'
 */
export async function scanFileContent(
  fileName: string,
  filePath: string,
  content: ArrayBuffer
) {
  const result = await scanFile(fileName, filePath, content);

  return {
    success: true as const,
    result,
  };
}

/**
 * Get scan statistics
 * Returns the same shape as the /api/scan GET or POST with action 'get_statistics'
 */
export async function getScanStatisticsData() {
  const stats = getScanStatistics();

  return {
    success: true as const,
    statistics: stats,
    capabilities: {
      scanTypes: ['quick', 'full', 'custom'],
      features: ['signature_detection', 'heuristic_analysis', 'yara_rules'],
    },
  };
}

export type { ScanResult, ScanType };
