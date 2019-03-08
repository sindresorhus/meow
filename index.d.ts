import {Options as MinimistOptions} from 'minimist-options';

export interface Options {
	/**
	 * Define argument flags.
	 *
	 * The key is the flag name and the value is an object with any of:
	 *
	 * - `type`: Type of value. (Possible values: `string` `boolean`)
	 * - `alias`: Usually used to define a short flag alias.
	 * - `default`: Default value when the flag is not specified.
	 *
	 * @example
	 *
	 * flags: {
	 * 	unicorn: {
	 * 		type: 'string',
	 * 		alias: 'u',
	 * 		default: 'rainbow'
	 * 	}
	 * }
	 */
	readonly flags?: MinimistOptions;

	/**
	 * Description to show above the help text. Default: The package.json `"description"` property.
	 *
	 * Set it to `false` to disable it altogether.
	 */
	readonly description?: string | false;

	/**
	 * The help text you want shown.
	 *
	 * The input is reindented and starting/ending newlines are trimmed which means you can use a [template literal](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings) without having to care about using the correct amount of indent.
	 *
	 * The description will be shown above your help text automatically.
	 *
	 * Set it to `false` to disable it altogether.
	 */
	readonly help?: string | false;

	/**
	 * Set a custom version output. Default: The package.json `"version"` property.
	 *
	 * Set it to `false` to disable it altogether.
	 */
	readonly version?: string | false;

	/**
	 * Automatically show the help text when the `--help` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own help text.
	 */
	readonly autoHelp?: boolean;

	/**
	 * Automatically show the version text when the `--version` flag is present. Useful to set this value to `false` when a CLI manages child CLIs with their own version text.
	 */
	readonly autoVersion?: boolean;

	/**
	 * package.json as an `Object`. Default: Closest package.json upwards
	 *
	 * *You most likely don't need this option.*
	 */
	readonly pkg?: {[key: string]: unknown};

	/**
	 * Custom arguments object.
	 *
	 * @default process.argv.slice(2)
	 */
	readonly argv?: ReadonlyArray<string>;

	/**
	 * Infer the argument type.
	 *
	 * By default, the argument `5` in `$ foo 5` becomes a string. Enabling this would infer it as a number.
	 *
	 * @default false
	 */
	readonly inferType?: boolean;

	/**
	 * Value of `boolean` flags not defined in `argv`. If set to `undefined` the flags not defined in `argv` will be excluded from the result. The `default` value set in `boolean` flags take precedence over `booleanDefault`.
	 *
	 * **Caution: Explicitly specifying undefined for `booleanDefault` has different meaning from omitting key itself.**
	 *
	 * @example
	 *
	 * const cli = meow(`
	 *	Usage
	 *	  $ foo
	 *
	 *	Options
	 *	  --rainbow, -r  Include a rainbow
	 *	  --unicorn, -u  Include a unicorn
	 *	  --no-sparkles  Exclude sparkles
	 *
	 *	Examples
	 *	  $ foo
	 *	  🌈 unicorns✨🌈
	 * `, {
	 *	booleanDefault: undefined,
	 *	flags: {
	 *		rainbow: {
	 *			type: 'boolean',
	 *			default: true,
	 *			alias: 'r'
	 *		},
	 *		 unicorn: {
	 *			type: 'boolean',
	 *			default: false,
	 *			alias: 'u'
	 *		},
	 *		cake: {
	 *			type: 'boolean',
	 *			alias: 'c'
	 *		},
	 *		sparkles: {
	 *			type: 'boolean',
	 *			default: true
	 *		}
	 *	}
	 * });
	 *
	 * //{
	 * //	flags: {
	 * //		rainbow: true,
	 * //		unicorn: false,
	 * //		sparkles: true
	 * //	},
	 * //	unnormalizedFlags: {
	 * //		rainbow: true,
	 * //		r: true,
	 * //		unicorn: false,
	 * //		u: false,
	 * //		sparkles: true
	 * //	},
	 * //	…
	 * //}
	 */
	readonly booleanDefault?: boolean | null;

	/**
	 * Whether to use [hard-rejection](https://github.com/sindresorhus/hard-rejection) or not. Disabling this can be useful if you need to handle `process.on('unhandledRejection')` yourself.
	 *
	 * @default true
	 */
	readonly hardRejection?: boolean;
}

export interface Result {
	/**
	 * Non-flag arguments.
	 */
	input: string[];

	/**
	 * Flags converted to camelCase excluding aliases.
	 */
	flags: {[name: string]: unknown};

	/**
	 * Flags converted camelCase including aliases.
	 */
	unnormalizedFlags: {[name: string]: unknown};

	/**
	 * The `package.json` object.
	 */
	pkg: {[key: string]: unknown};

	/**
	 * The help text used with `--help`.
	 */
	help: string;

	/**
	 * Show the help text and exit with code.
	 *
	 * @param code The exit code to use. Default: `2`.
	 */
	showHelp(code?: number): void;

	/**
	 * Show the version text and exit.
	 */
	showVersion(): void;
}

/**
 * @param helpMessage - Shortcut for the `help` option.
 */
export default function meow(helpMessage: string, options?: Options): Result;
export default function meow(options?: Options): Result;
