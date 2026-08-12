/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  apiFile: '@/shared/api/baseApi',
  apiImport: 'baseApi',
  exportName: 'generatedApi',
  hooks: true,
  outputFile: './src/shared/api/generated/api.ts',
  prettierConfigFile: './.prettierrc.json',
  schemaFile: 'http://localhost:5000/docs-json',
  tag: true,
};

export default config;
