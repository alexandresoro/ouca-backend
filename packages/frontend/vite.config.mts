import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { type PluginOption, defineConfig, loadEnv } from "vite";

const injectEnvIntoHtmlPlugin = (mode: string): PluginOption => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    name: "inject-env-html",
    transformIndexHtml(html: string) {
      return html.replace("$__APP_VERSION__$", JSON.stringify(env.APP_VERSION ?? "unknown"));
    },
  };
};

// Dependencies that are set in their own chunk
const CHUNKS_MAPPING = {
  react: ["react", "react-dom"],
  reactrouter: ["react-router"],
  reacthookform: ["react-hook-form", "@hookform/resolvers"],
  zod: ["zod"],
  maplibregl: ["maplibre-gl"],
  i18next: ["i18next", "i18next-http-backend"],
  oidc: ["oidc-client-ts"],
  headlessui: ["@headlessui/react"],
  styledicons: ["@styled-icons"],
  turf: ["@turf"],
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const enableSentry = env.ENABLE_SENTRY?.toLowerCase() === "true";

  return {
    resolve: {
      alias: {
        "@ou-ca/api": path.resolve(__dirname, "./src/services/api/generated"),
        "@components": path.resolve(__dirname, "./src/components"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
        "@layouts": path.resolve(__dirname, "./src/layouts"),
        "@services": path.resolve(__dirname, "./src/services"),
        "@typings": path.resolve(__dirname, "./src/@types"),
        "@utils": path.resolve(__dirname, "./src/utils"),
      },
    },
    build: {
      sourcemap: enableSentry ? "hidden" : false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            for (const [chunk, modules] of Object.entries(CHUNKS_MAPPING)) {
              for (const module of modules) {
                if (id.includes(`node_modules/${module}/`)) {
                  return chunk;
                }
              }
            }
          },
        },
      },
    },
    server: {
      port: 3000,
      open: true,
    },
    plugins: [
      injectEnvIntoHtmlPlugin(mode),
      react(),
      sentryVitePlugin({
        disable: !enableSentry,
        url: env.SENTRY_URL,
        org: env.SENTRY_ORG,
        project: env.SENTRY_PROJECT,
        authToken: env.SENTRY_AUTH_TOKEN,
        release: {
          name: env.APP_VERSION,
          // Don't inject the release as it will be picked up from sentry init
          inject: false,
          // Disabled while testing GlitchTip as it does not seem to work properly
          // Probably because of GlitchTip does not link commits to releases at all
          // setCommits: {
          //   auto: true,
          // },
          // GlitchTip does not seem happy with the new source map format
          uploadLegacySourcemaps: {
            paths: ["**/assets/*"],
            ext: ["js", "map"],
            urlPrefix: "~/assets",
          },
        },
        sourcemaps: {
          filesToDeleteAfterUpload: "**/assets/*.js.map",
        },
        telemetry: false,
      }),
    ],
  };
});
