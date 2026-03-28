import { NextRequest, NextResponse } from 'next/server';
import {
  CLEAN_TARGETS,
  DEEP_CLEAN_TARGETS,
  scanCleanTargets,
  performClean,
  getQuickCleanTargets,
  calculateTotalCleanableSpace,
  formatBytes,
  type CleanOptions,
  type CleanTarget
} from '@/lib/cleaner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, options } = body;

    switch (action) {
      case 'scan_targets': {
        const targets = [...CLEAN_TARGETS, ...DEEP_CLEAN_TARGETS];
        const scannedTargets = await scanCleanTargets(targets);
        
        return NextResponse.json({
          success: true,
          targets: scannedTargets,
          summary: calculateTotalCleanableSpace(scannedTargets)
        });
      }

      case 'start_clean': {
        const cleanOptions: CleanOptions = {
          targets: options?.targets || CLEAN_TARGETS.filter(t => t.enabled).map(t => t.id),
          deepClean: options?.deepClean || false,
          secureDelete: options?.secureDelete || false,
          createRestorePoint: options?.createRestorePoint || false,
          excludePaths: options?.excludePaths || []
        };

        let progress = {
          current: 0,
          total: 0,
          currentTarget: '',
          status: 'idle' as const,
          totalSpaceFreed: 0,
          totalFilesDeleted: 0,
          elapsedTime: 0
        };

        const results = await performClean(cleanOptions, (p) => {
          progress = p;
        });

        const totalFreed = results.reduce((sum, r) => sum + r.spaceFreed, 0);
        const totalDeleted = results.reduce((sum, r) => sum + r.filesDeleted, 0);

        return NextResponse.json({
          success: true,
          results,
          summary: {
            totalSpaceFreed: totalFreed,
            totalSpaceFreedFormatted: formatBytes(totalFreed),
            totalFilesDeleted: totalDeleted,
            targetsCleaned: results.filter(r => r.status === 'success').length,
            targetsFailed: results.filter(r => r.status === 'failed').length
          }
        });
      }

      case 'quick_clean': {
        const quickTargets = getQuickCleanTargets();
        const scannedTargets = await scanCleanTargets(quickTargets);
        
        const cleanOptions: CleanOptions = {
          targets: scannedTargets.map(t => t.id),
          deepClean: false,
          secureDelete: false,
          createRestorePoint: false,
          excludePaths: []
        };

        const results = await performClean(cleanOptions);
        const totalFreed = results.reduce((sum, r) => sum + r.spaceFreed, 0);

        return NextResponse.json({
          success: true,
          results,
          summary: {
            totalSpaceFreed: totalFreed,
            totalSpaceFreedFormatted: formatBytes(totalFreed),
            totalFilesDeleted: results.reduce((sum, r) => sum + r.filesDeleted, 0)
          }
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Clean API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allTargets = [...CLEAN_TARGETS, ...DEEP_CLEAN_TARGETS];
    
    // Categorize targets
    const categorized: Record<string, CleanTarget[]> = {
      temp: [],
      cache: [],
      logs: [],
      browser: [],
      system: [],
      updates: []
    };

    for (const target of allTargets) {
      categorized[target.category].push(target);
    }

    return NextResponse.json({
      success: true,
      targets: allTargets,
      categorized,
      quickCleanTargets: getQuickCleanTargets().map(t => t.id)
    });
  } catch (error) {
    console.error('Clean API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
