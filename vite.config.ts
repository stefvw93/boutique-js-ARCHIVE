import { defineConfig, UserConfig, mergeConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const common: UserConfig = {};

  const productionConfig: UserConfig = mergeConfig(common, {
    build: {
      lib: {
        entry: resolve(__dirname, "lib/index.ts"),
        name: "Boutique",
        fileName: (format) => `boutique.${format}.js`,
      },
      rollupOptions: {
        // make sure to externalize deps that shouldn't be bundled
        // into your library
        external: [],
        output: {
          // Provide global variables to use in the UMD build
          // for externalized deps
          globals: {
            boutique: "Boutique",
          },
        },
      },
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  });

  if (mode === "production" || command === "serve") {
    return productionConfig;
  }

  return common;
});
