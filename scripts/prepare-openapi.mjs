import { writeFile } from 'node:fs/promises';

const contractSourceUrl = 'https://api.147.45.124.221.sslip.io/docs-json';
const response = await fetch(contractSourceUrl);
if (!response.ok) {
  throw new Error(`Swagger request failed: ${response.status} ${response.statusText}`);
}
const document = await response.json();

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
      if (
        !operation.parameters.some(
          (parameter) => parameter.in === 'path' && parameter.name === name,
        )
      ) {
        operation.parameters.push({ name, in: 'path', required: true, schema: { type: 'string' } });
      }
    }
  }
}

await writeFile('.openapi.json', JSON.stringify(document));
