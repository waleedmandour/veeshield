// VeeShield Clean Service - Client-side service layer for clean operations
// Replaces API route calls with direct lib function calls for static export (Electron) compatibility

import {
  CLEAN_TARGETS,
  DEEP_CLEAN_TARGETS,
  scanCleanTargets,
  performClean,
  getQuickCleanTargets,
  calculateTotalCleanableSpace,
  formatBytes,
  type CleanOptions,
  type CleanTarget,
  type CleanResult,
} from '@/lib/cleaner';

export interface CleanServiceOptions {
  targets?: string[];
  deepClean?: boolean;
  secureDelete?: boolean;
  createRestorePoint?: boolean;
  excludePaths?: string[];
}

/**
 * Scan for clean targets
 * Returns the same shape as the /api/clean POST with action 'scan_targets'
 */
export async function scanTargets() {
  const allTargets = [...CLEAN_TARGETS, ...DEEP_CLEAN_TARGETS];
  const scannedTargets = await scanCleanTargets(allTargets);

  return {
    success: true as const,
    targets: scannedTargets,
    summary: calculateTotalCleanableSpace(scannedTargets),
  };
}

/**
 * Start cleaning selected targets
 * Returns the same shape as the /api/clean POST with action 'start_clean'
 */
export async function startClean(options: CleanServiceOptions) {
  const cleanOptions: CleanOptions = {
    targets: options.targets || CLEAN_TARGETS.filter(t => t.enabled).map(t => t.id),
    deepClean: options.deepClean || false,
    secureDelete: options.secureDelete || false,
    createRestorePoint: options.createRestorePoint || false,
    excludePaths: options.excludePaths || [],
  };

  const results: CleanResult[] = await performClean(cleanOptions);

  const totalFreed = results.reduce((sum, r) => sum + r.spaceFreed, 0);
  const totalDeleted = results.reduce((sum, r) => sum + r.filesDeleted, 0);

  return {
    success: true as const,
    results,
    summary: {
      totalSpaceFreed: totalFreed,
      totalSpaceFreedFormatted: formatBytes(totalFreed),
      totalFilesDeleted: totalDeleted,
      targetsCleaned: results.filter(r => r.status === 'success').length,
      targetsFailed: results.filter(r => r.status === 'failed').length,
    },
  };
}

/**
 * Quick clean - scans and cleans safe targets only
 * Returns the same shape as the /api/clean POST with action 'quick_clean'
 */
export async function quickClean() {
  const quickTargets = getQuickCleanTargets();
  const scannedTargets = await scanCleanTargets(quickTargets);

  const cleanOptions: CleanOptions = {
    targets: scannedTargets.map(t => t.id),
    deepClean: false,
    secureDelete: false,
    createRestorePoint: false,
    excludePaths: [],
  };

  const results = await performClean(cleanOptions);
  const totalFreed = results.reduce((sum, r) => sum + r.spaceFreed, 0);

  return {
    success: true as const,
    results,
    summary: {
      totalSpaceFreed: totalFreed,
      totalSpaceFreedFormatted: formatBytes(totalFreed),
      totalFilesDeleted: results.reduce((sum, r) => sum + r.filesDeleted, 0),
    },
  };
}

export type { CleanTarget, CleanResult, CleanOptions, CleanServiceOptions };
