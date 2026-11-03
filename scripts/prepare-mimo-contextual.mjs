#!/usr/bin/env node
// Idempotent compatibility repair for installations with the original ES2021 API patch.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../apps/api/src/modules/assistant/', import.meta.url));
let changes = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(filename);
    else if (entry.name.endsWith('.ts')) {
      const text = await readFile(filename, 'utf8');
      const next = text.replaceAll('.at(-1)', '.slice(-1)[0]');
      if (text !== next) { await writeFile(filename, next); changes++; }
    }
  }
}
await visit(root);
console.log(`Mimo ES2021 compatibility: ${changes} file(s) updated. No environment or database changes.`);
