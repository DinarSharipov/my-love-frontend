import { loadEnvFile } from 'node:process';

try {
  loadEnvFile('.env');
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

const apiTarget = (process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5000').replace(/\/$/, '');

/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  apiFile: '@/shared/api/baseApi',
  apiImport: 'baseApi',
  exportName: 'generatedApi',
  hooks: true,
  outputFile: './src/shared/api/generated/api.ts',
  prettierConfigFile: './.prettierrc.json',
  schemaFile: './.openapi.json',
  tag: true,
};

export default config;
