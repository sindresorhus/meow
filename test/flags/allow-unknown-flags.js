import test from 'ava';
import indentString from 'indent-string';
import {readPackage} from 'read-pkg';
import {spawnFixture, stripIndentTrim} from '../_utils.js';

const fixtureFolder = 'allow-unknown-flags';

const allowUnknownFlags = `${fixtureFolder}/fixture.js`;
const allowUnknownFlagsWithHelp = `${fixtureFolder}/fixture-with-help.js`;

test('spawn CLI and test specifying unknown flags', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(allowUnknownFlags, ['--foo', 'bar', '--unspecified-a', '--unspecified-b', 'input-is-allowed']),
		{message: /^Command failed with exit code 2/},
	);

	t.is(stderr, stripIndentTrim`
		Unknown flags
		--unspecified-a
		--unspecified-b
	`);
});

test('spawn CLI and test specifying known flags', async t => {
	const {stdout} = await spawnFixture(allowUnknownFlags, ['--foo', 'bar']);
	t.is(stdout, 'bar');
});

test('spawn CLI and test help as a known flag', async t => {
	const {stdout} = await spawnFixture(allowUnknownFlags, ['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn CLI and test version as a known flag', async t => {
	const package_ = await readPackage();
	const {stdout} = await spawnFixture(allowUnknownFlags, ['--version']);
	t.is(stdout, package_.version);
});

test('spawn CLI and test help as an unknown flag', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(allowUnknownFlags, ['--help', '--no-auto-help']),
		{message: /^Command failed with exit code 2/},
	);

	t.is(stderr, stripIndentTrim`
		Unknown flag
		--help
	`);
});

test('spawn CLI and test version as an unknown flag', async t => {
	const {stderr} = await t.throwsAsync(
		spawnFixture(allowUnknownFlags, ['--version', '--no-auto-version']),
		{message: /^Command failed with exit code 2/},
	);

	t.is(stderr, stripIndentTrim`
		Unknown flag
		--version
	`);
});

test('spawn CLI and test help with custom config', async t => {
	const {stdout} = await spawnFixture(allowUnknownFlagsWithHelp, ['-h']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn CLI and test version with custom config', async t => {
	const package_ = await readPackage();
	const {stdout} = await spawnFixture(allowUnknownFlagsWithHelp, ['-v']);
	t.is(stdout, package_.version);
});
