/**
 * Centralized Logging and Error Handling System
 * Provides consistent logging with levels, buffering, and production mode support
 * @class
 */
class Logger {
    /**
     * Log levels enum
     * @enum {number}
     * @readonly
     */
    static LEVELS = {
        TRACE: -1,   // Per-roll, per-die diagnostics — enable via ?verbose=1
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    };

    /** Verbose mode (hot-path logs). Enabled via ?verbose=1 or ?debug=1 in URL. */
    static get verbose() {
        if (typeof window === 'undefined') return false;
        const params = new URLSearchParams(window.location.search);
        return params.has('verbose') || params.has('debug');
    }

    /**
     * Trace message — only when ?verbose=1. Use for roll/score/UI hot-path diagnostics.
     */
    static trace(message, data = null) {
        if (this.verbose && this.currentLevel <= this.LEVELS.DEBUG) {
            console.log(`[TRACE] ${message}`, data || '');
            this.addToBuffer('TRACE', message, data);
        }
    }

    /**
     * Current minimum log level (messages below this are suppressed)
     * Set to WARN in production for cleaner console
     * @type {number}
     */
    static currentLevel = Logger.LEVELS.DEBUG;

    /**
     * Log buffer for recent messages (useful for debugging)
     * @type {Array<{level: string, message: string, data: *, timestamp: number}>}
     */
    static buffer = [];

    /**
     * Maximum buffer size (prevents memory bloat)
     * @type {number}
     */
    static maxBufferSize = 100;

    /**
     * Initialize logger (called automatically)
     */
    static initialize() {
        // Auto-detect production mode
        if (this.isProduction()) {
            this.currentLevel = this.LEVELS.WARN;
            console.log('[Logger] Production mode detected - log level set to WARN');
        } else {
            console.log('[Logger] Development mode detected - log level set to DEBUG');
        }
    }

    /**
     * Log a debug message (development only)
     * @param {string} message - Message to log
     * @param {*} [data=null] - Optional data to log
     */
    static debug(message, data = null) {
        if (this.currentLevel <= this.LEVELS.DEBUG) {
            console.log(`[DEBUG] ${message}`, data || '');
            this.addToBuffer('DEBUG', message, data);
        }
    }

    /**
     * Log an informational message
     * @param {string} message - Message to log
     * @param {*} [data=null] - Optional data to log
     */
    static info(message, data = null) {
        if (this.currentLevel <= this.LEVELS.INFO) {
            console.log(`[INFO] ${message}`, data || '');
            this.addToBuffer('INFO', message, data);
        }
    }

    /**
     * Log a warning
     * @param {string} message - Warning message
     * @param {*} [data=null] - Optional data to log
     */
    static warn(message, data = null) {
        if (this.currentLevel <= this.LEVELS.WARN) {
            console.warn(`[WARN] ${message}`, data || '');
            this.addToBuffer('WARN', message, data);
        }
    }

    /**
     * Log an error
     * @param {string} message - Error message
     * @param {Error|*} [error=null] - Error object or additional data
     */
    static error(message, error = null) {
        if (this.currentLevel <= this.LEVELS.ERROR) {
            console.error(`[ERROR] ${message}`, error || '');
            this.addToBuffer('ERROR', message, error);
        }
    }

    /**
     * Log a critical error (game-breaking)
     * @param {string} message - Critical error message
     * @param {Error} error - Error object
     */
    static critical(message, error) {
        console.error(`[CRITICAL] ${message}`, error);
        this.addToBuffer('CRITICAL', message, error);
        
        // Could trigger error reporting here
        // Could show user-friendly error dialog
        // Could attempt to save game state
    }

    /**
     * Add message to buffer
     * @private
     * @param {string} level - Log level
     * @param {string} message - Message
     * @param {*} data - Additional data
     */
    static addToBuffer(level, message, data) {
        this.buffer.push({
            level,
            message,
            data,
            timestamp: Date.now()
        });

        // Trim buffer if too large
        if (this.buffer.length > this.maxBufferSize) {
            this.buffer = this.buffer.slice(-this.maxBufferSize);
        }
    }

    /**
     * Get recent log messages
     * @param {number} [count=50] - Number of recent messages to return
     * @returns {Array<Object>} Recent log entries
     */
    static getRecentLogs(count = 50) {
        return this.buffer.slice(-count);
    }

    /**
     * Export all logs as formatted text
     * Useful for bug reports
     * @returns {string} Formatted log text
     */
    static exportLogs() {
        const header = `=== DICE OF DIONYSUS LOG EXPORT ===\nGenerated: ${new Date().toISOString()}\n\n`;
        const logs = this.buffer.map(log => {
            const timestamp = new Date(log.timestamp).toISOString();
            return `[${timestamp}] [${log.level}] ${log.message}`;
        }).join('\n');
        
        return header + logs;
    }

    /**
     * Clear the log buffer
     */
    static clearBuffer() {
        this.buffer = [];
        console.log('[Logger] Buffer cleared');
    }

    /**
     * Detect if running in production environment
     * @returns {boolean} True if production
     */
    static isProduction() {
        const hostname = window.location.hostname;
        return !hostname.includes('localhost') && 
               !hostname.includes('127.0.0.1') && 
               hostname !== '';
    }

    /**
     * Set log level dynamically
     * @param {number} level - Log level from Logger.LEVELS
     */
    static setLevel(level) {
        this.currentLevel = level;
        console.log(`[Logger] Log level set to ${level}`);
    }

    /**
     * Create a downloadable log file
     * Triggers browser download
     */
    static downloadLogs() {
        const logText = this.exportLogs();
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dice-of-dionysus-logs-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('[Logger] Logs downloaded');
    }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
    Logger.initialize();
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Logger;
}

