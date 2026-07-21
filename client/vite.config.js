import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg}']
      },
      manifest: {
        name: 'Winkit Store',
        short_name: 'Winkit',
        description: 'Fast ecommerce delivery',
        theme_color: '#ffffff'
      }
    })
  ],
})