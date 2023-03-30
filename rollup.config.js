import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import {defineConfig} from 'rollup';

export default defineConfig({
	input: 'source/index.js',
	output: {
		file: 'dist/index.js',
		interop: 'esModule',
		generatedCode: {
			preset: 'es2015',
		},
	},
	plugins: [
		json(),
		commonjs(),
		nodeResolve(),
	],
});
