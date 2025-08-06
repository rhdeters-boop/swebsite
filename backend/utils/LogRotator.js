import fs from 'fs';
import path from 'path';

/**
 * Simple log rotation utility
 * Rotates log files when they exceed a certain size
 */
class LogRotator {
  constructor(logPath, maxSize = 10 * 1024 * 1024) { // 10MB default
    this.logPath = logPath;
    this.maxSize = maxSize;
  }

  /**
   * Check if log file needs rotation and rotate if necessary
   */
  rotateIfNeeded() {
    try {
      if (!fs.existsSync(this.logPath)) {
        return;
      }

      const stats = fs.statSync(this.logPath);
      if (stats.size > this.maxSize) {
        this.rotate();
      }
    } catch (error) {
      console.error('Error checking log file for rotation:', error);
    }
  }

  /**
   * Rotate the log file
   */
  rotate() {
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const ext = path.extname(this.logPath);
      const baseName = path.basename(this.logPath, ext);
      const dir = path.dirname(this.logPath);
      
      const rotatedPath = path.join(dir, `${baseName}-${timestamp}${ext}`);
      
      // Move current log to rotated file
      fs.renameSync(this.logPath, rotatedPath);
      
      // Create new empty log file
      fs.writeFileSync(this.logPath, '');
      
      console.log(`📋 Log rotated: ${path.basename(rotatedPath)}`);
      
      // Clean up old log files (keep only last 5)
      this.cleanupOldLogs(dir, baseName, ext);
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  /**
   * Remove old rotated log files, keeping only the most recent ones
   */
  cleanupOldLogs(dir, baseName, ext, keepCount = 5) {
    try {
      const files = fs.readdirSync(dir)
        .filter(file => file.startsWith(baseName) && file.endsWith(ext) && file.includes('-'))
        .sort()
        .reverse(); // Most recent first

      // Remove files beyond the keep count
      files.slice(keepCount).forEach(file => {
        const filePath = path.join(dir, file);
        fs.unlinkSync(filePath);
        console.log(`🗑️  Cleaned up old log: ${file}`);
      });
    } catch (error) {
      console.error('Error cleaning up old logs:', error);
    }
  }
}

export default LogRotator;
