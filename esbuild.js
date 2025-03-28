import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const isProduction = process.argv.includes('--production');

build({
	entryPoints: ['src/extension.ts'],
	bundle: true,
	outfile: 'dist/extension.js',
	external: ['vscode'],
	format: 'cjs',
	platform: 'node',
	target: 'node14',
	minify: isProduction,
	sourcemap: !isProduction,
	plugins: [nodeExternalsPlugin()],
	define: {
		'process.env.NODE_ENV': isProduction ? '"production"' : '"development"'
	}
}).catch(() => process.exit(1));