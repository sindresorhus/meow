import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import license from 'rollup-plugin-license';
import {createTag, replaceResultTransformer} from 'common-tags';
import {delete_comments as deleteComments} from 'delete_comments';
import {defineConfig} from 'rollup';

const stripComments = createTag(
	{onEndResult: deleteComments},
	// Remove empty lines
	// https://stackoverflow.com/q/16369642/10292952
	replaceResultTransformer(/^\s*[\r\n]/gm, ''),
);

const outputDirectory = 'build';

export default defineConfig({
	input: [
		'source/index.js',
		'source/options.js',
		'source/parser.js',
		'source/utils.js',
		'source/validate.js',
	],
	output: {
		dir: outputDirectory,
		interop: 'esModule',
		generatedCode: {
			preset: 'es2015',
		},
		chunkFileNames: '[name].js',
		manualChunks(id) {
			if (id.includes('node_modules')) {
				return 'dependencies';
			}
		},
		hoistTransitiveImports: false,
		plugins: [{
			name: 'strip-dependency-comments',
			renderChunk(code, chunk) {
				return chunk.name === 'dependencies' ? stripComments(code) : null;
			},
		}],
	},
	treeshake: {
		moduleSideEffects: 'no-external',
	},
	plugins: [
		nodeResolve(),
		commonjs({
			include: 'node_modules/**',
		}),
		json(),
		license({
			thirdParty: {
				output: `${outputDirectory}/licenses.md`,
			},
		}),
	],
});
