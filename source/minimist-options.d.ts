/* eslint-disable import/no-extraneous-dependencies */
declare module 'minimist-options' {
	import type {Opts as MinimistOptions} from 'minimist';

	export type {Opts as MinimistOptions} from 'minimist';

	export type OptionType = 'string' | 'boolean' | 'number' | 'array' | 'string-array' | 'boolean-array' | 'number-array';

	export type BaseOption<
		TypeOptionType extends OptionType,
		DefaultOptionType,
	> = {
		/**
		 * The data type the option should be parsed to.
		 */
		readonly type?: TypeOptionType;

		/**
		 * An alias/list of aliases for the option.
		 */
		readonly alias?: string | readonly string[];

		/**
		 * The default value for the option.
		 */
		readonly default?: DefaultOptionType;
	};

	export type StringOption = BaseOption<'string', string>;
	export type BooleanOption = BaseOption<'boolean', boolean>;
	export type NumberOption = BaseOption<'number', number>;
	export type DefaultArrayOption = BaseOption<'array', readonly string[]>;
	export type StringArrayOption = BaseOption<'string-array', readonly string[]>;
	export type BooleanArrayOption = BaseOption<'boolean-array', readonly boolean[]>;
	export type NumberArrayOption = BaseOption<'number-array', readonly number[]>;

	export type AnyOption = (
		| StringOption
		| BooleanOption
		| NumberOption
		| DefaultArrayOption
		| StringArrayOption
		| BooleanArrayOption
		| NumberArrayOption
	);

	export type MinimistOption = Pick<MinimistOptions, 'stopEarly' | 'unknown' | '--'>;

	export type Options = MinimistOption & Record<string, (
		| OptionType
		| StringOption
		| BooleanOption
		| NumberOption
		| DefaultArrayOption
		| StringArrayOption
		| BooleanArrayOption
		| NumberArrayOption
	)> & {
		arguments?: string;
	};

	/**
	 * Write options for [minimist](https://npmjs.org/package/minimist) in a comfortable way. Support string, boolean, number and array options.
	 */
	export default function buildOptions(options?: Options): MinimistOptions;
}
