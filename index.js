import {dirname} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import buildParserOptions from 'minimist-options';
import parseArguments from 'yargs-parser';
import camelCaseKeys from 'camelcase-keys';
import decamelize from 'decamelize';
import decamelizeKeys from 'decamelize-keys';
import trimNewlines from 'trim-newlines';
import redent from 'redent';
import {readPackageUpSync} from 'read-pkg-up';
import hardRejection from 'hard-rejection';
import normalizePackageData from 'normalize-package-data';

const isFlagMissing = (flagName, definedFlags, receivedFlags, input) => {
	const flag = definedFlags[flagName];
	let isFlagRequired = true;

	if (typeof flag.isRequired === 'function') {
		isFlagRequired = flag.isRequired(receivedFlags, input);
		if (typeof isFlagRequired !== 'boolean') {
			throw new TypeError(`Return value for isRequired callback should be of type boolean, but ${typeof isFlagRequired} was returned.`);
		}
	}

	if (typeof receivedFlags[flagName] === 'undefined') {
		return isFlagRequired;
	}

	return flag.isMultiple && receivedFlags[flagName].length === 0 && isFlagRequired;
};

const getMissingRequiredFlags = (flags, receivedFlags, input) => {
	const missingRequiredFlags = [];
	if (typeof flags === 'undefined') {
		return [];
	}

	for (const flagName of Object.keys(flags)) {
		if (flags[flagName].isRequired && isFlagMissing(flagName, flags, receivedFlags, input)) {
			missingRequiredFlags.push({key: flagName, ...flags[flagName]});
		}
	}

	return missingRequiredFlags;
};

const decamelizeFlagKey = flagKey => `--${decamelize(flagKey, {separator: '-'})}`;

const reportMissingRequiredFlags = missingRequiredFlags => {
	console.error(`Missing required flag${missingRequiredFlags.length > 1 ? 's' : ''}`);
	for (const flag of missingRequiredFlags) {
		console.error(`\t${decamelizeFlagKey(flag.key)}${flag.shortFlag ? `, -${flag.shortFlag}` : ''}`);
	}
};

const joinFlagKeys = (flagKeys, prefix = '--') => `\`${prefix}${flagKeys.join(`\`, \`${prefix}`)}\``;

const validateOptions = options => {
	const invalidOptionFilters = {
		flags: {
			keyContainsDashes: {
				filter: ([flagKey]) => flagKey.includes('-') && flagKey !== '--',
				message: flagKeys => `Flag keys may not contain '-'. Invalid flags: ${joinFlagKeys(flagKeys, '')}`,
			},
			aliasIsSet: {
				filter: ([, flag]) => flag.alias !== undefined,
				message: flagKeys => `The option \`alias\` has been renamed to \`shortFlag\`. The following flags need to be updated: ${joinFlagKeys(flagKeys)}`,
			},
			choicesNotAnArray: {
				filter: ([, flag]) => flag.choices !== undefined && !Array.isArray(flag.choices),
				message: flagKeys => `The option \`choices\` must be an array. Invalid flags: ${joinFlagKeys(flagKeys)}`,
			},
			choicesNotMatchFlagType: {
				filter: ([, flag]) => flag.type && Array.isArray(flag.choices) && flag.choices.some(choice => typeof choice !== flag.type),
				message(flagKeys) {
					const flagKeysAndTypes = flagKeys.map(flagKey => `(\`${decamelizeFlagKey(flagKey)}\`, type: '${options.flags[flagKey].type}')`);
					return `Each value of the option \`choices\` must be of the same type as its flag. Invalid flags: ${flagKeysAndTypes.join(', ')}`;
				},
			},
			defaultNotInChoices: {
				filter: ([, flag]) => flag.default && Array.isArray(flag.choices) && [flag.default].flat().every(value => flag.choices.includes(value)),
				message: flagKeys => `Each value of the option \`default\` must exist within the option \`choices\`. Invalid flags: ${joinFlagKeys(flagKeys)}`,
			},
		},
	};

	const errorMessages = [];

	for (const [optionKey, filters] of Object.entries(invalidOptionFilters)) {
		const optionEntries = Object.entries(options[optionKey]);

		for (const {filter, message} of Object.values(filters)) {
			const invalidOptions = optionEntries.filter(option => filter(option));
			const invalidOptionKeys = invalidOptions.map(([key]) => key);

			if (invalidOptions.length > 0) {
				errorMessages.push(message(invalidOptionKeys));
			}
		}
	}

	if (errorMessages.length > 0) {
		throw new Error(errorMessages.join('\n'));
	}
};

