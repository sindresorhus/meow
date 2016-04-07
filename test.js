import test from 'ava';
import indentString from 'indent-string';
import execa from 'execa';
import pkg from './package.json';
import fn from './';

global.Promise = Promise;

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
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', '  '));
});

test('support help shortcut', t => {
	const cli = fn(['unicorn', 'cat']);
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat\n', '  '));
});

test('spawn cli and show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version']);

	t.is(stdout, pkg.version);
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa('./fixture.js', ['--help']);

	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n', '  '));
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa('./fixture.js', ['-u', 'cat']);

	t.is(stdout, 'u\nunicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa('./fixture.js', ['--camel-case-option', 'bar']);

	t.is(stdout, 'bar');
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
	t.truthy(fn({argv: ['-F']}).flags.F);
});

test('type inference', t => {
	t.is(fn({argv: ['5']}).input[0], '5');
	t.is(fn({argv: ['5']}, {string: ['_']}).input[0], '5');
	t.is(fn({argv: ['5'], inferType: true}).input[0], 5);
	t.is(fn({argv: ['5'], inferType: true}, {string: ['foo']}).input[0], 5);
	t.is(fn({argv: ['5'], inferType: true}, {string: ['_', 'foo']}).input[0], 5);
});
