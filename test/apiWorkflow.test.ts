import { runFromFile } from '@stepci/runner'
import pify from 'pify'
import { describe, expect, it } from 'vitest'
import config from '../src/config.ts'
import { createGraphQLServer, createServer } from '../src/server.ts'

describe('⬢ Validate API test', async () => {
  it('check Response Status', async () => {
    const server = createServer()
    const graphqlServer = createGraphQLServer()
    await pify(server.listen(config.port))
    await pify(graphqlServer.listen(config.port + 1))
    const { result } = await runFromFile('./test/workflow.yml')
    expect(result.passed).toBe(true)
    await pify(server.close())
    await pify(graphqlServer.close())
  })
})
