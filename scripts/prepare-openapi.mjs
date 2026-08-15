import { writeFile } from 'node:fs/promises';

const configuredTarget = (process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000').replace(/\/$/, '');
const targets = [configuredTarget, 'http://127.0.0.1:5001'].filter((value, index, all) => all.indexOf(value) === index);
let document;
for (const target of targets) {
  try {
    const response = await fetch(`${target}/docs-json`);
    if (response.ok) {
      document = await response.json();
      break;
    }
  } catch {
    // Try the next configured local backend target.
  }
}
if (!document) throw new Error('Swagger request failed for configured backend targets');

const used = new Map();
for (const path of Object.values(document.paths ?? {})) {
  for (const operation of Object.values(path ?? {})) {
    if (!operation || typeof operation !== 'object' || !operation.operationId) continue;
    const base = operation.operationId;
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    if (count > 1) operation.operationId = `${base}${count}`;
  }
}

for (const [route, pathItem] of Object.entries(document.paths ?? {})) {
  const names = [...route.matchAll(/\{([^}]+)\}/g)].map((match) => match[1]);
  for (const operation of Object.values(pathItem ?? {})) {
    if (!operation || typeof operation !== 'object' || !operation.operationId) continue;
    operation.parameters ??= [];
    for (const name of names) {
      if (!operation.parameters.some((parameter) => parameter.in === 'path' && parameter.name === name)) {
        operation.parameters.push({ name, in: 'path', required: true, schema: { type: 'string' } });
      }
    }
  }
}

await writeFile('.openapi.json', JSON.stringify(document));
