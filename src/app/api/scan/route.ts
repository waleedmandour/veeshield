import { NextRequest, NextResponse } from 'next/server';
import { scanFile, simulateSystemScan, getScanStatistics, type ScanProgress, type ScanType } from '@/lib/antivirus/scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, scanType, fileName, filePath, content } = body;

    switch (action) {
      case 'scan_file': {
        if (!fileName || !content) {
          return NextResponse.json(
            { error: 'Missing fileName or content' },
            { status: 400 }
          );
        }

        // Convert base64 content to ArrayBuffer
        const binaryContent = Uint8Array.from(atob(content), c => c.charCodeAt(0));
        const result = await scanFile(fileName, filePath || '/unknown', binaryContent.buffer);
        
        return NextResponse.json({ success: true, result });
      }

      case 'start_system_scan': {
        const type: ScanType = scanType || 'quick';
        const results = [];
        let progress: ScanProgress = {
          current: 0,
          total: 0,
          currentFile: '',
          status: 'idle',
          threatsFound: 0,
          filesScanned: 0,
          elapsedTime: 0
        };

        // Simulate the scan
        for await (const result of simulateSystemScan(type, (p) => {
          progress = p;
        })) {
          results.push(result);
        }

        return NextResponse.json({
          success: true,
          scanType: type,
          results,
          summary: {
            totalScanned: results.length,
            threatsFound: results.filter(r => r.status !== 'clean').length,
            cleanFiles: results.filter(r => r.status === 'clean').length,
            infectedFiles: results.filter(r => r.status === 'infected').length,
            suspiciousFiles: results.filter(r => r.status === 'suspicious').length
          }
        });
      }

      case 'get_statistics': {
        const stats = getScanStatistics();
        return NextResponse.json({ success: true, statistics: stats });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const stats = getScanStatistics();
    return NextResponse.json({
      success: true,
      statistics: stats,
      capabilities: {
        scanTypes: ['quick', 'full', 'custom'],
        features: ['signature_detection', 'heuristic_analysis', 'yara_rules']
      }
    });
  } catch (error) {
    console.error('Scan API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
