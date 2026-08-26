/**
 * build.mjs — esbuild bundler
 *
 * Bundles all entry-point JS files into dist/.
 * Each file is independently bundled so the HTML pages can load them as-is.
 */

import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync } from 'fs';

const ENTRIES = ['app.js', 'color-palette.js', 'products.js'];
const OUT_DIR = 'dist';

mkdirSync(OUT_DIR, { recursive: true });

const result = await esbuild.build({
  entryPoints: ENTRIES,
  bundle: false,       // these scripts are standalone; no module imports to resolve
  minify: true,
  sourcemap: true,
  outdir: OUT_DIR,
  target: ['es2020'],
  logLevel: 'info',
});

// Copy HTML + CSS assets unchanged
const ASSETS = [
  'index.html',
  'styles.css',
  'color-palette.html',
  'color-palette.css',
  'products.html',
  'products.css',
];

for (const asset of ASSETS) {
  copyFileSync(asset, `${OUT_DIR}/${asset}`);
}

console.log(`\nBuild complete → ./${OUT_DIR}/`);

if (result.errors.length > 0) {
  process.exit(1);
}
