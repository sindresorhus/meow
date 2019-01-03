import {resolve} from 'path';
import commonJS from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';

import packageJson from '../package.json';

let builtinModules
import module from 'module'
if (module.builtinModules) {
	builtinModules = module.builtinModules
} else {
	const { _builtinLibs } = require('repl')
	builtinModules =  _builtinLibs
}

const dependencies = [
	...builtinModules,
	...Object.keys(packageJson.dependencies)
];

const version = packageJson.version || process.env.VERSION;

const plugins = [];

// -----------------------------
// Aliases
// -----------------------------
const rootDir = resolve(__dirname, '..');

export default {
	input: resolve(rootDir, 'lib', 'index.js'),
	output: {
		name: 'index',
		file: resolve(rootDir, 'dist', 'index.js'),
		format: 'cjs',
	},
	external: dependencies,
	plugins: [
		json(),
		nodeResolve(),
		commonJS()
	].concat(plugins)
};
