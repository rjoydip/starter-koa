import { createConsola } from 'consola'
import config from '../app.config'

/**
 * @type {${2:*}}
 */
const logger = createConsola({
  level: config?.log_level,
})

export default logger
