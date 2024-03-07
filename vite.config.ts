import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import makeManifest from "./utils/plugins/make-manifest";
import customDynamicImport from "./utils/plugins/custom-dynamic-import";
import addHmr from "./utils/plugins/add-hmr";

const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, "src");
const pagesDir = resolve(srcDir, "pages");
const assetsDir = resolve(srcDir, "assets");
const outDir = resolve(rootDir, "dist");
const publicDir = resolve(rootDir, "public");

const isDev = process.env.__DEV__ === "true";
const isProduction = !isDev;

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;

export default defineConfig({
  resolve: {
    alias: {
      "@root": rootDir,
      "@src": srcDir,
      "@assets": assetsDir,
      "@pages": pagesDir,
    },
  },
  plugins: [
    makeManifest({}),
    react(),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
  ],
  publicDir,
  build: {
    outDir,
    /** Can slow down build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    modulePreload: false,
    reportCompressedSize: isProduction,
    emptyOutDir: !isDev,
    rollupOptions: {
      input: {
        devtools: resolve(pagesDir, "devtools", "index.html"),
        panel: resolve(pagesDir, "panel", "index.html"),
        background: resolve(pagesDir, "background", "index.ts"),
        content: resolve(pagesDir, "content", "index.ts"),
        contentStyleGlobal: resolve(pagesDir, "content", "style.global.scss"),
        contentStyle: resolve(pagesDir, "content", "style.scss"),
        // TODO: current cannot support multiple content script entry files
        // https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/306#issuecomment-1981885190
        // mainWorld: resolve(pagesDir, "content/mainWorld", "index.ts"),
        popup: resolve(pagesDir, "popup", "index.html"),
        newtab: resolve(pagesDir, "newtab", "index.html"),
        options: resolve(pagesDir, "options", "index.html"),
        sidepanel: resolve(pagesDir, "sidepanel", "index.html"),
      },
      output: {
        entryFileNames: "src/pages/[name]/index.js",
        chunkFileNames: isDev
          ? "assets/js/[name].js"
          : "assets/js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          const { name, ext } = path.parse(assetInfo.name ?? "");
          if (isFont(ext)) {
            return `assets/fonts/${name}${ext}`;
          }
          return `assets/[ext]/[name].[ext]`;
        },
      },
    },
  },
});

function isFont(ext: string): boolean {
  return /^\.(woff2?|eot|ttf|otf)$/.test(ext);
}
