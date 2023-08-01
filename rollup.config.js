import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import license from 'rollup-plugin-license';
import terser from '@rollup/plugin-terser';
import filesize from 'rollup-plugin-filesize';
import {defineConfig} from 'rollup';

export default defineConfig({
	input: 'source/index.js',
	output: {
		file: 'dist/index.js',
		// https://rollupjs.org/configuration-options/#output-interop
		interop: 'esModule',
		// https://rollupjs.org/configuration-options/#output-generatedcode
		generatedCode: {
			preset: 'es2015',
		},
	},
	plugins: [
		json(),
		commonjs(),
		nodeResolve(),
		license({
			thirdParty: {
				output: 'dist/dependencies.md',
			},
		}),
		terser({
			module: true,
			toplevel: true,
			format: {
				comments: false,
			},
		}),
		filesize(),
	],
});
