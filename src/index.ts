import config from '../app.config'
import { app } from './app'
import { dbUP } from './db'
import logger from './logger'

const port = config?.server?.port
const host = config?.server?.host

app.listen(port, async () => {
  logger.ready(`Server running on http://${host}:${port}`)
  await dbUP()
})
