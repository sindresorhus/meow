'use strict';
const path = require('path');
const buildMinimistOptions = require('minimist-options');
const minimist = require('minimist');
const camelcaseKeys = require('camelcase-keys');
const decamelizeKeys = require('decamelize-keys');
const trimNewlines = require('trim-newlines');
const redent = require('redent');
const readPkgUp = require('read-pkg-up');
const loudRejection = require('loud-rejection');
const normalizePackageData = require('normalize-package-data');

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename];
const parentDir = path.dirname(module.parent.filename);

module.exports = opts => {
	loudRejection();

	if (Array.isArray(opts) || typeof opts === 'string') {
		opts = {
			help: opts
		};
	}

	opts = Object.assign({
		pkg: readPkgUp.sync({
			cwd: parentDir,
			normalize: false
		}).pkg,
		argv: process.argv.slice(2),
		inferType: false
	}, opts);

	let minimistOpts = decamelizeKeys(opts.flags || {}, '-', {exclude: ['stopEarly', '--']});
	minimistOpts = Object.assign({arguments: opts.input || 'string'}, minimistOpts);

	const hasArguments = minimistOpts._ || minimistOpts.arguments;

	if (opts.inferType && !hasArguments) {
		minimistOpts.arguments = 'string';
	} else if (opts.inferType && hasArguments) {
		delete minimistOpts.arguments;
	}

	minimistOpts = buildMinimistOptions(minimistOpts);

	const pkg = opts.pkg;
	const argv = minimist(opts.argv, minimistOpts);
	let help = redent(trimNewlines((opts.help || '').replace(/\t+\n*$/, '')), 2);

	normalizePackageData(pkg);

	process.title = pkg.bin ? Object.keys(pkg.bin)[0] : pkg.name;

	let description = opts.description;
	if (!description && description !== false) {
		description = pkg.description;
	}

	help = (description ? `\n  ${description}\n` : '') + (help ? `\n${help}\n` : '\n');

	const showHelp = code => {
		console.log(help);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(typeof code === 'number' ? code : 2);
	};

	if (argv.version && opts.version !== false) {
		console.log(typeof opts.version === 'string' ? opts.version : pkg.version);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit();
	}

	if (argv.help && opts.help !== false) {
		showHelp(0);
	}

	const input = argv._;
	delete argv._;

	const flags = camelcaseKeys(argv, {exclude: ['--', /^\w$/]});

	return {
		input,
		flags,
		pkg,
		help,
		showHelp
	};
};
