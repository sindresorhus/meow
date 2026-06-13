import type {
	CamelCasedProperties,
	PackageJson,
} from 'type-fest';

export type FlagType = 'string' | 'boolean' | 'number';

/**
Callback function to determine if a flag is required during runtime.

@param flags - Contains the parsed flags converted to camel-case excluding aliases.
@param input - Contains the non-flag arguments.

@returns True if the flag is required, otherwise false.
*/
export type IsRequiredPredicate = (flags: Readonly<Record<string, unknown>>, input: readonly unknown[]) => boolean;

export type Flag<PrimitiveType extends FlagType, Type, IsMultiple = false> = {
	/**
	Type of value. (Possible values: `string` `boolean` `number`)
	*/
	readonly type?: PrimitiveType;

	/**
	Limit valid values to a predefined set of choices.

	@example
	```
	unicorn: {
		isMultiple: true,
		choices: ['rainbow', 'cat', 'unicorn']
	}
	```
	*/
	readonly choices?: Type extends unknown[] ? Type : Type[];

	/**
	Default value when the flag is not specified.

	@example
	```
	unicorn: {
		type: 'boolean',
		default: true
	}
	```
	*/
	readonly default?: Type;

	/**
	A short flag alias.

	@example
	```
	unicorn: {
		shortFlag: 'u'
	}
	```
	*/
	readonly shortFlag?: string;

	/**
	Other names for the flag.

	@example
	```
	unicorn: {
		aliases: ['unicorns', 'uni']
	}
	```
	*/
	readonly aliases?: string[];

	/**
	Indicates a flag can be set multiple times. Values are turned into an array.

	Multiple values are provided by specifying the flag multiple times, for example, `$ foo -u rainbow -u cat`. Space- or comma-separated values [currently *not* supported](https://github.com/sindresorhus/meow/issues/164).

	@default false
	*/
	readonly isMultiple?: IsMultiple;

	/**
	Determine if the flag is required.

	If it's only known at runtime whether the flag is required or not you can pass a Function instead of a boolean, which based on the given flags and other non-flag arguments should decide if the flag is required.

	- The first argument is the **flags** object, which contains the flags converted to camel-case excluding aliases.
	- The second argument is the **input** string array, which contains the non-flag arguments.
	- The function should return a `boolean`, true if the flag is required, otherwise false.

	@default false

	@example
	```
	isRequired: (flags, input) => {
		if (flags.otherFlag) {
			return true;
		}

		return false;
	}
	```
	*/
	readonly isRequired?: boolean | IsRequiredPredicate;
};

type StringFlag = Flag<'string', string> | Flag<'string', string[], true>;
type BooleanFlag = Flag<'boolean', boolean> | Flag<'boolean', boolean[], true>;
type NumberFlag = Flag<'number', number> | Flag<'number', number[], true>;
export type AnyFlag = StringFlag | BooleanFlag | NumberFlag;
export type AnyFlags = Record<string, AnyFlag>;

export type InputOptionType = 'string' | 'boolean' | 'number' | 'array' | 'string-array' | 'boolean-array' | 'number-array';

export type InputOption = {
	/**
	The data type the input arguments should be parsed to.
	*/
	readonly type?: InputOptionType;

	/**
	Determine if at least one non-flag input argument is required.

	If it's only known at runtime whether the input is required or not, you can pass a `Function` instead of a `boolean`, which based on the given input should decide if it's required.

	@default false

	@example
	```
	input: {
		isRequired: true
	}
	```
	*/
	readonly isRequired?: boolean | ((input: readonly unknown[]) => boolean);
};

type InvalidDashedFlagKeys<Flags extends AnyFlags> = {
	readonly [F in keyof Flags as F extends string ? F extends '--' ? never : F extends `${string}-${string}` ? F : never : never]?: never;
};

type FlagsOption<Flags extends AnyFlags> = Flags & InvalidDashedFlagKeys<Flags>;

export type Options<
	Flags extends AnyFlags,
	Input extends InputOption | InputOptionType | undefined = InputOption | InputOptionType | undefined,
	InferType extends boolean | undefined = boolean | undefined,
