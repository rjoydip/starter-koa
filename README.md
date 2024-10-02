# starter-koa

[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Koa application starter

> [!NOTE]
> This project is in the early stages and under development. Although the pnpm is being used as package manager but application and some other script are working through node.

✅ Koa <br>
✅ PGLite <br>
✅ Sentry <br>
✅ Consola <br>
✅ GraphQL Yoga <br>
✅ Valibot <br>
✅ Vitest <br>
✅ Unbuild <br>

## Development

<summary>local development</summary>

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `ni`
- Run interactive tests using `nr dev`

## Commands

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

For all scripts

```sh
pnpm run all # or nr all
```

## API

After running dev command visit `/apidocs` endpoint.

## GraphQL

For showing graphql playground visit `/graphql`.

## License

[MIT](./LICENSE) License © 2024-PRESENT [Joydip Roy](https://github.com/rjoydip)

<!-- Badges -->

[license-src]: https://img.shields.io/github/license/rjoydip/starter-koa.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/rjoydip/starter-koa/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/starter-koa
