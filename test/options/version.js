import test from 'ava';
import {spawnFixture, stripIndentTrim} from '../_utils.js';

const verifyVersion = test.macro(async (t, {fixture = 'version/fixture.js', args, execaOptions, expected}) => {
	const assertions = await t.try(async tt => {
		const {stdout} = await spawnFixture(fixture, args.split(' '), execaOptions);

		tt.log('version:', stdout);
		tt.is(stdout, expected);
	});

	assertions.commit({retainLogs: !assertions.passed});
});

test('spawn cli and show version', verifyVersion, {
	args: '--version',
	expected: '1.0.0',
});

test('spawn cli and disabled autoVersion', verifyVersion, {
	fixture: 'fixture.js',
	args: '--version --no-auto-version',
	expected: stripIndentTrim`
		version
		autoVersion
		meow
		camelCaseOption
	`,
});

test('spawn cli and not show version', verifyVersion, {
	fixture: 'fixture.js',
	args: '--version=beta',
	expected: stripIndentTrim`
		version
		meow
		camelCaseOption
	`,
});

test('custom version', verifyVersion, {
	args: '--version',
	execaOptions: {env: {VERSION: 'beta'}},
	expected: 'beta',
});

test('version = false has no effect', verifyVersion, {
	args: '--version',
	execaOptions: {env: {VERSION: 'false'}},
	expected: '1.0.0',
});

test('manual showVersion', verifyVersion, {
	args: '--show-version',
	expected: '1.0.0',
});