const validateChoicesByFlag = (flagKey, flagValue, receivedInput) => {
	const {choices, isRequired} = flagValue;

	if (!choices) {
		return;
	}

	const valueMustBeOneOf = `Value must be one of: [\`${choices.join('`, `')}\`]`;

	if (!receivedInput) {
		if (isRequired) {
			return `Flag \`${decamelizeFlagKey(flagKey)}\` has no value. ${valueMustBeOneOf}`;
		}

		return;
	}

	if (Array.isArray(receivedInput)) {
		const unknownValues = receivedInput.filter(index => !choices.includes(index));

		if (unknownValues.length > 0) {
			const valuesText = unknownValues.length > 1 ? 'values' : 'value';

			return `Unknown ${valuesText} for flag \`${decamelizeFlagKey(flagKey)}\`: \`${unknownValues.join('`, `')}\`. ${valueMustBeOneOf}`;
		}
	} else if (!choices.includes(receivedInput)) {
		return `Unknown value for flag \`${decamelizeFlagKey(flagKey)}\`: \`${receivedInput}\`. ${valueMustBeOneOf}`;
	}
};

const validateChoices = (flags, receivedFlags) => {
	const errors = [];

	for (const [flagKey, flagValue] of Object.entries(flags)) {
		const receivedInput = receivedFlags[flagKey];
		const errorMessage = validateChoicesByFlag(flagKey, flagValue, receivedInput);

		if (errorMessage) {
			errors.push(errorMessage);
		}
	}

	if (errors.length > 0) {
		throw new Error(`${errors.join('\n')}`);
	}
};

const reportUnknownFlags = unknownFlags => {
	console.error([
		`Unknown flag${unknownFlags.length > 1 ? 's' : ''}`,
		...unknownFlags,
	].join('\n'));
};

const buildParserFlags = ({flags, booleanDefault}) => {
	const parserFlags = {};

	for (const [flagKey, flagValue] of Object.entries(flags)) {
		const flag = {...flagValue};

		// `buildParserOptions` expects `flag.alias`
		if (flag.shortFlag) {
			flag.alias = flag.shortFlag;
			delete flag.shortFlag;
		}

		if (
			typeof booleanDefault !== 'undefined'
				&& flag.type === 'boolean'
				&& !Object.prototype.hasOwnProperty.call(flag, 'default')
		) {
			flag.default = flag.isMultiple ? [booleanDefault] : booleanDefault;
		}

		if (flag.isMultiple) {
			flag.type = flag.type ? `${flag.type}-array` : 'array';
			flag.default = flag.default ?? [];
			delete flag.isMultiple;
		}

		if (Array.isArray(flag.aliases)) {
			if (flag.alias) {
				flag.aliases.push(flag.alias);
			}

			flag.alias = flag.aliases;
			delete flag.aliases;
		}

		parserFlags[flagKey] = flag;
	}

	return parserFlags;
};

const validateFlags = (flags, options) => {
	for (const [flagKey, flagValue] of Object.entries(options.flags)) {
		if (flagKey !== '--' && !flagValue.isMultiple && Array.isArray(flags[flagKey])) {
			throw new Error(`The flag --${flagKey} can only be set once.`);
		}
	}
};

