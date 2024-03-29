/* eslint-disable ava/no-ignored-test-files */
import {fileURLToPath} from 'node:url';
import test from 'ava';
import {execa} from 'execa';
import {readPackage} from 'read-pkg';
import {createTag, stripIndentTransformer, trimResultTransformer} from 'common-tags';
import StackUtils from 'stack-utils';

export const defaultFixture = 'fixture.js';

const getFixture = fixture => fileURLToPath(new URL(`fixtures/${fixture}`, import.meta.url));

export const spawnFixture = async (fixture = defaultFixture, arguments_ = [], options = {}) => {
	// Allow calling with arguments first
	if (Array.isArray(fixture)) {
		arguments_ = fixture;
		fixture = defaultFixture;
	}

	return execa(getFixture(fixture), arguments_, options);
};

export {stripIndent} from 'common-tags';

// Use old behavior prior to zspecza/common-tags#165
export const stripIndentTrim = createTag(
	stripIndentTransformer(),
	trimResultTransformer(),
);

export const meowPackage = await readPackage();
export const meowVersion = meowPackage.version;

const stackUtils = new StackUtils();

export const stackToErrorMessage = stack => stackUtils.clean(stack).split('\n').at(0);

export const _verifyCli = (baseFixture = defaultFixture) => test.macro(
	async (t, {fixture = baseFixture, args, execaOptions, expected, error}) => {
		const assertions = await t.try(async tt => {
			const arguments_ = args ? args.split(' ') : [];
			const {all: output, exitCode} = await spawnFixture(fixture, arguments_, {reject: false, all: true, ...execaOptions});
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
