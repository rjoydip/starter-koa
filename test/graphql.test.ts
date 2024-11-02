import type { Server } from 'node:http'
import type { UserSelect } from '../src/schema'
import getPort from 'get-port'
import gql from 'graphql-tag'
import pify from 'pify'
import request from 'supertest-graphql'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getTestUser } from '../scripts/_seed'
import { createGraphQLServer } from '../src/server'
import { API_PREFIX } from '../src/utils'

describe('⬢ Validate graphql queries', async () => {
  let id: string
  let graphqlServer: Server
  const port = await getPort()

  beforeAll(async () => {
    graphqlServer = createGraphQLServer()
    await pify(graphqlServer.listen(port))
  })

  afterAll(async () => {
    await pify(graphqlServer.close())
  })

  it.sequential('● should validate create user mutation', async () => {
    const variables = getTestUser()
    const { data } = await request<{
      createUser: UserSelect
    }>(`http://127.0.0.1:${port}/${API_PREFIX}`)
      .query(gql`
          mutation CreateUser($input: UserInput!) {
            createUser(input: $input) {
              id
              name
              email
              phone
              address
              role
              is_verified
              created_at
              updated_at
            }
          }
        `)
      .variables({ input: variables })
      .expectNoErrors()

    expect(data?.createUser).toMatchObject({
      name: variables.name,
      email: variables.email,
      phone: variables.phone,
    })
    expect(data?.createUser.id).toBeDefined()
    if (data?.createUser.id)
      id = data?.createUser.id
  })

  it.sequential('● should validate update user mutation', async () => {
    const variables = getTestUser()
    const { data } = await request<{
      updateUser: UserSelect
    }>(`http://127.0.0.1:${port}/${API_PREFIX}`)
      .query(gql`
          mutation UpdateUser($id: ID!, $input: UserInput!) {
            updateUser(id: $id, input: $input) {
              id
              name
              email
              phone
              address
              role
              is_verified
              created_at
              updated_at
            }
          }
        `)
      .variables({ id, input: variables })
      .expectNoErrors()

    expect(data?.updateUser).toMatchObject({
      name: variables.name,
      email: variables.email,
      phone: variables.phone,
    })
    expect(data?.updateUser.id).toBeDefined()
  })

  it.sequential('● should validate get user query', async () => {
    const { data } = await request<{
      getUser: UserSelect
    }>(`http://127.0.0.1:${port}/${API_PREFIX}`)
      .query(gql`
          query GetUser($id: ID!) {
            getUser(id: $id) {
              id
              name
              email
              phone
              address
              role
              is_verified
              created_at
              updated_at
            }
          }
        `)
      .variables({ id })
      .expectNoErrors()

    expect(data?.getUser.id).toStrictEqual(id)
  })

  it.sequential('● should validate get users query', async () => {
    const { data } = await request<{
      getUsers: UserSelect[]
    }>(`http://127.0.0.1:${port}/${API_PREFIX}`)
      .query(gql`
          query {
            getUsers {
              id
              name
              email
              phone
              address
              role
              is_verified
              created_at
              updated_at
            }
          }
        `)
      .expectNoErrors()

    expect(data?.getUsers.length).toBeGreaterThan(0)
  })

  it.sequential('● should validate delete user mutation', async () => {
    const { data } = await request<{
      deleteUser: UserSelect
    }>(`http://127.0.0.1:${port}/${API_PREFIX}`)
      .query(gql`
          mutation DeleteUser($id: ID!) {
            deleteUser(id: $id) {
              id
              name
              email
              phone
              address
              role
              is_verified
              created_at
              updated_at
            }
          }
        `)
      .variables({ id })
      .expectNoErrors()

    expect(data?.deleteUser.id).toBeDefined()
  })
})
