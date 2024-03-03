import process from 'node:process';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPackageUpSync, type PackageJson} from 'read-package-up';
import normalizePackageData from 'normalize-package-data';
import {decamelizeFlagKey, joinFlagKeys} from './utils.js';
import type {
	Options,
	ParsedOptions,
	AnyFlag,
	AnyFlags,
} from './types.js';

type InvalidOptionFilter = {
	filter: (flag: [flagKey: string, flag: AnyFlag]) => boolean;
	message: (flagKeys: string[]) => string;
};

type InvalidOptionFilters = {
	flags: Record<string, InvalidOptionFilter>;
};

const validateOptions = (options: ParsedOptions): void => {
	const invalidOptionFilters: InvalidOptionFilters = {
		flags: {
			keyContainsDashes: {
				filter: ([flagKey]) => flagKey.includes('-') && flagKey !== '--',
				message: flagKeys => `Flag keys may not contain '-'. Invalid flags: ${joinFlagKeys(flagKeys, '')}`,
			},
			aliasIsSet: {
				filter: ([, flag]) => Object.hasOwn(flag, 'alias'),
				message: flagKeys => `The option \`alias\` has been renamed to \`shortFlag\`. The following flags need to be updated: ${joinFlagKeys(flagKeys)}`,
			},
			choicesNotAnArray: {
				filter: ([, flag]) => Object.hasOwn(flag, 'choices') && !Array.isArray(flag.choices),
				message: flagKeys => `The option \`choices\` must be an array. Invalid flags: ${joinFlagKeys(flagKeys)}`,
			},
			choicesNotMatchFlagType: {
				filter: ([, flag]) => flag.type !== undefined && Array.isArray(flag.choices) && flag.choices.some(choice => typeof choice !== flag.type),
				message(flagKeys) {
					const flagKeysAndTypes = flagKeys.map(flagKey => `(\`${decamelizeFlagKey(flagKey)}\`, type: '${options.flags[flagKey]!.type}')`);
					return `Each value of the option \`choices\` must be of the same type as its flag. Invalid flags: ${flagKeysAndTypes.join(', ')}`;
				},
			},
			defaultNotInChoices: {
				filter: ([, flag]) => flag.default !== undefined && Array.isArray(flag.choices) && ![flag.default].flat().every(value => flag.choices!.includes(value as never)), // TODO: never?
				message: flagKeys => `Each value of the option \`default\` must exist within the option \`choices\`. Invalid flags: ${joinFlagKeys(flagKeys)}`,
			},
		},
	};

	const errorMessages = [];
	type Entry = ['flags', Record<string, InvalidOptionFilter>];

	for (const [optionKey, filters] of Object.entries(invalidOptionFilters) as Entry[]) {
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

export const buildOptions = (helpMessage: string, options: Options<AnyFlags>): ParsedOptions => {
	if (!options?.importMeta?.url) {
		throw new TypeError('The `importMeta` option is required. Its value must be `import.meta`.');
	}

	const foundPackage = options.pkg as PackageJson ?? readPackageUpSync({
		cwd: dirname(fileURLToPath(options.importMeta.url)),
		normalize: false,
	})?.packageJson;

	// eslint-disable-next-line unicorn/prevent-abbreviations
	const pkg = foundPackage ?? {};
	normalizePackageData(pkg);

	const parsedOptions: ParsedOptions = {
		argv: process.argv.slice(2),
		flags: {},
		inferType: false,
		input: 'string', // TODO: undocumented option?
		description: pkg.description ?? false,
		help: helpMessage,
		version: pkg.version || 'No version found', // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing
		autoHelp: true,
		autoVersion: true,
		booleanDefault: false,
		allowUnknownFlags: true,
		allowParentFlags: true,
		helpIndent: 2,
		...options,
		pkg,
	};

	validateOptions(parsedOptions);

	return parsedOptions;
};
