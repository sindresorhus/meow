import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import indentString from 'indent-string';
import {execa} from 'execa';
import {readPackage} from 'read-pkg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureAllowUnknownFlags = path.join(__dirname, 'fixtures', 'fixture-allow-unknown-flags.js');
const fixtureAllowUnknownFlagsWithHelp = path.join(__dirname, 'fixtures', 'fixture-allow-unknown-flags-with-help.js');

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

test('spawn CLI and test help as a known flag', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn CLI and test version as a known flag', async t => {
	const pkg = await readPackage();
	const {stdout} = await execa(fixtureAllowUnknownFlags, ['--version']);
	t.is(stdout, pkg.version);
});

test('spawn CLI and test help as an unknown flag', async t => {
	const error = await t.throwsAsync(
		execa(fixtureAllowUnknownFlags, ['--help', '--no-auto-help']),
		{
			message: /^Command failed with exit code 2/,
		},
	);
	const {stderr} = error;
	t.regex(stderr, /Unknown flag/);
	t.regex(stderr, /--help/);
});

test('spawn CLI and test version as an unknown flag', async t => {
	const error = await t.throwsAsync(
		execa(fixtureAllowUnknownFlags, ['--version', '--no-auto-version']),
		{
			message: /^Command failed with exit code 2/,
		},
	);
	const {stderr} = error;
	t.regex(stderr, /Unknown flag/);
	t.regex(stderr, /--version/);
});

test('spawn CLI and test help with custom config', async t => {
	const {stdout} = await execa(fixtureAllowUnknownFlagsWithHelp, ['-h']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn CLI and test version with custom config', async t => {
	const pkg = await readPackage();
	const {stdout} = await execa(fixtureAllowUnknownFlagsWithHelp, ['-v']);
	t.is(stdout, pkg.version);
});
