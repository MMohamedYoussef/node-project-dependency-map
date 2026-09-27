import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyze, toMermaid } from './src/graph.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
try {
  const input = path.resolve(process.argv[2] ?? path.join(root, 'fixtures', 'packages.json'));
  const output = path.resolve(process.argv[3] ?? path.join(root, 'examples'));
  const result = analyze(JSON.parse(await readFile(input, 'utf8')));
  await mkdir(output, { recursive: true });
  await writeFile(path.join(output, 'graph.json'), JSON.stringify(result, null, 2) + '\n');
  await writeFile(path.join(output, 'graph.mmd'), toMermaid(result));
  console.log(`${result.packages.length} packages, ${result.cycles.length} cycles, ${result.missing.length} missing dependencies`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
