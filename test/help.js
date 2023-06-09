import test from 'ava';
import indentString from 'indent-string';
import meow from '../source/index.js';
import {spawnFixture} from './_utils.js';

const importMeta = import.meta;

test('support help shortcut', t => {
	t.is(meow(`
		unicorn
		cat
	`, {
		importMeta,
	}).help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 2));
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await spawnFixture(['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn cli and disabled autoHelp', async t => {
	const {stdout} = await spawnFixture(['--help', '--no-auto-help']);
	t.is(stdout, 'help\nautoHelp\nmeow\ncamelCaseOption');
});

test('spawn cli and not show help', async t => {
	const {stdout} = await spawnFixture(['--help=all']);
	t.is(stdout, 'help\nmeow\ncamelCaseOption');
});

test('single line help messages are not indented', t => {
	t.is(meow({
		importMeta,
		description: false,
		help: 'single line',
	}).help, '\nsingle line\n');
});

test('descriptions with no help are not indented', t => {
	t.is(meow({
		importMeta,
		help: false,
		description: 'single line',
	}).help, '\nsingle line\n');
});

test('support help shortcut with no indentation', t => {
	t.is(meow(`
		unicorn
		cat
	`, {
		indent: 0,
		importMeta,
	}).help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 0));
});

test('no description and no indentation', t => {
	t.is(meow(`
		unicorn
		cat
	`, {
		indent: 0,
		description: false,
		importMeta,
	}).help, indentString('\nunicorn\ncat\n', 0));
});
