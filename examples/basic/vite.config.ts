import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  resolve: {
    alias: {
      '@portals/core': '@portals/core/src/index.ts',
      '@portals/react': '@portals/react/src/index.ts',
      '@portals/provider': '@portals/provider/src/index.ts',
    },
  },
})
