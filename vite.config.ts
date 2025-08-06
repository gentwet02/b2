import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import autoCssImport from 'vitejs-plugin-auto-css-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        autoCssImport(),
        react(),
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    base: './',
});
