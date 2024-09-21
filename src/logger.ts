import { createConsola } from 'consola'
import config from '../app.config'

const logger = createConsola({
  level: config?.log_level,
})

export default logger
