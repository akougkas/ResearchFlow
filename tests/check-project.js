import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const files = [];

async function collectImports(file) {
    const source = await readFile(file, 'utf8');
    const pattern = /(?:import|export)\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g;
    for (const match of source.matchAll(pattern)) {
        if (!match[1].startsWith('.')) continue;
        const target = path.resolve(path.dirname(file), match[1]);
        await access(target, constants.R_OK);
    }
}

async function walk(directory) {
    const { readdir } = await import('node:fs/promises');
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
        const target = path.join(directory, entry.name);
        if (entry.isDirectory()) await walk(target);
        else if (entry.name.endsWith('.js')) files.push(target);
    }
}

await walk(path.join(root, 'src'));
await Promise.all(files.map(collectImports));

const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:href|src)="([^"#:?]+)"/g)) {
    await access(path.join(root, match[1]), constants.R_OK);
}

console.log(`✅ Project integrity: ${files.length} modules and local HTML assets resolve`);
