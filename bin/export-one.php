<?php

declare(strict_types=1);

$inputPath = $argv[1] ?? null;
$outputPath = $argv[2] ?? null;
$language = $argv[3] ?? (getenv('BUNDLE_LANG') ?: 'pt');
$nodeExporterScript = getenv('NODE_EXPORTER_SCRIPT') ?: '/app/exporter/export-h5p.mjs';

if (!$inputPath || !$outputPath) {
    fwrite(STDERR, "Uso: php /app/bin/export-one.php <input.h5p> <output.html> [lang]\n");
    exit(1);
}

if (!is_file($inputPath)) {
    fwrite(STDERR, "Arquivo de entrada nao encontrado: {$inputPath}\n");
    exit(1);
}

$outputDir = dirname($outputPath);
if (!is_dir($outputDir) && !mkdir($outputDir, 0775, true) && !is_dir($outputDir)) {
    fwrite(STDERR, "Nao foi possivel criar diretorio de saida: {$outputDir}\n");
    exit(1);
}

$command = sprintf(
    'node %s %s %s %s',
    escapeshellarg($nodeExporterScript),
    escapeshellarg($inputPath),
    escapeshellarg($outputPath),
    escapeshellarg($language)
);

passthru($command, $exitCode);
exit($exitCode);
