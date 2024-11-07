# starter-koa

[![JSDocs][jsdocs-src]][jsdocs-href] [![License][license-src]][license-href] [![code style][code-style-src]][code-style-url]

Koa application starter. Simple & logical separation on single file.

> [!NOTE]
> This project is in the early stages and under development.

- ✅ Koa
- ✅ Drizzle
- ✅ UnJS
  - ✅ Unbuild
  - ✅ Unstorage
    - ✅ Cache
      - ✅ Redis
  - ✅ DB0
    - ✅ PostgreSQL
  - ✅ Cossws
- ✅ APIs
  - ✅ tRPC
  - ✅ GraphQL
    - ✅ GraphQL Yoga
  - ✅ OpenAPI
  - ✅ Websocket
    - ✅ Cossws
- ✅ Scalar
- ✅ Sentry
- ✅ Zod
- ✅ Vitest
- ✅ Autocannon
- ✅ StepCI

## Development

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `ni`
- Run interactive tests using `nr dev`

## CLI

For development mode install

```sh
pnpm install
# or
ni
```

For production mode install

```sh
pnpm install --production
# or
nci
```

For build

```sh
pnpm run build
# or
nr build
```

For lint

```sh
pnpm run lint
# or
nr lint
```

For test, dotenvx will pick `.env` file

```sh
npx dotenvx run -- pnpm run test
# or
npx dotenvx run -- nr test
# If want to execute a specific test file then
npx dotenvx run -- vitest run test/index.test.ts
```

For setup and verify

```sh
pnpm run _setup
# or
nr _setup
```

For benchmarking. For in-depth diagnosis use [clinic](https://github.com/clinicjs/node-clinic) `doctor` & `flame`.

```sh
pnpm run benchmark
# or
nr benchmark
```

For drizzle migrations, `drizzle-kit` already installed as dev dependency.

```sh
npx dotenvx run -- drizzle-kit generate
npx dotenvx run -- drizzle-kit migrate
npx dotenvx run -- drizzle-kit studio
```

## API

After running dev command visit `/references` endpoint. Play around with endpoints with full fledged api client. For get users (pagination and filtering) pass query params (e.g. `?page=0&pageSize20`)

## GraphQL

For showing graphql playground visit `/api/graphql`. Port will be application port `+ 1` (e.g. If port is 3000 then graphql server port is 3001).

## tRPC

Access trpc routes on `/api/trpc`.

## Websocket

For showing websocket playground visit `/_ws`. If want to use as API then use either `wss://<domain>` or `ws://<domain>`

```sh
# Ping - Client on the the 'Ping' button - Response 'Pong' from server

# Reload or Reconnect - Browser refereshing not required - Only click on 'Reconnect' button

# Get Users
method=getUsers

# Get User
method=getUser&id=<USER_ID>

# Create User
method=createUser&<FIELD_1>:<VALUE_1>&<FIELD_2>:<VALUE_2> ...

# Update User
method=updateUser&id=<USER_ID>&<FIELD_1>:<VALUE_1>&<FIELD_2>:<VALUE_2> ...

# Delete User
method=deleteUser&id=<USER_ID>
```

## StepCI

The package is installed as dev depedency so by executing `npx stepci run ./test/workflow.yml` locally APIs can be tested. Otherwise unit test also covered the workflow.

## Endpoints

Here are list of endpoints available in application.

- Basic API
  - `/` - Welcome
  - `/status` - Status
  - `/health` - Application health
  - `/_meta` - Metadata
  - `/_metrices` - Server metrices (limited)
  - `/references` - OpenAPI documentaion
  - `/openapi.json` - OpenAPI spec information
  - `/_ws` - Websocket Playground
- API
  - `/api/trpc` - tRPC entrypoint
  - `/api/graphql` - GraphQL
  - `/users` - Get list of users
  - `/user/:id` - Get/Post/Put/Delete user details

## TODO

- [x] Testing
  - [x] Unit
    - [x] Cache
    - [x] DB
    - [x] OpenAPI
    - [x] Websocket
    - [x] GraphQL
    - [x] tRPC
  - [x] StepCI Automation
    - [x] APIs
      - [x] HTTP
      - [x] tRPC
      - [x] GraphQL
    - [ ] Testing
      - [ ] Performance
      - [ ] Load
      - [ ] Contract
- [x] CI
  - [x] Actions
    - [x] Parallel
- [x] Cache
  - [x] Redis
- [x] Password
  - [x] Encryption
  - [x] Exclude from return
- [x] DB
  - [x] PostgresSQL
  - [x] Seed
- [ ] Features
  - [x] JSDoc
  - [x] HTTPS (self certified)
  - [x] Paginated
  - [ ] Authentication
  - [x] Benchmarking

## License

[MIT](./LICENSE) License © 2024-PRESENT [Joydip Roy](https://github.com/rjoydip)

<!-- Badges -->

[license-src]: https://img.shields.io/github/license/rjoydip/starter-koa.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/rjoydip/starter-koa/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/starter-koa
[code-style-src]: https://antfu.me/badge-code-style.svg
[code-style-url]: https://github.com/antfu/eslint-config
