import { defineConfig, UserConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const common: UserConfig = {};

  const productionConfig: UserConfig = {
    build: {
      lib: {
        entry: resolve(__dirname, "lib/index.ts"),
        name: "Boutique",
        fileName: (format) => `boutique.${format}.js`,
      },
      rollupOptions: {
        input: ["./lib/index.ts"],
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
  };

  if (mode === "production") {
    return productionConfig;
  }

  return common;
});
