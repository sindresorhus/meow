'use strict';
var childProcess = require('child_process');
var test = require('ava');
var indentString = require('indent-string');
var meow = require('./');

test('return object', function (t) {
	var cli = meow({
		argv: ['foo', '--foo-bar', '-u', 'cat'],
		help: [
			'Usage',
			'  foo <input>'
		]
	}, {
		alias: {u: 'unicorn'},
		default: {meow: 'dog'}
	});

	t.assert(cli.input[0] === 'foo');
	t.assert(cli.flags.fooBar);
	t.assert(cli.flags.meow === 'dog');
	t.assert(cli.flags.unicorn === 'cat');
	t.assert(cli.pkg.name === 'meow');
	t.assert(cli.help === indentString('\nCLI app helper\n\nUsage\n  foo <input>', '  '));
	t.end();
});

test('support help shortcut', function (t) {
	var cli = meow(['unicorn', 'cat']);
	t.assert(cli.help === indentString('\nCLI app helper\n\nunicorn\ncat', '  '));
	t.end();
});

test('spawn cli and show version', function (t) {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['--version'], {cwd: __dirname}, function (err, stdout) {
		t.assert(!err, err);
		t.assert(stdout.trim() === require('./package.json').version);
	});
});

test('spawn cli and show help screen', function (t) {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['--help'], {cwd: __dirname}, function (err, stdout) {
		t.assert(!err, err);
		t.assert(stdout === indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', '  '));
	});
});

test('spawn cli and test input', function (t) {
	t.plan(2);

	childProcess.execFile('./fixture.js', ['-u', 'cat'], {cwd: __dirname}, function (err, stdout) {
		t.assert(!err, err);
		t.assert(stdout === 'u\nunicorn\nmeow\n');
	});
});
