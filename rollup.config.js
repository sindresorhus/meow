import fs from 'node:fs/promises';
import {defineConfig} from 'rollup';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-ts';
import json from '@rollup/plugin-json';
import license from 'rollup-plugin-license';
import {dts} from 'rollup-plugin-dts';
import {globby} from 'globby';
import {createTag, replaceResultTransformer} from 'common-tags';
import {delete_comments as deleteComments} from 'delete_comments';

/** Matches empty lines: https://stackoverflow.com/q/16369642/10292952 */
const emptyLineRegex = /^\s*[\r\n]/gm;

const stripComments = createTag(
	{onEndResult: deleteComments},
	replaceResultTransformer(emptyLineRegex, ''),
);

const sourceDirectory = 'source';
const outputDirectory = 'build';

const config = defineConfig({
	input: await globby(`./${sourceDirectory}/**/*.ts`, {
		ignore: [`./${sourceDirectory}/*.d.ts`, `./${sourceDirectory}/types.ts`],
	}),
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
		nodeResolve({exportConditions: ['node']}),
		commonjs({
			include: 'node_modules/**',
		}),
		json(),
		typescript({
			tsconfig: resolvedConfig => ({...resolvedConfig, declaration: false}),
		}),
		license({
			thirdParty: {
				output: `${outputDirectory}/licenses.md`,
			},
		}),
	],
});

const dtsConfig = defineConfig({
	input: `./${sourceDirectory}/index.ts`,
	output: {
		file: `./${outputDirectory}/index.d.ts`,
		format: 'es',
	},
	plugins: [
		dts({
			respectExternal: true,
		}),
		{
			name: 'copy-tsd',
			async generateBundle() {
				let tsdFile = await fs.readFile('./test-d/index.ts', 'utf8');

				tsdFile = tsdFile.replace(
					`../${sourceDirectory}/index.js`,
					`../${outputDirectory}/index.js`,
				);

				await fs.writeFile(`./test-d/${outputDirectory}.ts`, tsdFile);
			},
		},
	],
});

// eslint-disable-next-line import/no-anonymous-default-export
export default [config, dtsConfig];
