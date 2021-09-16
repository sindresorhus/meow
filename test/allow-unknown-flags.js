import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import execa from 'execa';
import {expectedHelp} from './fixtures/fixture-allow-unknown-flags.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureAllowUnknownFlags = path.join(__dirname, 'fixtures', 'fixture-allow-unknown-flags.js');

test('spawn CLI and test specifying unknown flags', async t => {
	const error = await t.throwsAsync(
		execa(fixtureAllowUnknownFlags, ['--foo', 'bar', '--unspecified-a', '--unspecified-b', 'input-is-allowed']),
		{
			message: /^Command failed with exit code 2/,
		},
	);
	const {stderr} = error;
	t.regex(stderr, /Unknown flags/);
	t.regex(stderr, /--unspecified-a/);
	t.regex(stderr, /--unspecified-b/);
	t.notRegex(stderr, /input-is-allowed/);
});

test('spawn CLI and test specifying known flags', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--foo', 'bar']);
	t.is(stdout, 'bar');
});

test('spawn CLI and test specifying --help flag', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--help']);
	t.is(stdout, expectedHelp);
});

test('spawn CLI and test specifying --version flag', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--version']);
	t.is(stdout, '10.1.1');
});
