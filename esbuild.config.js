const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['extension.js', 'server/parser.js'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  target: 'node14',
  format: 'cjs',
  external: ['vscode'],
  minify: true,
  sourcemap: false,
  treeShaking: true
}).catch(() => process.exit(1));