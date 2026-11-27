import { writeFile } from 'node:fs/promises';
import { build } from 'esbuild';

await build({
  entryPoints: ['cloudflare/worker.js'],
  outfile: 'dist/_worker.js',
  bundle: true,
  minify: true,
  format: 'esm',
  target: 'es2022'
});
await writeFile('dist/_routes.json', JSON.stringify({
  version: 1,
  include: ['/api/*'],
  exclude: []
}));
