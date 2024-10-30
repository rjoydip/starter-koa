import { parseYAML } from 'confbox/yaml'
import OpenAPISchemaValidator from 'openapi-schema-validator'
import { describe, expect, it } from 'vitest'
import { getOpenAPISpec } from '../src/utils'

describe('⬢ Validate app', async () => {
  const specRaw = await getOpenAPISpec()
  const spec: any = parseYAML(specRaw)

  it('● should validate openapi spec', () => {
    const validator = new OpenAPISchemaValidator({ version: '3.1.0' })
    const { errors } = validator.validate(spec)

    expect(errors).toHaveLength(0)
  })

  it('● should validate openapi spec top-level properties', () => {
    expect(spec.openapi).toStrictEqual('3.1.0')
    expect(spec.info.title).toStrictEqual('API Spec')
    expect(spec.info.version).toStrictEqual('0.0.0')
    expect(spec.info.description).toStrictEqual('API Spec')
    expect(spec.servers.length).toBeGreaterThan(0)
  })

  it.runIf(spec.paths)('● should validate the presence of required paths and methods', () => {
    const specPaths = spec.paths
    // Check presence of specific paths
    expect(specPaths).toHaveProperty('/users')
    expect(specPaths).toHaveProperty('/user/{id}')
    expect(specPaths).toHaveProperty('/user')

    // Check methods and required fields
    expect(specPaths['/users']).toHaveProperty('get')
    expect(specPaths['/user/{id}']).toHaveProperty('get')
    expect(specPaths['/user/{id}']).toHaveProperty('put')
    expect(specPaths['/user/{id}']).toHaveProperty('delete')
    expect(specPaths['/user']).toHaveProperty('post')

    // Check specific fields in methods
    expect(specPaths['/users'].get).toMatchObject({
      summary: 'Get all users',
      operationId: 'getUsers',
      responses: expect.any(Object),
    })
    expect(specPaths['/user/{id}'].get).toMatchObject({
      summary: 'Get user by ID',
      operationId: 'getUser',
      parameters: expect.arrayContaining([
        expect.objectContaining({ name: 'id', in: 'path', required: true, schema: { type: 'string' } }),
      ]),
      responses: expect.any(Object),
    })
  })
})
