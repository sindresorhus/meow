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

module.exports = (helpMessage, opts) => {
	loudRejection();

	if (typeof helpMessage === 'object' && !Array.isArray(helpMessage)) {
		opts = helpMessage;
		helpMessage = '';
	}

	opts = Object.assign({
		pkg: readPkgUp.sync({
			cwd: parentDir,
			normalize: false
		}).pkg,
		argv: process.argv.slice(2),
		inferType: false,
		input: 'string',
		help: helpMessage,
		autoHelp: true,
		autoHelpFlags: true,
		autoVersion: true
	}, opts);

	let minimistOpts = Object.assign({
		arguments: opts.input
	}, opts.flags);

	minimistOpts = decamelizeKeys(minimistOpts, '-', {exclude: ['stopEarly', '--']});

	if (opts.inferType) {
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

	if (opts.autoHelpFlags && opts.flags) {
		const options = Object.keys(opts.flags).reduce((accum, flag) => {
			const o = opts.flags[flag];
			if (Object.prototype.hasOwnProperty.call(o, 'default')) {
				o.default = o.default.toString();
			}

			const option = {
				flag: '',
				value: '',
				desc: ''
			};

			if (flag.length === 1) {
				o.alias = o.alias || flag;
			}

			option.flag += o.alias ? `-${o.alias}, ` : ' '.repeat(4);
			option.flag += `--${flag === '--' ? '' : flag}`;
			accum.flagMaxLen = Math.max(accum.flagMaxLen, option.flag.length);

			if (flag === '--') {
				option.value = 'arg(s)';
			} else if (o.type === 'boolean') {
				option.value = '[true|false]';
			} else {
				option.value = `${o.default ? '[' : ''}<value>${o.default ? ']' : ''}`;
			}
			accum.valMaxLen = Math.max(accum.valMaxLen, option.value.length);

			if (flag === '--') {
				option.desc = 'option/arg separator';
			} else {
				if (o.description) {
					option.desc += o.description;
				}
				if (o.default) {
					option.desc += `${o.description ? '; ' : ''}default ${o.default}`;
				}
			}

			accum.entries.push(option);
			return accum;
		}, {
			flagMaxLen: 0,
			valMaxLen: 0,
			entries: []
		});

		if (options.entries.length > 0) {
			help += redent(options.entries.map(it =>
				`${it.flag}${' '.repeat(options.flagMaxLen - it.flag.length + 2)}` +
				`${it.value}${' '.repeat(options.valMaxLen - it.value.length + 2)}` +
				it.desc
			).join('\n'), 2);
		}
	}

	const showHelp = code => {
		console.log(help);
		process.exit(typeof code === 'number' ? code : 2);
	};

	const showVersion = () => {
		console.log(typeof opts.version === 'string' ? opts.version : pkg.version);
		process.exit();
	};

	if (argv.version && opts.autoVersion) {
		showVersion();
	}

	if (argv.help && opts.autoHelp) {
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
		showHelp,
		showVersion
	};
};