/* eslint complexity: off */
const meow = (helpText, options = {}) => {
	if (typeof helpText !== 'string') {
		options = helpText;
		helpText = '';
	}

	if (!options.importMeta?.url) {
		throw new TypeError('The `importMeta` option is required. Its value must be `import.meta`.');
	}

	const foundPackage = readPackageUpSync({
		cwd: dirname(fileURLToPath(options.importMeta.url)),
		normalize: false,
	});

	options = {
		pkg: foundPackage ? foundPackage.packageJson : {},
		argv: process.argv.slice(2),
		flags: {},
		inferType: false,
		input: 'string',
		help: helpText,
		autoHelp: true,
		autoVersion: true,
		booleanDefault: false,
		hardRejection: true,
		allowUnknownFlags: true,
		...options,
	};

	if (options.hardRejection) {
		hardRejection();
	}

	validateOptions(options);
	let parserOptions = {
		arguments: options.input,
		...buildParserFlags(options),
	};

	parserOptions = decamelizeKeys(parserOptions, '-', {exclude: ['stopEarly', '--']});

	if (options.inferType) {
		delete parserOptions.arguments;
	}

	// Add --help and --version to known flags if autoHelp or autoVersion are set
	if (!options.allowUnknownFlags) {
		if (options.autoHelp && !parserOptions.help) {
			parserOptions.help = {type: 'boolean'};
		}

		if (options.autoVersion && !parserOptions.version) {
			parserOptions.version = {type: 'boolean'};
		}
	}

	parserOptions = buildParserOptions(parserOptions);

	parserOptions.configuration = {
		...parserOptions.configuration,
		'greedy-arrays': false,
	};

	if (parserOptions['--']) {
		parserOptions.configuration['populate--'] = true;
	}

	if (!options.allowUnknownFlags) {
		// Collect unknown options in `argv._` to be checked later.
		parserOptions.configuration['unknown-options-as-args'] = true;
	}

	const {pkg: package_} = options;
	const argv = parseArguments(options.argv, parserOptions);
	let help = redent(trimNewlines((options.help ?? '').replace(/\t+\n*$/, '')), 2);

	normalizePackageData(package_);

	process.title = package_.bin ? Object.keys(package_.bin)[0] : package_.name;

	let {description} = options;
	if (!description && description !== false) {
		({description} = package_);
	}

	help = (description ? `\n  ${description}\n` : '') + (help ? `\n${help}\n` : '\n');

	const showHelp = code => {
		console.log(help);
		process.exit(typeof code === 'number' ? code : 2);
	};

	const showVersion = () => {
		console.log(typeof options.version === 'string' ? options.version : package_.version);
		process.exit(0);
	};

	if (argv._.length === 0 && options.argv.length === 1) {
		if (argv.version === true && options.autoVersion) {
			showVersion();
		} else if (argv.help === true && options.autoHelp) {
			showHelp(0);
		}
	}

	const input = argv._;
	delete argv._;

	if (!options.allowUnknownFlags) {
		const unknownFlags = input.filter(item => typeof item === 'string' && item.startsWith('-'));
		if (unknownFlags.length > 0) {
			reportUnknownFlags(unknownFlags);
			process.exit(2);
		}
	}

	const flags = camelCaseKeys(argv, {exclude: ['--', /^\w$/]});
	const unnormalizedFlags = {...flags};

	validateFlags(flags, options);
	validateChoices(options.flags, flags);

	for (const flagValue of Object.values(options.flags)) {
		if (Array.isArray(flagValue.aliases)) {
			for (const alias of flagValue.aliases) {
				delete flags[alias];
			}
		}

		delete flags[flagValue.shortFlag];
	}

	const missingRequiredFlags = getMissingRequiredFlags(options.flags, flags, input);
	if (missingRequiredFlags.length > 0) {
		reportMissingRequiredFlags(missingRequiredFlags);
		process.exit(2);
	}

	return {
		input,
		flags,
		unnormalizedFlags,
		pkg: package_,
		help,
		showHelp,
		showVersion,
	};
};

export default meow;
