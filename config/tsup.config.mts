import path from 'node:path';
import { spawn } from 'node:child_process';

import type { Options } from 'tsup';
import { glob } from 'glob';

import project from './project.config.mjs';

const extensions = project.extensions;
const destination = project.build.destination;
export default async (): Promise<Options> => ({
  entry: await glob([`./src/**/*.{${extensions.source.join(',')}}`], {
    ignore: ['**/*.{test,spec}.*'],
    nodir: true
  }),
  outDir: destination,
  target: 'es2022',
  format: 'esm',
  dts: true,
  clean: false,
  watch: false,
  minify: false,
  bundle: true,
  sourcemap: 'inline',
  splitting: true,
  skipNodeModulesBundle: true,
  esbuildPlugins: [
    {
      name: 'bundle-content',
      setup(build) {
        build.onResolve({ filter: /.*/ }, async ({ path: file, importer }) => {
          if (!importer) return;
          const extension = path.extname(file).substring(1);
          const external = !extension || extensions.source.includes(extension);
          return { external };
        });
      }
    }
  ],
  plugins: [
    {
      name: 'paths-resolve',
      buildEnd() {
        const ps = spawn('tsc-alias', [
          ...['--project', './tsconfig.json', '--outDir', this.options.outDir],
          '--resolve-full-paths'
        ]);
        return new Promise((resolve, reject) => {
          ps.once('error', (err) => reject(err));
          ps.once('exit', (code) => {
            if (code) reject(new Error(`tsc-alias exit with code: ${code}`));
            else resolve();
          });
        });
      }
    }
  ]
});
