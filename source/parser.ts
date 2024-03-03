import constructParserOptions, {
	type Options as ParserFlags,
	type MinimistOptions,
	type AnyOption as ParserFlag,
} from 'minimist-options';
import type {Options as YargsOptions} from 'yargs-parser';
import decamelizeKeys from 'decamelize-keys';
import type {Writable} from 'type-fest';
import type {ParsedOptions, AnyFlag} from './types.js';

type ParserOptions = YargsOptions & MinimistOptions;

const buildParserFlags = ({flags, booleanDefault}: ParsedOptions): ParserFlags => {
	const parserFlags: ParserFlags = {};

	for (const [flagKey, flagValue] of Object.entries(flags)) {
		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const flag = {...flagValue} as Writable<AnyFlag & ParserFlag>;

		// `minimist-options` expects `flag.alias`
		if (flag.shortFlag) {
			flag.alias = flag.shortFlag;
			delete flag.shortFlag;
		}

		if (booleanDefault !== undefined && flag.type === 'boolean' && !Object.hasOwn(flag, 'default')) {
			// TODO:
			// @ts-expect-error: not sure
			flag.default = flag.isMultiple ? [booleanDefault] : booleanDefault;
		}

		if (flag.isMultiple) {
			// TODO:
			// @ts-expect-error: doesn't allow array types?
			flag.type = flag.type ? `${flag.type}-array` : 'array';
			flag.default ??= [];
			delete flag.isMultiple;
		}

		if (Array.isArray(flag.aliases)) {
			if (flag.alias) {
				flag.aliases.push(flag.alias as string);
			}

			flag.alias = flag.aliases;
			delete flag.aliases;
		}

		parserFlags[flagKey] = flag as ParserFlag;
	}

	return parserFlags;
};

export const buildParserOptions = (options: ParsedOptions): YargsOptions => {
	let parserFlags = buildParserFlags(options);

	if (!options.inferType) {
		parserFlags.arguments = options.input;
	}

	parserFlags = decamelizeKeys(parserFlags, {separator: '-', exclude: ['stopEarly', '--']});

	// Add --help and --version to known flags if autoHelp or autoVersion are set
	if (!options.allowUnknownFlags) {
		if (options.autoHelp && !parserFlags['help']) {
			parserFlags['help'] = {type: 'boolean'};
		}

		if (options.autoVersion && !parserFlags['version']) {
			parserFlags['version'] = {type: 'boolean'};
		}
	}

	const parserOptions = constructParserOptions(parserFlags) as ParserOptions;

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

	return parserOptions;
};
