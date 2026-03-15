import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target:
          "http://takeyourinterview-ags-1-682670051.ap-south-1.elb.amazonaws.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
