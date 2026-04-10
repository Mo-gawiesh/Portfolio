import { defineConfig } from 'vite'

export default defineConfig({
    base: './',
    root: '.',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
                    gsap: ['gsap', 'gsap/ScrollTrigger'],
                    swiper: ['swiper', 'swiper/modules'],
                    aos: ['aos']
                }
            }
        },
        chunkSizeWarningLimit: 1000
    }
})