#!/usr/bin/env node

import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import H5PModule from '@lumieducation/h5p-server';
import H5PHtmlExporterModule from '@lumieducation/h5p-html-exporter';

const H5P = H5PModule.default || H5PModule;
const H5PHtmlExporter =
  H5PHtmlExporterModule.default?.default || H5PHtmlExporterModule.default || H5PHtmlExporterModule;

function parseArgs(argv) {
  const parsed = { input: null, output: null, lang: 'pt' };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '-o' || arg === '--out') {
      parsed.output = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--lang') {
      parsed.lang = argv[i + 1] || 'pt';
      i += 1;
      continue;
    }

    if (!parsed.input) {
      parsed.input = arg;
    }
  }

  return parsed;
}

function getMainLibraryUbername(metadata) {
  const deps = [
    ...(metadata.preloadedDependencies || []),
    ...(metadata.dynamicDependencies || []),
    ...(metadata.editorDependencies || [])
  ];

  const main = deps.find((dep) => dep.machineName === metadata.mainLibrary);

  if (!main) {
    throw new Error(`Nao foi possivel detectar a versao de ${metadata.mainLibrary}.`);
  }

  return `${main.machineName} ${main.majorVersion}.${main.minorVersion}`;
}

async function ensureDirs(dirPaths) {
  await Promise.all(dirPaths.map((dirPath) => fs.mkdir(dirPath, { recursive: true })));
}

function resolveRuntimePaths(root) {
  return {
    core: path.join(root, 'h5p', 'core'),
    editor: path.join(root, 'h5p', 'editor')
  };
}

function createWorkPaths(workRoot) {
  return {
    libraries: path.join(workRoot, 'libraries'),
    content: path.join(workRoot, 'content'),
    temporary: path.join(workRoot, 'tmp'),
    userData: path.join(workRoot, 'user-data')
  };
}

async function run() {
  const { input, output, lang } = parseArgs(process.argv.slice(2));

  if (!input) {
    console.error('Uso: h5p2html <arquivo.h5p> [-o saida.html] [--lang pt]');
    process.exit(1);
  }

  const root = process.cwd();
  const runtime = resolveRuntimePaths(root);

  if (!(await fs.stat(runtime.core).then(() => true).catch(() => false))) {
    throw new Error('Pasta obrigatoria ausente: h5p/core');
  }

  if (!(await fs.stat(runtime.editor).then(() => true).catch(() => false))) {
    throw new Error('Pasta obrigatoria ausente: h5p/editor');
  }

  const workRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'h5p2html-'));
  const work = createWorkPaths(workRoot);

  await ensureDirs(Object.values(work));

  try {
    const config = await new H5P.H5PConfig(
      new H5P.fsImplementations.JsonStorage(path.join(root, 'config.json'))
    ).load();

    const h5pEditor = H5P.fs(
      config,
      work.libraries,
      work.temporary,
      work.content,
      new H5P.fsImplementations.FileContentUserDataStorage(work.userData)
    );

    const user = {
      id: '1',
      name: 'CLI User',
      type: 'local',
      email: 'cli@example.com'
    };

    const uploaded = await h5pEditor.uploadPackage(path.resolve(input), user);
    const mainLibraryUbername = getMainLibraryUbername(uploaded.metadata);

    const contentId = await h5pEditor.saveOrUpdateContent(
      undefined,
      uploaded.parameters,
      uploaded.metadata,
      mainLibraryUbername,
      user
    );

    const exporter = new H5PHtmlExporter(
      h5pEditor.libraryStorage,
      h5pEditor.contentStorage,
      config,
      runtime.core,
      runtime.editor
    );

    const html = await exporter.createSingleBundle(contentId, user, {
      language: lang,
      showLicenseButton: true,
      showFrame: true
    });

    const defaultOutput = `${path.basename(input, path.extname(input))}.html`;
    const outputPath = path.resolve(output || defaultOutput);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, html, 'utf8');

    console.log(`OK: ${outputPath}`);
  } finally {
    await fs.rm(workRoot, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error('Erro:', error?.message || error);
  process.exit(1);
});
