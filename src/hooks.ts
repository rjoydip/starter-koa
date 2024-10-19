import type { IHealth, IMetaData, IMetrics, User, UserInput } from './types.ts'
import { createHooks } from 'hookable'
import resolvers from './resolvers.ts'

const hooks = createHooks()
const { Mutation, Query } = resolvers

async function health(): Promise<{
  data: IHealth
}> {
  return await Query.health()
}

async function _metrics(): Promise<{
  data: IMetrics
}> {
  return await Query._metrics()
}

async function _meta(): Promise<{
  data: IMetaData
}> {
  return await Query._meta()
}

async function getUser(id: number): Promise<{
  data: IMetaData
}> {
  const data = await Query.getUser(null, { id })
  return {
    data,
  }
}

async function getUsers(): Promise<{
  data: User[]
}> {
  const data = await Query.getUsers()
  return {
    data,
  }
}

async function createUser(input: UserInput): Promise<{
  data: User[]
}> {
  const data = await Mutation.createUser(null, {
    input,
  })
  return {
    data,
  }
}

async function updateUser(id: number, input: UserInput): Promise<{
  data: User[]
}> {
  const data = await Mutation.updateUser(null, {
    id,
    input,
  })
  return {
    data,
  }
}

async function deleteUser(id: number): Promise<{
  data: {
    id: number
  }
}> {
  const { id: _id } = await Mutation.deleteUser(null, {
    id,
  })
  return {
    data: {
      id: _id,
    },
  }
}

hooks.addHooks({ health, _metrics, _meta, getUser, getUsers, createUser, updateUser, deleteUser })

export default hooks
