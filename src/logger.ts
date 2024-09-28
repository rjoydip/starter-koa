import { createConsola } from 'consola'
import config from './config'

/**
 * @type {${2:*}}
 */
const logger = createConsola({
  level: config?.log_level,
})

export default logger
