import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            'virtual:pwa-register/react': path.resolve(__dirname, 'src/test/__mocks__/pwa-register.ts'),
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        css: {
            modules: {
                classNameStrategy: 'non-scoped',
            },
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'lcov'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/test/**', 'src/vite-env.d.ts', 'src/main.tsx'],
        },
    },
});
