# starter-koa

[![JSDocs][jsdocs-src]][jsdocs-href] [![License][license-src]][license-href] [![code style][code-style-src]][code-style-url]

The starter-koa repository is a Koa application starter template that emphasizes simple and logical separation within a single file. It integrates various tools and frameworks to streamline the development process.

## Key Features

- ✅ Koa - A lightweight and flexible Node.js web application framework.
- ✅ Drizzle - A lightweight TypeScript ORM for SQL databases.
- ✅ UnJS Tools
  - ✅ Unbuild - A unified build system for JavaScript and TypeScript.
  - ✅ Unstorage - A universal storage layer with support for various backends, including Redis.
    - ✅ Cache
      - ✅ Redis
  - ✅ DB0 - A database toolkit for PostgreSQL.
    - ✅ PostgreSQL
  - ✅ Cossws
- ✅ APIs
  - ✅ tRPC - End-to-end typesafe APIs.
  - ✅ GraphQL Yoga - A fully-featured GraphQL server.
  - ✅ OpenAPI - Standardized API documentation.
  - ✅ Websocket - Real-time communication capabilities.
    - ✅ Cossws
- ✅ Scalar - A library for handling complex data types in GraphQL.
- ✅ Sentry - Application monitoring for error tracking.
- ✅ Zod - TypeScript-first schema declaration and validation.
- ✅ Vitest - A blazing-fast unit test framework.
- ✅ Autocannon - A fast HTTP/1.1 benchmarking tool.
- ✅ StepCI - API testing and monitoring.

## Development

- Clone this repository
- Install the latest LTS version of [Node.js](https://nodejs.org/en/)
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

For the test, dotenvx will pick the `.env` file

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

For drizzle migrations, `drizzle-kit` is already installed as a dev dependency.

```sh
npx dotenvx run -- drizzle-kit generate
npx dotenvx run -- drizzle-kit migrate
npx dotenvx run -- drizzle-kit studio
```

## API

After running the dev command visit the `/references` endpoint. Play around with endpoints with a full-fledged API client. To get users (pagination and filtering) to pass query params (e.g. `?page=0&pageSize20`)

## GraphQL

To show the GraphQL playground visit `/api/graphql`. The port will be application port `+ 1` (e.g. If the port is 3000 then the GraphQL server port is 3001).

## tRPC

Access trpc routes on `/api/trpc`.

## Websocket

For showing the WebSocket playground visit `/_ws`. If want to use it as API then use either `wss://<domain>` or `ws://<domain>`

```sh
# Ping - Client on the 'Ping' button - Response 'Pong' from server

# Reload or Reconnect - Browser refreshing not required - Only click on the 'Reconnect' button

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

The package is installed as a dev dependency so by executing `npx stepci run ./test/workflow.yml` locally APIs can be tested. Otherwise, the unit test also covered the workflow.

> [!CAUTION]
> For load testing use `npx stepci run --loadtest test/workflow.yml`. It only works locally but most of the load tests failed.

## Endpoints

Here is the list of endpoints available in the application.

- Basic API
  - `/` - Welcome
  - `/status` - Status
  - `/health` - Application health
  - `/_meta` - Metadata
  - `/_metrices` - Server matrices (limited)
  - `/references` - OpenAPI documentation
  - `/openapi.json` - OpenAPI spec information
  - `/_ws` - WebSocket Playground
- API
  - `/api/trpc` - tRPC entry point
  - `/api/graphql` - GraphQL
  - `/users` - Get the list of users
  - `/user/:id` - Get/Post/Put/Delete user details

## TODO

- [x] Testing
  - [x] Unit
    - [x] Cache
    - [x] DB
    - [x] OpenAPI
    - [x] WebSocket
    - [x] GraphQL
    - [x] tRPC
  - [x] StepCI Automation
    - [x] APIs
      - [x] HTTP
      - [x] tRPC
      - [x] GraphQL
    - [x] Testing
      - [x] Performance
      - [x] Load
      - [x] Contract
- [x] CI
  - [x] Actions
    - [x] Parallel
- [x] Cache
  - [x] Redis
- [x] Password
  - [x] Encryption
  - [x] Exclude from return
- [x] DB
  - [x] PostgreSQL
  - [x] Seed
- [ ] Features
  - [x] JSDoc
  - [x] HTTPS (self-certified)
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
