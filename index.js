'use strict';
const path = require('path');
const buildMinimistOptions = require('minimist-options');
const yargs = require('yargs-parser');
const camelcaseKeys = require('camelcase-keys');
const decamelizeKeys = require('decamelize-keys');
const trimNewlines = require('trim-newlines');
const redent = require('redent');
const readPkgUp = require('read-pkg-up');
const hardRejection = require('hard-rejection');
const normalizePackageData = require('normalize-package-data');
const arrify = require('arrify');

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename];
const parentDir = path.dirname(module.parent.filename);

const buildMinimistFlags = ({flags, booleanDefault}) =>
	Object.entries(flags).reduce((minimistFlags, [flagKey, flagValue]) => {
		const flag = {...flagValue};

		if (
			typeof booleanDefault !== 'undefined' &&
			flag.type === 'boolean' &&
			!Object.prototype.hasOwnProperty.call(flag, 'default')
		) {
			flag.default = flag.isMultiple ? [booleanDefault] : booleanDefault;
		}

		if (flag.isMultiple) {
			flag.type = 'array';
			delete flag.isMultiple;
		}

		minimistFlags[flagKey] = flag;

		return minimistFlags;
	}, {});

/**
 * Convert to alternative syntax for coercing values to expected type,
 * according to https://github.com/yargs/yargs-parser#requireyargs-parserargs-opts.
 */
const convertToTypedArrayOption = (arrayOption, flags) =>
	arrify(arrayOption).map(flagKey => ({
		key: flagKey,
		[flags[flagKey].type || 'string']: true
	}));

const validateFlags = (flags, options) => {
	for (const [flagKey, flagValue] of Object.entries(options.flags)) {
		if (flagKey !== '--' && !flagValue.isMultiple && Array.isArray(flags[flagKey])) {
			throw new Error(`The flag --${flagKey} can only be set once.`);
		}
	}
};

const meow = (helpText, options) => {
	if (typeof helpText !== 'string') {
		options = helpText;
		helpText = '';
	}

	options = {
		pkg: readPkgUp.sync({
			cwd: parentDir,
			normalize: false
		}).packageJson || {},
		argv: process.argv.slice(2),
		flags: {},
		inferType: false,
		input: 'string',
		help: helpText,
		autoHelp: true,
		autoVersion: true,
		booleanDefault: false,
		hardRejection: true,
		...options
	};

	if (options.hardRejection) {
		hardRejection();
	}

	let minimistOptions = {
		arguments: options.input,
		...buildMinimistFlags(options)
	};

	minimistOptions = decamelizeKeys(minimistOptions, '-', {exclude: ['stopEarly', '--']});

	if (options.inferType) {
		delete minimistOptions.arguments;
	}

	minimistOptions = buildMinimistOptions(minimistOptions);

	if (minimistOptions['--']) {
		minimistOptions.configuration = {
			...minimistOptions.configuration,
			'populate--': true
		};
	}

	if (minimistOptions.array !== undefined) {
		// `yargs` supports 'string|number|boolean' arrays,
		// but `minimist-options` only support 'string' as element type.
		// Open issue to add support to `minimist-options`: https://github.com/vadimdemedes/minimist-options/issues/18.
		minimistOptions.array = convertToTypedArrayOption(minimistOptions.array, options.flags);
	}

	const {pkg} = options;
	const argv = yargs(options.argv, minimistOptions);
	let help = redent(trimNewlines((options.help || '').replace(/\t+\n*$/, '')), 2);

	normalizePackageData(pkg);

	process.title = pkg.bin ? Object.keys(pkg.bin)[0] : pkg.name;

	let {description} = options;
	if (!description && description !== false) {
		({description} = pkg);
	}

	help = (description ? `\n  ${description}\n` : '') + (help ? `\n${help}\n` : '\n');

	const showHelp = code => {
		console.log(help);
		process.exit(typeof code === 'number' ? code : 2);
	};

	const showVersion = () => {
		console.log(typeof options.version === 'string' ? options.version : pkg.version);
		process.exit();
	};

	if (argv._.length === 0 && options.argv.length === 1) {
		if (argv.version === true && options.autoVersion) {
			showVersion();
		}

		if (argv.help === true && options.autoHelp) {
			showHelp(0);
		}
	}

	const input = argv._;
	delete argv._;

	const flags = camelcaseKeys(argv, {exclude: ['--', /^\w$/]});
	const unnormalizedFlags = {...flags};

	validateFlags(flags, options);

	for (const flagValue of Object.values(options.flags)) {
		delete flags[flagValue.alias];
	}

	return {
		input,
		flags,
		unnormalizedFlags,
		pkg,
		help,
		showHelp,
		showVersion
	};
};

module.exports = meow;
