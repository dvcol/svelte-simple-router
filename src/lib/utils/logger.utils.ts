import { LogLevel, ProxyLogger, toLogLevel } from '@dvcol/common-utils/common/logger';

export const LoggerKey = 'SR Router' as const;

export class Logger {
  static logger = new ProxyLogger({ logLevel: LogLevel.Warn });

  static colorize = ProxyLogger.colorize;

  static setLogLevel(logLevel: LogLevel | keyof typeof LogLevel) {
    if (typeof logLevel === 'string') this.logger.logLevel = toLogLevel(logLevel);
    else this.logger.logLevel = logLevel;
  }

  static get timestamp() {
    return ProxyLogger.timestamp();
  }

  static get trace() {
    return this.logger.trace;
  }

  static get debug() {
    return this.logger.debug;
  }

  static get info() {
    return this.logger.info;
  }

  static get warn() {
    return this.logger.warn;
  }

  static get error() {
    return this.logger.error;
  }
}

export { LogLevel } from '@dvcol/common-utils/common/logger';
