import {resolve} from 'path';
import commonJS from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import license from 'rollup-plugin-license';
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

// -----------------------------
// Banner
// -----------------------------
const banner =
  '/*!\n' +
  ' * meow v' + version + '\n' +
  ' * Released under the MIT License.\n' +
  ' */';

const plugins = [];

// -----------------------------
// Aliases
// -----------------------------
const rootDir = resolve(__dirname, '..');

export default {
	input: resolve(rootDir, 'lib', 'index.js'),
	output: {
		name: 'meow',
		file: resolve(rootDir, 'dist', 'meow.js'),
		format: 'cjs',
	},
	external: dependencies,
	plugins: [
		json(),
		nodeResolve(),
		commonJS(),
		license({banner})
	].concat(plugins)
};
