import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'ava';
import execa from 'execa';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtureSubcommands = path.join(__dirname, 'fixtures', 'fixture-commands.js');

test('spawn CLI and test subcommands', async t => {
	const {stdout} = await execa(fixtureSubcommands, [
		'unicorn',
		'--unicorn',
	]);
	const {commands} = JSON.parse(stdout);
	t.assert('unicorn' in commands);
	t.deepEqual(commands.unicorn.input, []);
	t.deepEqual(commands.unicorn.commands, {});
	t.deepEqual(commands.unicorn.flags, {unicorn: true});
});

test('spawn CLI and test subcommand flags', async t => {
	const error = await t.throwsAsync(execa(fixtureSubcommands, ['unicorn']));
	const {stderr} = error;
	t.regex(stderr, /Missing required flag/);
	t.regex(stderr, /--unicorn/);
});

test('spawn CLI and test subcommand help text', async t => {
	const {stdout} = await execa(fixtureSubcommands, [
		'unicorn',
		'--help',
	]);
	t.regex(stdout, /Subcommand description/);
	t.regex(stdout, /Unicorn command/);
});

test('spawn CLI and test CLI help text', async t => {
	const {stdout} = await execa(fixtureSubcommands, [
		'--help',
	]);
	t.regex(stdout, /Custom description/);
});
