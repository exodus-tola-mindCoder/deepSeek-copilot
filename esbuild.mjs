import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

const isProduction = process.argv.includes('--production');
const isWatch = process.argv.includes('--watch');

const buildOptions = {
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
	},
	loader: {
		'.ts': 'ts'
	}
};

if (isWatch) {
	const ctx = await build({
		...buildOptions,
		watch: {
			onRebuild(error) {
				if (error) { console.error('Build failed:', error); }
				else { console.log('Build succeeded'); }
			}
		}
	});
} else {
	build(buildOptions).catch((error) => {
		console.error('Build failed:', error);
		process.exit(1);
	});
}