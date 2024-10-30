import type { ConsolaInstance } from 'consola'
import { createConsola } from 'consola'
import config from './config.ts'

/**
 * Application logger instance, configured based on environment settings.
 * Provides customizable logging levels and transports.
 *
 * @type {ConsolaInstance} logger - The configured Consola logger instance
 * @property {number} level - The logging level set from the configuration
 */
const logger: ConsolaInstance = createConsola({
  level: config?.log_level,
})

export default logger
