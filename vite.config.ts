import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import autoCssImport from 'vitejs-plugin-auto-css-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [autoCssImport(), react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        extensions: ['.js', '.ts', '.jsx', '.tsx'],
    },
    base: '/',
    build: {
        // our pictures are listed eagerly (import.meta.glob): inlined, every small one would sit
        // in the JS of every page instead of loading when shown
        assetsInlineLimit: (file) => (file.includes('/src/assets/images/') ? false : undefined),
        rolldownOptions: {
            output: {
                // libraries in their own chunks: a deploy only changes the app's chunk, so
                // returning visitors keep React and TanStack cached
                codeSplitting: {
                    groups: [
                        { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
                        { name: 'vendor', test: /node_modules/ },
                    ],
                },
            },
        },
    },
});
