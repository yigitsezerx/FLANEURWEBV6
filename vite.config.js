import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: '.',
    server: {
        port: 5173,
        open: true
    },
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                article: resolve(__dirname, 'article.html'),
                archive: resolve(__dirname, 'arsiv.html'),
                about: resolve(__dirname, 'hakkimizda.html'),
                contact: resolve(__dirname, 'iletisim.html'),
                brutalizm: resolve(__dirname, 'makale-brutalizm.html'),
                dijitalAlanlar: resolve(__dirname, 'makale-dijital-alanlar.html'),
                modernFlaneur: resolve(__dirname, 'makale-modern-flaneur.html')
            }
        }
    }
});
