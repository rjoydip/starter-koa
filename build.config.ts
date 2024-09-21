import type { OutputChunk, Plugin } from 'rollup'
import { transform } from 'esbuild'
import { defineBuildConfig } from 'unbuild'
import { isProd } from './src/utils'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
    esbuild: {
      minify: isProd(),
    },
  },
  hooks: {
    'rollup:options': function (_, rollupConfig) {
      (rollupConfig.plugins as Plugin[]).push({
        name: 'compat',
        async generateBundle(_options, bundle) {
          const cjsEntry = bundle['index.cjs'] as OutputChunk
          if (!cjsEntry) {
            return
          }
          cjsEntry.code = await transform(cjsEntry.code, {
            target: 'es6',
            minify: true,
          }).then(r => r.code)
        },
      } satisfies Plugin)
    },
  },
})
