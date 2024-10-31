import { exit } from 'node:process'
import autocannon from 'autocannon'
import getPort from 'get-port'
import logger from '../src/logger'
import { createServer } from '../src/server'

/**
 * Initializes and starts an HTTP server, runs a load test on it using autocannon,
 * and logs results before gracefully shutting down.
 */
(async () => {
  // Dynamically assigns an available port for the server
  const port = await getPort()

  // Creates and starts the server
  const server = createServer()
  server.listen(port, () => {
    /**
     * Sets up and runs a load test on the server using autocannon.
     * @param {string} url - The server URL with the dynamically assigned port.
     * @param {number} connections - Number of concurrent connections.
     * @param {number} duration - Test duration in seconds.
     * @param {Array} requests - Array of request configurations to benchmark.
     * @param {Function} callback - Callback triggered upon test completion or error.
     */
    const instance = autocannon(
      {
        url: `http://127.0.0.1:${port}`, // Target URL for benchmarking
        connections: 1, // Simulates 1 concurrent connection
        duration: 10, // Duration of the test in seconds
        requests: [
          {
            method: 'GET', // HTTP method used in the request
            path: '/health', // Endpoint path to test
          },
        ],
      },
      (err) => {
        // Logs the completion of the benchmark test
        logger.log('finished bench', err)
        exit(0) // Exits the process
      },
    )

    // Tracks the autocannon benchmark progress and results
    autocannon.track(instance)
  })
})()
