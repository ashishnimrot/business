/**
 * API Route for Writing API Request/Response Logs to File
 * 
 * This endpoint receives logs from the client-side API logger and writes them
 * to a log file on disk. Only enabled in development mode.
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'api-requests.log');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB max file size

// Ensure log directory exists
function ensureLogDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Rotate log file if it gets too large
function rotateLogIfNeeded(): void {
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > MAX_LOG_SIZE) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const rotatedFile = path.join(LOG_DIR, `api-requests-${timestamp}.log`);
      fs.renameSync(LOG_FILE, rotatedFile);
    }
  }
}

// Format log entry for file output
function formatLogEntry(entry: any): string {
  const timestamp = new Date(entry.timestamp).toISOString();
  const lines = [
    `[${timestamp}] ${entry.type.toUpperCase()} - ${entry.method} ${entry.url}`,
  ];
  
  if (entry.duration) {
    lines.push(`  Duration: ${entry.duration}ms`);
  }
  if (entry.status) {
    lines.push(`  Status: ${entry.status} ${entry.statusText || ''}`);
  }
  if (entry.headers && Object.keys(entry.headers).length > 0) {
    lines.push(`  Headers: ${JSON.stringify(entry.headers)}`);
  }
  if (entry.data) {
    lines.push(`  Data: ${JSON.stringify(entry.data, null, 2)}`);
  }
  if (entry.error) {
    lines.push(`  Error: ${JSON.stringify(entry.error, null, 2)}`);
  }
  
  return lines.join('\n') + '\n' + '='.repeat(80) + '\n';
}

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Logging disabled in production' },
      { status: 403 }
    );
  }

  try {
    const entry = await request.json();
    
    ensureLogDir();
    rotateLogIfNeeded();
    
    const logLine = formatLogEntry(entry);
    fs.appendFileSync(LOG_FILE, logLine, 'utf8');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Log API] Error writing log:', error);
    return NextResponse.json(
      { error: 'Failed to write log' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if logging is enabled
export async function GET() {
  return NextResponse.json({
    enabled: process.env.NODE_ENV !== 'production',
    logFile: process.env.NODE_ENV !== 'production' ? LOG_FILE : null,
  });
}

