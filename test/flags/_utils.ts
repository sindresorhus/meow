/* eslint-disable ava/no-ignored-test-files */
import test from 'ava';
import type {RequireOneOrNone} from 'type-fest';
import type {MeowOptions as _MeowOptions} from '../_utils.js';
import type {AnyFlags} from '../../source/types.js';
import meow from '../../source/index.js';

type MeowOptions = Omit<_MeowOptions, 'argv' | 'flags'>;

type VerifyFlagsMacroArguments = [{
	[option: string]: MeowOptions[keyof MeowOptions];
	flags?: AnyFlags;
	args?: string;
} & RequireOneOrNone<{
	expected: Record<string, unknown>;
	error: string;
}, 'expected' | 'error'>];

export const _verifyFlags = (importMeta: ImportMeta) => test.macro<VerifyFlagsMacroArguments>(async (t, {flags = {}, args, expected, error, ..._meowOptions}) => {
	const assertions = await t.try(async tt => {
		const arguments_ = args?.split(' ') ?? [];

		const meowOptions = {
			..._meowOptions,
			importMeta,
			argv: arguments_,
			flags,
		};

		tt.log('arguments:', arguments_);

		if (error) {
			tt.throws(() => meow(meowOptions), {
				message(message) {
					tt.log('error:\n', message);
					return tt.is(message, error);
				},
			});
		} else {
			const cli = meow(meowOptions);

			if (expected) {
				tt.like(cli.flags, expected);
			} else {
				tt.pass();
			}
		}
	});

	assertions.commit({retainLogs: !assertions.passed});
});
