import type { ConfigFile } from "@rtk-query/codegen-openapi";

/**
 * This config file tells @rtk-query/codegen-openapi how and where to generate an RTK api. It takes a "base" api, that has already been created in typical RTK query fashion, then uses an open api json file "schemaFile" to then generate the endpoints along with typescript types, ultimately creating a new api file.
 *
 * To run this, we use the `npx @rtk-query/codegen-openapi openapi-config.ts` command.
 */
const config: ConfigFile = {
  schemaFile: "./openapi-v1.json",
  apiFile: "../state/baseApi",
  apiImport: "baseApi",
  outputFile: "../state/openApiGenerated.ts",
  exportName: "openApiGenerated",
  hooks: false,
};

export default config;
