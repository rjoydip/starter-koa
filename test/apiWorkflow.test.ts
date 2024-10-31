import type { Server } from 'node:http'
import { runFromFile } from '@stepci/runner'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import config from '../src/config.ts'
import { createServer } from '../src/server.ts'

describe('⬢ Validate API test', async () => {
  let server: Server

  beforeAll(() => {
    server = createServer()
    server.listen(config.port)
  })

  afterAll(() => {
    server.close()
  })

  it('check Response Status', async () => {
    const { result } = await runFromFile('./test/workflow.yml')
    expect(result.passed).toBe(true)
  })
})