> = {
	/**
	Pass in [`import.meta`](https://nodejs.org/dist/latest/docs/api/esm.html#esm_import_meta). This is used to find the correct package.json file.
	*/
	readonly importMeta: ImportMeta;

	/**
	Define argument flags.

	The key is the flag name in camel-case and the value is an object with any of:

	- `type`: Type of value. (Possible values: `string` `boolean` `number`)
	- `choices`: Limit valid values to a predefined set of choices.
	- `default`: Default value when the flag is not specified.
	- `shortFlag`: A short flag alias.
	- `aliases`: Other names for the flag.
	- `isMultiple`: Indicates a flag can be set multiple times. Values are turned into an array. (Default: false)
		- Multiple values are provided by specifying the flag multiple times, for example, `$ foo -u rainbow -u cat`. Space- or comma-separated values [currently *not* supported](https://github.com/sindresorhus/meow/issues/164).
	- `isRequired`: Determine if the flag is required. (Default: false)
		- If it's only known at runtime whether the flag is required or not, you can pass a `Function` instead of a `boolean`, which based on the given flags and other non-flag arguments, should decide if the flag is required. Two arguments are passed to the function:
		- The first argument is the **flags** object, which contains the flags converted to camel-case excluding aliases.
		- The second argument is the **input** string array, which contains the non-flag arguments.
		- The function should return a `boolean`, true if the flag is required, otherwise false.

	Note that flags are always defined using a camel-case key (`myKey`), but will match arguments in kebab-case (`--my-key`).

	@example
	```
	flags: {
		unicorn: {
			type: 'string',
			choices: ['rainbow', 'cat', 'unicorn'],
			default: ['rainbow', 'cat'],
			shortFlag: 'u',
			aliases: ['unicorns'],
			isMultiple: true,
			isRequired: (flags, input) => {
				if (flags.otherFlag) {
					return true;
				}

				return false;
			}
		}
	}
	```
	*/
	readonly flags?: Flags;

	/**
	Options for non-flag input arguments.

	@example
	```
	input: 'number'
	```

	@example
	```
	input: {
		type: 'number',
		isRequired: true
	}
	```
	*/
	readonly input?: Input;

	/**
	List of valid commands. Commands must be a single argument without whitespace and must not start with `-`.

	When set, parsing stops at the first non-flag argument and treats it as the command. The remaining arguments are returned in `input` so they can be passed to a subcommand parser. An unknown command will show help and exit with code 2. Parent flags must appear before the command.

	If no command is given, `cli.command` is `undefined` and meow does not exit — you decide what to do (show help, run a default, etc.).

	@example
	```
	import meow from 'meow';

	const cli = meow({
		importMeta: import.meta,
		commands: ['run', 'list'],
		flags: {
			verbose: {
				type: 'boolean',
				shortFlag: 'v'
			}
		}
	});

	if (!cli.command) {
		cli.showHelp(0);
	}

	if (cli.command === 'run') {
		const runCli = meow({importMeta: import.meta, argv: cli.input});
	}
	```
	*/
	readonly commands?: readonly string[];

	/**
	Description to show above the help text. Default: The package.json `"description"` property.

	Set it to `false` to disable it altogether.
	*/
	readonly description?: string | false;

	/**
	The help text you want shown.

	The input is reindented and starting/ending newlines are trimmed which means you can use a [template literal](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings) without having to care about using the correct amount of indent.

	The description will be shown above your help text automatically.

	Set it to `false` to disable it altogether.
	*/
	readonly help?: string | false;

	/**
	Set a custom version output. Default: The package.json `"version"` property.
	*/
	readonly version?: string;

	/**
	Automatically show the help text when the `--help` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own help text.

	This is only triggered when `--help` is the only argument.
	*/
	readonly autoHelp?: boolean;

	/**
	Automatically show the version text when the `--version` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own version text.

	This is only triggered when `--version` is the only argument.
	*/
	readonly autoVersion?: boolean;

	/**
	`package.json` as an `Object`. Default: Closest `package.json` upwards.

	Note: Setting this stops `meow` from finding a package.json.

	_You most likely don't need this option._
	*/
	readonly pkg?: Record<string, unknown>;

	/**
	Custom arguments object.

	@default process.argv.slice(2)
	*/
	readonly argv?: readonly string[];

	/**
	Infer the argument type.

	By default, the argument `5` in `$ foo 5` becomes a string. Enabling this would infer it as a number.

	@default false
	*/
	readonly inferType?: InferType;

	/**
	Value of `boolean` flags not defined in `argv`.

	If set to `undefined`, the flags not defined in `argv` will be excluded from the result. The `default` value set in `boolean` flags take precedence over `booleanDefault`.

	_Note: If used in conjunction with `isMultiple`, the default flag value is set to `[]`._

	__Caution: Explicitly specifying `undefined` for `booleanDefault` has different meaning from omitting key itself.__

	@example
	```
	import meow from 'meow';

	const cli = meow(`
		Usage
			$ foo

		Options
			--rainbow, -r  Include a rainbow
			--unicorn, -u  Include a unicorn
			--no-sparkles  Exclude sparkles

		Examples
			$ foo
			🌈 unicorns✨🌈
	`, {
		importMeta: import.meta,
		booleanDefault: undefined,
		flags: {
			rainbow: {
				type: 'boolean',
				default: true,
				shortFlag: 'r'
			},
				unicorn: {
				type: 'boolean',
				default: false,
				shortFlag: 'u'
			},
			cake: {
				type: 'boolean',
				shortFlag: 'c'
			},
			sparkles: {
				type: 'boolean',
				default: true
			}
		}
	});

	//{
	//	flags: {
	//		rainbow: true,
	//		unicorn: false,
	//		sparkles: true
	//	},
	//	unnormalizedFlags: {
	//		rainbow: true,
	//		r: true,
	//		unicorn: false,
	//		u: false,
	//		sparkles: true
	//	},
	//	…
	//}
	```
	*/
	readonly booleanDefault?: boolean | undefined;

	/**
	Whether to allow unknown flags or not.

	@default true
	*/
	readonly allowUnknownFlags?: boolean;

	/**
	The number of spaces to use for indenting the help text.

	@default 2
	*/
	readonly helpIndent?: number;
};

