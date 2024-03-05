
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import test, {registerCompletionHandler} from 'ava';
import {
	execa,
	type ExecaChildProcess,
	type ExecaReturnValue,
	type Options as ExecaOptions,
} from 'execa';
import {readPackage} from 'read-pkg';
import {createTag, stripIndentTransformer, trimResultTransformer} from 'common-tags';
import StackUtils from 'stack-utils';
import type {RequireOneOrNone} from 'type-fest';
import type {Options, AnyFlags} from '../source/types.js';

export const defaultFixture = 'fixture.ts';

const getFixture = (fixture: string): string => fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url));

export async function spawnFixture(arguments_: string[]): Promise<ExecaChildProcess>;
export async function spawnFixture(fixture: string, arguments_?: string[], options?: ExecaOptions): Promise<ExecaChildProcess>;

export async function spawnFixture(fixture: string | string[] = defaultFixture, arguments_: string[] = [], options: ExecaOptions = {}): Promise<ExecaChildProcess> {
	// Allow calling with arguments first
	if (Array.isArray(fixture)) {
		arguments_ = fixture;
		fixture = defaultFixture;
	}

	return execa(getFixture(fixture), arguments_, options);
}

export {stripIndent} from 'common-tags';

// Use old behavior prior to zspecza/common-tags#165
export const stripIndentTrim = createTag(
	stripIndentTransformer(),
	trimResultTransformer(),
);

export const meowPackage = await readPackage();
export const meowVersion = meowPackage.version;

const stackUtils = new StackUtils();

export const stackToErrorMessage = (stack: string) => stackUtils.clean(stack).split('\n').at(0);

export type MeowOptions = Omit<Options<AnyFlags>, 'importMeta'>;

type VerifyCliMacroArguments = [{
	fixture?: string;
	args?: string;
	execaOptions?: ExecaOptions;
} & RequireOneOrNone<{
	expected: string;
	error: string | {
		message: string;
		code: number;
		clean?: boolean;
	};
}, 'expected' | 'error'>];

registerCompletionHandler(() => {
	process.exit(0);
});

export const _verifyCli = (baseFixture = defaultFixture) => test.macro<VerifyCliMacroArguments>(
	async (t, {fixture = baseFixture, args, execaOptions, expected, error}) => {
		const assertions = await t.try(async tt => {
			const arguments_ = args ? args.split(' ') : [];
			const {all: output, exitCode} = await spawnFixture(fixture, arguments_, {reject: false, all: true, ...execaOptions}) as ExecaReturnValue & {all: string};
			tt.log('args:', arguments_);

			if (error) {
				tt.log(`error (code ${exitCode}):\n`, output);

				if (typeof error === 'string') {
					tt.is(output, error);
					tt.is(exitCode, 2);
				} else {
					const error_ = error.clean ? stackToErrorMessage(output) : output;

					tt.is(error_, error.message);
					tt.is(exitCode, error.code);
				}
			} else {
				tt.log('output:\n', output);

				if (expected) {
					tt.is(output, expected);
				} else {
					tt.pass();
				}
			}
		});

		assertions.commit({retainLogs: !assertions.passed});
	},
);
