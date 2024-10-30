import { exit } from 'node:process'
import autocannon from 'autocannon'
import getPort from 'get-port'
import logger from '../src/logger'
import { createServer } from '../src/server'

(async () => {
  const port = await getPort()
  const server = createServer()
  server.listen(port, () => {
    const instance = autocannon({
      url: `http://127.0.0.1:${port}`,
      connections: 1,
      duration: 10,
      requests: [
        {
          method: 'GET',
          path: '/health',
        },
      ],
    }, (err) => {
      logger.log('finished bench', err)
      exit(0)
    })

    autocannon.track(instance)
  })
})()
