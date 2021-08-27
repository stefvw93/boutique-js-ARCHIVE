import { defineConfig, UserConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const productionConfig: UserConfig = {
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
        },
      },
    },
  };

  if (mode === "production" || command === "serve") {
    return productionConfig;
  }
});
