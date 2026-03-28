/**
 * Logger simple pour NORMX Legal
 * Niveau, timestamp, module — sans dependance externe
 */

type LogLevel = "info" | "warn" | "error" | "debug";

function timestamp(): string {
  return new Date().toISOString();
}

function log(level: LogLevel, module: string, message: string, ...args: unknown[]) {
  const prefix = `[${timestamp()}] [${level.toUpperCase()}] [${module}]`;
  if (level === "error") {
    console.error(prefix, message, ...args);
  } else if (level === "warn") {
    console.warn(prefix, message, ...args);
  } else {
    console.log(prefix, message, ...args);
  }
}

export function createLogger(module: string) {
  return {
    info: (message: string, ...args: unknown[]) => log("info", module, message, ...args),
    warn: (message: string, ...args: unknown[]) => log("warn", module, message, ...args),
    error: (message: string, ...args: unknown[]) => log("error", module, message, ...args),
    debug: (message: string, ...args: unknown[]) => log("debug", module, message, ...args),
  };
}
