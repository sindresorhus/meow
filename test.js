import childProcess from 'child_process';
import test from 'ava';
import indentString from 'indent-string';
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
	t.end();
});

test('support help shortcut', t => {
	const cli = fn(['unicorn', 'cat']);
	t.is(cli.help, indentString('\nCLI app helper\n\nunicorn\ncat', '  '));
	t.end();
});

test('spawn cli and show version', t => {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['--version'], {
		cwd: __dirname
	}, (err, stdout) => {
		t.ifError(err);
		t.is(stdout.trim(), require('./package.json').version);
	});
});

test('spawn cli and show help screen', t => {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['--help'], {
		cwd: __dirname
	}, (err, stdout) => {
		t.ifError(err);
		t.is(stdout, indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', '  '));
	});
});

test('spawn cli and test input', t => {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['-u', 'cat'], {
		cwd: __dirname
	}, (err, stdout) => {
		t.ifError(err);
		t.is(stdout, 'u\nunicorn\nmeow\n');
	});
});

test.serial('pkg.bin as a string should work', t => {
	fn({
		pkg: {
			name: 'browser-sync',
			bin: 'bin/browser-sync.js'
		}
	});

	t.is(process.title, 'browser-sync');
	t.end();
});
