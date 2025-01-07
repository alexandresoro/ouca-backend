import { defineConfig } from "orval";

export default defineConfig({
  oucaZod: {
    output: {
      client: "zod",
      target: "./src/services/api/generated/zod/ouca-api.zod.ts",
      fileExtension: ".zod.ts",
      schemas: "./src/services/api/generated/models",
      mode: "tags",
      override: {
        useTypeOverInterfaces: true,
      },
    },
    input: {
      target: "./src/services/api/ouca-api.json",
    },
  },
});
