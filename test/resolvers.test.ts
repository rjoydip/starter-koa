import type { UserSelect } from '../src/schema.ts'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getTestUser, getUUID } from '../scripts/_seed.ts'
import { resolvers } from '../src/resolvers.ts'

describe('⬢ Validate resolvers', () => {
  const query = resolvers.Query
  const mutation = resolvers.Mutation

  beforeEach(() => {
    vi.clearAllMocks()
  })

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
  })

  describe('⬢ Validate user resolvers', () => {
    let id: string

    it('● should validate query getUsers', async () => {
      const { getUsers } = query
      const $ = await getUsers()
      expect($).toBeDefined()
    })

    it('● should validate query getUser', async () => {
      const { getUser } = query
      const $ = await getUser(null, { id: getUUID() })
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

    it.sequential('● should validate mutation deleteUser', async () => {
      const { getUser } = query
      const { deleteUser } = mutation
      const user: UserSelect = await getUser(null, { id })
      if (user && user.id) {
        await deleteUser(null, {
          id: user.id,
        })
      }
    })
  })
})
