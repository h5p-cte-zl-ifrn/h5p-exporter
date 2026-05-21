#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';

const [inputPath, outputPath, language = process.env.BUNDLE_LANG || 'pt'] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error('Uso: node export-h5p.mjs <input.h5p> <output.html> [lang]');
  process.exit(1);
}

const appDir = process.env.APP_DIR || '/app';
const cliPath = path.join(appDir, 'cli.js');

const child = spawn('node', [cliPath, inputPath, '-o', outputPath, '--lang', language], {
  stdio: 'inherit'
});

child.on('error', (error) => {
  console.error('Erro ao iniciar processo Node:', error.message);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
