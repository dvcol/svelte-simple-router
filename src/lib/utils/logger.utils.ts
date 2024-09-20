import { LogLevel, ProxyLogger } from '@dvcol/common-utils/common/logger';

export const LoggerKey = 'SSR Router' as const;

export class Logger {
  static logger = new ProxyLogger({ logLevel: LogLevel.Warn });

  static colorize = ProxyLogger.colorize;

  static logLevel = this.logger.logLevel;

  static get timestamp() {
    return ProxyLogger.timestamp();
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
