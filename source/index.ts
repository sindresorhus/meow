import process from 'node:process';
import parseArguments, {type Options as ParserOptions} from 'yargs-parser';
import camelCaseKeys from 'camelcase-keys';
import {trimNewlines} from 'trim-newlines';
import redent from 'redent';
import {buildOptions} from './options.js';
import {buildParserOptions} from './parser.js';
import {validate, checkUnknownFlags, checkMissingRequiredFlags} from './validate.js';
import type {
	Options,
	ParsedOptions,
	Result,
	AnyFlags,
} from './types.js';

const buildResult = <Flags extends AnyFlags = AnyFlags>({pkg: packageJson, ...options}: ParsedOptions, parserOptions: ParserOptions): Result<Flags> => {
	const {_: input, ...argv} = parseArguments(options.argv as string[], parserOptions);
	let help = '';

	if (options.help) {
		help = trimNewlines((options.help || '').replace(/\t+\n*$/, ''));

		if (help.includes('\n')) {
			help = redent(help, options.helpIndent);
		}

		help = `\n${help}`;
	}

	if (options.description !== false) {
		let {description} = options;

		if (description) {
			description = help ? redent(`\n${description}\n`, options.helpIndent) : `\n${description}`;
			help = `${description}${help}`;
		}
	}

	help += '\n';

	const showHelp = (code?: number) => {
		console.log(help);
		process.exit(typeof code === 'number' ? code : 2); // Default to code 2 for incorrect usage (#47)
	};

	const showVersion = () => {
		console.log(options.version);
		process.exit(0);
	};

	if (input.length === 0 && options.argv.length === 1) {
		if (argv['version'] === true && options.autoVersion) {
			showVersion();
		} else if (argv['help'] === true && options.autoHelp) {
			showHelp(0);
		}
	}

	if (!options.allowUnknownFlags) {
		checkUnknownFlags(input);
	}

	const flags = camelCaseKeys(argv, {exclude: ['--', /^\w$/]});
	const unnormalizedFlags = {...flags};

	validate(flags, options);

	for (const flagValue of Object.values(options.flags)) {
		if (Array.isArray(flagValue.aliases)) {
			for (const alias of flagValue.aliases) {
				delete flags[alias];
			}
		}

		if (flagValue.shortFlag) {
			delete flags[flagValue.shortFlag];
		}
	}

	checkMissingRequiredFlags(options.flags, flags, input as string[]);

	const result = {
		input,
		flags,
		unnormalizedFlags,
		pkg: packageJson,
		help,
		showHelp,
		showVersion,
	};

	return result as unknown as Result<Flags>;
};

/**
@param helpMessage - Shortcut for the `help` option.

@example
```
#!/usr/bin/env node
import meow from 'meow';
import foo from './index.js';

const cli = meow(`
	Usage
	  $ foo <input>

	Options
	  --rainbow, -r  Include a rainbow

	Examples
	  $ foo unicorns --rainbow
	  🌈 unicorns 🌈
`, {
	importMeta: import.meta, // This is required
	flags: {
		rainbow: {
			type: 'boolean',
			shortFlag: 'r'
		}
	}
});

//{
//	input: ['unicorns'],
//	flags: {rainbow: true},
//	...
//}

foo(cli.input.at(0), cli.flags);
```
*/
export default function meow<Flags extends AnyFlags>(helpMessage: string, options: Options<Flags>): Result<Flags>;
export default function meow<Flags extends AnyFlags>(options: Options<Flags>): Result<Flags>;

export default function meow<Flags extends AnyFlags = AnyFlags>(helpMessage: string | Options<Flags>, options?: Options<Flags>): Result<Flags> {
	if (typeof helpMessage !== 'string') {
		options = helpMessage;
		helpMessage = '';
	}

	const parsedOptions = buildOptions(helpMessage, options!);
	const parserOptions = buildParserOptions(parsedOptions);
	const result = buildResult<Flags>(parsedOptions, parserOptions);

	const packageTitle = result.pkg.bin ? Object.keys(result.pkg.bin).at(0) : result.pkg.name;

	// TODO: move to separate PR?
	if (packageTitle) {
		process.title = packageTitle;
	}

	return result;
}
