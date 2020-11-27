import path from 'path';
import test from 'ava';
import execa from 'execa';

const fixtureAllowUnknownFlags = path.join(__dirname, 'fixtures', 'fixture-allow-unknown-flags.js');

test('spawn CLI and test specifying unknown flags', async t => {
	const error = await t.throwsAsync(
		execa(fixtureAllowUnknownFlags, ['--foo', 'bar', '--unspecified-a', '--unspecified-b', 'input-is-allowed'])
	);
	const {stderr, message} = error;
	t.regex(message, /Command failed with exit code 2/);
	t.regex(stderr, /Unknown flag/);
	t.regex(stderr, /--unspecified-a/);
	t.regex(stderr, /--unspecified-b/);
	t.notRegex(stderr, /input-is-allowed/);
});

test('spawn CLI and test specifying known flags', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--foo', 'bar']);
	t.is(stdout, 'bar');
});
