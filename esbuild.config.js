const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['extension.js', 'server/parser.js'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node14',
  format: 'cjs',
  external: ['vscode']
}).catch(() => process.exit(1));