import { defineConfig } from 'astro/config'
import tailwind from '@tailwindcss/vite'
import svelte from '@astrojs/svelte'
import icon from 'astro-icon'
import vercel from '@astrojs/vercel'

// https://astro.build/config
export default defineConfig({
    vite: {
        plugins: [tailwind()]
    },
    integrations: [svelte(), icon()],
    adapter: vercel({
        webAnalytics: {
            enabled: true
        }
    }),
    output: 'server',
    publicDir: './static'
})
