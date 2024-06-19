/**
 * solution for multiple content scripts
 * https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite/issues/177#issuecomment-1784112536
 */
export default function inlineVitePreloadScript() {
  let __vitePreload = "";
  return {
    name: "replace-vite-preload-script-plugin",
    // @ts-expect-error: vite types are not up-to-date
    async renderChunk(code, chunk, options, meta) {
      if (!/content/.test(chunk.fileName.toLowerCase())) {
        return null;
      }
      const chunkName: string | undefined = Object.keys(meta.chunks).find(
        (key) => /preload/.test(key),
      );
      if (!chunkName) {
        return null;
      }
      const modules = meta.chunks[chunkName].modules;
      console.log(modules);
      if (!__vitePreload) {
        __vitePreload = modules[Object.keys(modules)[0]].code;
        __vitePreload = __vitePreload.replaceAll("const ", "var ");
      }
      return {
        code: __vitePreload + code.split(`\n`).slice(1).join(`\n`),
      };
    },
  };
}
