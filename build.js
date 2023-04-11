const { build } = require('esbuild');
const { dependencies, devDependencies } = require('./package.json');

build({
  entryPoints: [
    //
    'client/extension.ts',
    'server/server.ts',
  ],
  bundle: true,
  minify: false,
  external: Object.keys(dependencies).concat(Object.keys(devDependencies)),
  platform: 'node', // for CJS
  outdir: 'out',
});
