/** @type {import('@rtk-query/codegen-openapi').ConfigFile} */
const config = {
  // `.openapi.json` is prepared from the deployed source-of-truth Swagger URL.
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
