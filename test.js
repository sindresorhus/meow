import childProcess from 'child_process';
import test from 'ava';
import indentString from 'indent-string';
import execa from 'execa';
import {version as pkgVersion} from './package.json';
import fn from './';

test('return object', t => {
	const cli = fn({
		argv: ['foo', '--foo-bar', '-u', 'cat'],
		help: [
			'Usage',
			'  foo <input>'
		]
	}, {
		alias: {u: 'unicorn'},
		default: {meow: 'dog'}
	});

	t.is(cli.input[0], 'foo');
	t.true(cli.flags.fooBar);
	t.is(cli.flags.meow, 'dog');
	t.is(cli.flags.unicorn, 'cat');
	t.is(cli.pkg.name, 'meow');
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>', '  '));
});

test('support help shortcut', t => {
	const cli = fn(['unicorn', 'cat']);
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat', '  '));
});

test('spawn cli and show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version'], {cwd: __dirname});

	t.is(stdout, pkgVersion);
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa('./fixture.js', ['--help'], {cwd: __dirname});

	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>', '  '));
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa('./fixture.js', ['-u', 'cat'], {cwd: __dirname});

	t.is(stdout, 'u\nunicorn\nmeow');
});

test.serial('pkg.bin as a string should work', t => {
	fn({
		pkg: {
			name: 'browser-sync',
			bin: 'bin/browser-sync.js'
		}
	});

	t.is(process.title, 'browser-sync');
});

test('single character flag casing should be preserved', t => {
	t.ok(fn({argv: ['-F']}).flags.F);
});

test('should not infer type', t => {
	console.log(fn({argv: ['5']}).input);

	t.is(fn({argv: ['5']}).input[0], '5');
});
