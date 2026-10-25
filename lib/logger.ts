// Phase 14: Centralized Error Handling & Structured Logging
// This prevents stack traces from leaking to the frontend or logs,
// and ensures a consistent log format for debugging (e.g. Datadog, ELK).

type LogLevel = 'info' | 'warn' | 'error';

interface LogPayload {
  message: string;
  context?: Record<string, any>;
  error?: any;
}

class Logger {
  private log(level: LogLevel, payload: LogPayload) {
    const timestamp = new Date().toISOString();
    
    // Sanitize error objects to prevent leaking secrets in logs
    let safeError = payload.error;
    if (payload.error instanceof Error) {
      safeError = {
        name: payload.error.name,
        message: payload.error.message,
        // Only include stack trace in dev
        stack: process.env.NODE_ENV === 'development' ? payload.error.stack : undefined,
      };
    }

    const logEntry = {
      timestamp,
      level,
      message: payload.message,
      context: payload.context,
      error: safeError,
    };

    // Output structured JSON for log aggregators
    if (level === 'error') {
      console.error(JSON.stringify(logEntry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', { message, context });
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', { message, context });
  }

  error(message: string, error?: any, context?: Record<string, any>) {
    this.log('error', { message, error, context });
  }
}

export const logger = new Logger();