type TypedFlag<Flag extends AnyFlag> =
		Flag extends {type: 'number'}
			? number
			: Flag extends {type: 'string'}
				? string
				: Flag extends {type: 'boolean'}
					? boolean
					: unknown;

type PossiblyOptionalFlag<Flag extends AnyFlag, FlagType> =
		Flag extends {isRequired: true}
			? FlagType
			: Flag extends {default: any}
				? FlagType
				: FlagType | undefined;

export type TypedFlags<Flags extends AnyFlags> = {
	[F in keyof Flags]: Flags[F] extends {isMultiple: true}
		? PossiblyOptionalFlag<Flags[F], Array<TypedFlag<Flags[F]>>>
		: PossiblyOptionalFlag<Flags[F], TypedFlag<Flags[F]>>
};

type InputTypeName<Input> =
	Input extends {type: infer Type extends InputOptionType}
		? Type
		: Input extends InputOptionType
			? Input
			: 'string';

type TypedInputValue<Input extends InputOption | InputOptionType | undefined, InferType extends boolean | undefined> =
	InferType extends true
		? string | number
		: InputTypeName<Input> extends 'number' | 'number-array'
			? number
			: InputTypeName<Input> extends 'boolean' | 'boolean-array'
				? boolean
				: InputTypeName<Input> extends 'array'
					? unknown
					: string;

export type TypedInput<Input extends InputOption | InputOptionType | undefined, InferType extends boolean | undefined> = Array<TypedInputValue<Input, InferType>>;

export type Result<
	Flags extends AnyFlags,
	Input extends InputOption | InputOptionType | undefined = undefined,
	InferType extends boolean | undefined = undefined,
> = {
	/**
	Non-flag arguments.
	*/
	input: TypedInput<Input, InferType>;

	/**
	Command name when using the `commands` option.
	*/
	command?: string;

	/**
	Flags converted to camelCase excluding aliases.
	*/
	flags: CamelCasedProperties<TypedFlags<Flags>> & Record<string, unknown>;

	/**
	Flags converted camelCase including aliases.
	*/
	unnormalizedFlags: TypedFlags<Flags> & Record<string, unknown>;

	/**
	The `package.json` object.
	*/
	pkg: PackageJson;

	/**
	The help text used with `--help`.
	*/
	help: string;

	/**
	Show the help text and exit with code.

	@param exitCode - The exit code to use. Default: `2`.
	*/
	showHelp: (exitCode?: number) => never;

	/**
	Show the version text and exit.
	*/
	showVersion: () => never;
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
type AnyOptions = Options<AnyFlags>;

type OptionFlags<Option> = Option extends {flags?: infer Flags extends AnyFlags} ? Flags : Record<never, never>;

type OptionInput<Option> = Option extends {input?: infer Input extends InputOption | InputOptionType | undefined} ? Input : undefined;

type OptionInferType<Option> = Option extends {inferType?: infer InferType extends boolean | undefined} ? InferType : undefined;

type ValidatedOptions<Option> = Option extends {flags?: infer Flags extends AnyFlags} ? {readonly flags?: FlagsOption<Flags>} : unknown;

export default function meow<Option extends AnyOptions>(helpMessage: string, options: Option & ValidatedOptions<Option>): Result<OptionFlags<Option>, OptionInput<Option>, OptionInferType<Option>>;
export default function meow<Option extends AnyOptions>(options: Option & ValidatedOptions<Option>): Result<OptionFlags<Option>, OptionInput<Option>, OptionInferType<Option>>;
