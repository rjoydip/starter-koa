import type { THooksMapper, UserInput } from './types'
import { defineHooks } from 'crossws'
import crossws from 'crossws/adapters/node'
import queryString from 'query-string'
import hooks from './hooks'
import logger from './logger'
import { captureException } from './utils'

const hooksMapper: {
  [x in THooksMapper]: (id?: number | null, input?: UserInput) => Promise<any>
} = {
  health: async () => await hooks.callHook('health'),
  _metrics: async () => await hooks.callHook('_metrics'),
  _meta: async () => await hooks.callHook('_meta'),
  getUsers: async () => await hooks.callHook('getUsers'),
  getUser: async id => await hooks.callHook('getUser', id),
  createUser: async (_, input) => await hooks.callHook('createUser', input),
  updateUser: async (id, input) => await hooks.callHook('updateUser', id, input),
  deleteUser: async id => await hooks.callHook('deleteUser', id),
}

export const ws = crossws({
  hooks: defineHooks({
    open(peer) {
      logger.log(`[ws] open: ${peer.id}`)
    },

    async message(peer, message) {
      logger.log('[ws] message', peer.id, message.text())
      const qs = queryString.parse(message.text(), {
        arrayFormat: 'bracket-separator',
        arrayFormatSeparator: '|',
        parseNumbers: true,
        parseBooleans: true,
        types: {
          method: 'string',
          id: 'number',
          input: 'string',
        },
      })
      const { method, id, ...input } = qs
      if (method === 'ping') {
        peer.send('pong')
      }
      else if (Object.keys(hooksMapper).includes(method as THooksMapper)) {
        logger.log('Hook matched:', method)
        if (input) {
          peer.send(await hooksMapper[method as THooksMapper](id as number, input))
        }
      }
      else {
        logger.log(`Hooks not matched: ${method}`)
      }
    },

    close(peer, event) {
      logger.log('[ws] close', peer.id, event)
    },

    error(peer, error) {
      logger.log('[ws] error', peer.id, error)
      captureException(`[${peer.id}]: ${error}`)
    },

    upgrade(req) {
      logger.log(`[ws] upgrading ${req.url}...`)
      return {
        headers: {},
      }
    },
  }),
})
