# starter-koa

[![JSDocs][jsdocs-src]][jsdocs-href] [![License][license-src]][license-href]

Koa application starter. A simple and single file logic separation.

> [!NOTE]
> This project is in the early stages and under development. Although the pnpm
> is being used as package manager but application and some other script are
> working through node.

✅ Koa <br>
✅ NeonDB <br>
  ✅ PostgreSQL <br>
✅ Drizzle <br>
✅ GraphQL Yoga <br>
✅ Upstash <br>
  ✅ Redis <br>
    ✅ Keyv <br>
✅ tRPC <br>
✅ Cossws <br>
✅ Scalar <br>
✅ OpenAPI <br>
✅ Sentry <br>
✅ Zod <br>
✅ Vitest <br>
✅ Unbuild <br>

## Development

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `ni`
- Run interactive tests using `nr dev`

## CLI

For install

```sh
pnpm install # or ni
pnpm install --production # or nci
```

For build

```sh
pnpm run build # or nr build
```

For lint

```sh
pnpm run lint # or nr lint
```

For test

```sh
pnpm test # or nr test
```

For setup and verify

```sh
pnpm run _setup # or nr _setup
```

## API

After running dev command visit `/references` endpoint. Play around with endpoints with full fledged api client.

## GraphQL

For showing graphql playground visit `/graphql`.

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

## TODO

- [ ] Unit test
  - [ ] Mock DB
  - [ ] Mock Redis
  - [x] Websocket
- [x] CI - Parallel
- [x] Cache
  - [x] Upstash
- [ ] Password
  - [x] Encrypt during insert
  - [x] Exclude from return
- [ ] Seeding
- [ ] Searching users
- [ ] Authentication
- [ ] Step CI
- [ ] Feature flag

## License

[MIT](./LICENSE) License © 2024-PRESENT [Joydip Roy](https://github.com/rjoydip)

<!-- Badges -->

[license-src]: https://img.shields.io/github/license/rjoydip/starter-koa.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/rjoydip/starter-koa/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/starter-koa
