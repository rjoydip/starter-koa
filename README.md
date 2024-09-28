# starter-koa

[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Koa application starter

> [!NOTE]
> This project is in the early stages and under development. Although the bun is being used as package manager but application and some other script are working through node.

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
bun install # or ni
bun install --production # or nci
```

For build

```sh
bun run build # or nr build
```

For lint

```sh
bun run lint # or nr lint
```

For test

```sh
bun test # or nr test
```

For all scripts

```sh
bun run all # or nr all
```

## License

[MIT](./LICENSE) License © 2024-PRESENT [Joydip Roy](https://github.com/rjoydip)

<!-- Badges -->

[license-src]: https://img.shields.io/github/license/rjoydip/starter-koa.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/rjoydip/starter-koa/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/starter-koa
