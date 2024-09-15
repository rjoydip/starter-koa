import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../src/app'

let server: any

describe('> Validate app', () => {
  beforeAll(() => {
    server = app.listen(3000)
  })

  afterAll(() => {
    server.close()
  })

  it('● should be listening on a port', () => {
    expect(server.listening).toBe(true)
  })
})
