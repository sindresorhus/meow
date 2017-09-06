import test from 'ava';
import indentString from 'indent-string';
import execa from 'execa';
import pkg from './package';
import m from './';

test('return object', t => {
	const cli = m({
		argv: ['foo', '--foo-bar', '-u', 'cat', '--', 'unicorn', 'cake'],
		help: `
			Usage
			  foo <input>
		`
	}, {
		alias: {u: 'unicorn'},
		default: {meow: 'dog'},
		'--': true
	});

	t.is(cli.input[0], 'foo');
	t.true(cli.flags.fooBar);
	t.is(cli.flags.meow, 'dog');
	t.is(cli.flags.unicorn, 'cat');
	t.deepEqual(cli.flags['--'], ['unicorn', 'cake']);
	t.is(cli.pkg.name, 'meow');
	t.is(cli.help, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2));
});

test('support help shortcut', t => {
	const cli = m(`
		unicorn
		cat
	`);
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat\n', 2));
});

test('spawn cli and show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version']);
	t.is(stdout, pkg.version);
});

test('spawn cli and not show version', async t => {
	const {stdout} = await execa('./fixture.js', ['--version', '--no-auto-version']);
	t.is(stdout, 'version\nautoVersion\nmeow\ncamelCaseOption');
});

test('spawn cli and show help screen', async t => {
	const {stdout} = await execa('./fixture.js', ['--help']);
	t.is(stdout, indentString('\nCustom description\n\nUsage\n  foo <input>\n\n', 2));
});

test('spawn cli and not show help screen', async t => {
	const {stdout} = await execa('./fixture.js', ['--help', '--no-auto-help']);
	t.is(stdout, 'help\nautoHelp\nmeow\ncamelCaseOption');
});

test('spawn cli and test input', async t => {
	const {stdout} = await execa('./fixture.js', ['-u', 'cat']);
	t.is(stdout, 'u\nunicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input flag', async t => {
	const {stdout} = await execa('./fixture.js', ['--camel-case-option', 'bar']);
	t.is(stdout, 'bar');
});

// TODO: This fails in Node.js 7.10.0, but not 6 or 4
test.serial.skip('pkg.bin as a string should work', t => { // eslint-disable-line ava/no-skip-test
	m({
		pkg: {
			name: 'browser-sync',
			bin: 'bin/browser-sync.js'
		}
	});

	t.is(process.title, 'browser-sync');
});

test('single character flag casing should be preserved', t => {
	t.deepEqual(m({argv: ['-F']}).flags, {F: true});
});

test('type inference', t => {
	t.is(m({argv: ['5']}).input[0], '5');
	t.is(m({argv: ['5']}, {string: ['_']}).input[0], '5');
	t.is(m({
		argv: ['5'],
		inferType: true
	}).input[0], 5);
	t.is(m({
		argv: ['5'],
		inferType: true
	}, {string: ['foo']}).input[0], 5);
	t.is(m({
		argv: ['5'],
		inferType: true
	}, {string: ['_', 'foo']}).input[0], 5);
});
