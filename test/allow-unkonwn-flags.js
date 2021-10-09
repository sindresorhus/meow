import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import execa from 'execa';

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
