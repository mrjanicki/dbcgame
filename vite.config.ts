import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  define: {
    'typeof CANVAS_RENDERER': JSON.stringify(true),
    'typeof WEBGL_RENDERER': JSON.stringify(true),
    'typeof WEBGL_DEBUG': JSON.stringify(false),
    'typeof EXPERIMENTAL': JSON.stringify(false),
    'typeof PLUGIN_3D': JSON.stringify(false),
    'typeof PLUGIN_FBINSTANT': JSON.stringify(false),
    'typeof FEATURE_SOUND': JSON.stringify(true)
  },
  optimizeDeps: {
    include: ['phaser']
  }
});
