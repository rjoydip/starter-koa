import type { User } from '../src/types'
import { faker } from '@faker-js/faker/locale/en'
import { afterEach, describe, expect, it } from 'vitest'
import hooks from '../src/hooks'

const {
  person,
  internet,
  phone,
  datatype,
  location,
  number,
} = faker

describe('⬢ Validate hooks', () => {
  let _id: string

  const testUser: User = {
    name: person.fullName(),
    email: internet.email(),
    phone: phone.number({ style: 'international' }),
    isVerified: datatype.boolean(),
    password: internet.password(),
    address: `${location.streetAddress()}, ${location.city()}, ${location.state()}, ${location.zipCode()}, ${location.country()}`,
  }

  afterEach(() => {
    faker.seed()
  })

  it('● should validate hook instance', () => {
    expect(hooks.hook).toBeDefined()
  })

  it('● should validate health hook', async () => {
    const payload = await hooks.callHook('health')
    expect(payload).toStrictEqual({
      data: {
        db: true,
        redis: false,
      },
    })
  })

  it('● should validate _metrics hook', async () => {
    const payload = await hooks.callHook('_metrics')
    const { memoryUsage, loadAverage } = payload.data
    const { rss, heapTotal, heapUsed, external, arrayBuffers } = memoryUsage
    expect(rss).toBeGreaterThan(0)
    expect(heapTotal).toBeGreaterThan(0)
    expect(heapUsed).toBeGreaterThan(0)
    expect(external).toBeGreaterThan(0)
    expect(arrayBuffers).toBeGreaterThan(0)
    expect(Array.isArray(loadAverage)).toBeTruthy()
  })

  it('● should validate _meta hook', async () => {
    const payload = await hooks.callHook('_meta')
    const { description, license, name, version } = payload.data
    expect(description).toBeTypeOf('string')
    expect(license).toStrictEqual('MIT')
    expect(name).toStrictEqual('starter-koa')
    expect(version).toBeTypeOf('string')
  })

  it('● should validate getUsers hook', async () => {
    const payload = await hooks.callHook('getUsers')
    expect(payload).toStrictEqual({
      data: [],
    })
  })

  it('● should validate getUser hook', async () => {
    const payload = await hooks.callHook('getUser', number.int({ min: 0, max: 10 }))
    expect(payload).toStrictEqual({
      data: undefined,
    })
  })

  it('● should validate createUser hook', async () => {
    const payload = await hooks.callHook('createUser', testUser)
    const { id, name, email, phone, isVerified, password, address, role, createdAt, updatedAt } = payload.data
    expect(id).toBeGreaterThan(0)
    expect(name).toBe(testUser.name)
    expect(email).toBe(testUser.email)
    expect(phone).toBe(testUser.phone)
    expect(isVerified).toBe(testUser.isVerified)
    expect(password).toBe(testUser.password)
    expect(address).toBe(testUser.address)
    expect(role).toBe('user')
    expect(typeof createdAt).toBeTypeOf('string')
    expect(typeof updatedAt).toBeTypeOf('string')
    _id = id
  })

  it('● should validate updateUser hook', async () => {
    const payload = await hooks.callHook('updateUser', _id, { ...testUser, isVerified: !testUser.isVerified })
    const { id, name, email, phone, isVerified, password, address, role, createdAt, updatedAt } = payload.data
    expect(id).toBeGreaterThan(0)
    expect(name).toBe(testUser.name)
    expect(email).toBe(testUser.email)
    expect(phone).toBe(testUser.phone)
    expect(isVerified).toBe(!testUser.isVerified)
    expect(password).toBe(testUser.password)
    expect(address).toBe(testUser.address)
    expect(role).toBe('user')
    expect(typeof createdAt).toBeTypeOf('string')
    expect(typeof updatedAt).toBeTypeOf('string')
  })

  it('● should validate deleteUser hook', async () => {
    const payload = await hooks.callHook('deleteUser', _id)
    expect(_id).toBe(payload.data.id)
  })
})
