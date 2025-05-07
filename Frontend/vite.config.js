import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
        define: {
            global: "window",
            "process.env": "{}", // ✅ Fixes process is not defined
        },
        plugins: [
            NodeGlobalsPolyfillPlugin({
                buffer: true,
                process: true,
            }),
        ],
    },
},
resolve: {
    alias: {
        process: "process/browser", // ✅ Ensures `process` is recognized
        alias: {
          util: "util/", // ✅ Alias `util` module
      },
    },
},
  server: {
    host: '0.0.0.0', // Allow access from other devices on the network
    port: 3000, // You can specify any port, or leave it as default (3000)
  },
})
