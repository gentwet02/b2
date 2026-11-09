import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import autoCssImport from 'vitejs-plugin-auto-css-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Changes on every build: the app compares it with the deployed version.json to spot updates. */
const BUILD_ID = Date.now().toString(36);

function versionFile(): Plugin {
    return {
        name: 'btdb2-version-file',
        apply: 'build',
        generateBundle() {
            this.emitFile({
                type: 'asset',
                fileName: 'version.json',
                source: JSON.stringify({ id: BUILD_ID }),
            });
        },
    };
}

export default defineConfig({
    plugins: [autoCssImport(), react(), versionFile()],
    define: {
        __BUILD_ID__: JSON.stringify(BUILD_ID),
    },
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
