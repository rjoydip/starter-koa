import type { Server } from 'node:http'
import config from '../app.config'
import { app } from './app'
import { initDB } from './db'
import logger from './logger'

export async function startServer(): Promise<Server> {
  const port = config?.server?.port || 3000

  await initDB()

  const server = app.listen(port, () => {
    logger.ready(`Server running on port ${port}`)
  })

  return server
}

if (require.main === module) {
  startServer()
    .then(() => logger.ready('Server started successfully'))
    .catch(err => logger.error('Error starting server', err))
}
