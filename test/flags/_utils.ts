/* eslint-disable ava/no-ignored-test-files */
import test from 'ava';
import meow from '../../source/index.js';

export const _verifyFlags = importMeta => test.macro(async (t, {flags = {}, args, expected, error, ...meowOptions}) => {
	const assertions = await t.try(async tt => {
		const arguments_ = args?.split(' ') ?? [];

		meowOptions = {
			...meowOptions,
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
