import type { UserSelect } from '../src/schema.ts'
import { describe, expect, it } from 'vitest'
import { getTestUser } from '../scripts/_seed.ts'
import { resolvers } from '../src/resolvers.ts'

describe('⬢ Validate resolvers', () => {
  const query = resolvers.Query
  const mutation = resolvers.Mutation

  describe('⬢ Validate main resolvers', () => {
    it('● should validate query health', async () => {
      const { health } = query
      expect(await health()).toStrictEqual({
        data: {
          db: true,
          cache: true,
        },
      })
    })

    it('● should validate query _metrics', () => {
      const { _metrics } = query
      const $ = _metrics()
      expect($).toBeDefined()
      expect($.data).toBeDefined()
      expect($.data.memoryUsage).toBeDefined()
      expect($.data.loadAverage).toBeDefined()
    })

    it('● should validate query _meta', async () => {
      const { _meta } = query
      const $ = await _meta()
      expect($).toBeDefined()
      expect($.data).toBeDefined()
      expect($.data.name).toBeDefined()
      expect($.data.license).toBeDefined()
      expect($.data.version).toBeDefined()
    })
  })

  describe('⬢ Validate user resolvers', () => {
    let id: string = ''
    it('● should validate query getUsers', async () => {
      const { getUsers } = query
      const $ = await getUsers()
      expect($).toBeDefined()
    })

    it('● should validate query getUser', async () => {
      const { getUser } = query
      const $ = await getUser(null, { id: '111' })
      expect($).toBeUndefined()
    })

    it.sequential('● should validate mutation createUser', async () => {
      const { createUser } = mutation
      const $ = await createUser(null, { input: { ...getTestUser() } })
      expect($).toBeDefined()
      expect($?.id).toBeDefined()
      if ($.id) {
        id = $.id
      }
    })

    it.sequential('● should validate mutation updateUser', async () => {
      const { getUser } = query
      const { updateUser } = mutation
      const user: UserSelect = await getUser(null, { id })
      if (id === user.id) {
        const { name, email } = getTestUser()
        const $ = await updateUser(null, {
          id,
          input: {
            ...user[0],
            name,
            email,
          },
        })
        expect($).toBeDefined()
      }
    })

    it('● should validate mutation deleteUser', async () => {
      const { getUsers } = query
      const { deleteUser } = mutation
      const users: UserSelect[] = await getUsers()
      if (users && users[0].id) {
        await deleteUser(null, {
          id: users[0].id,
        })
      }
    })
  })
})
