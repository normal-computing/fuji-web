import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const OUT_DIR = "dist-lib";
const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, "src");
const pagesDir = resolve(srcDir, "pages");

function createConfigPair(name, path) {
  return [
    {
      input: path,
      plugins: [esbuild()],
      output: [
        {
          file: `${OUT_DIR}/${name}.js`,
          format: "cjs",
          sourcemap: true,
          exports: "auto",
        },
      ],
    },
    {
      input: path,
      plugins: [dts()],
      output: {
        file: `${OUT_DIR}/${name}.d.ts`,
        format: "es",
      },
    },
  ];
}

export default [
  ...createConfigPair(
    "domOperations",
    resolve(pagesDir, "content", "domOperations.ts"),
  ),
  ...createConfigPair("helpers", resolve(srcDir, "helpers", "index.ts")),
];
