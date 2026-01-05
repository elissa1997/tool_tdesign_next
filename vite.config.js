import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { TDesignResolver } from '@tdesign-vue-next/auto-import-resolver';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  return {
    plugins: [
      vue(),

      // ✔️ 只在开发环境启用 devtools，避免生产加载 .vue 源码
      isDev && vueDevTools(),
      AutoImport({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
      Components({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
          @use "@/assets/style/var.scss" as *;
          @use "@/assets/style/respond.scss" as *;
        `
        }
      }
    }
  }
})
