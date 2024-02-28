import test from 'ava';
import indentString from 'indent-string';
import meow from '../source/index.js';
import {spawnFixture} from './_utils.js';

const importMeta = import.meta;

test('return object', t => {
	const cli = meow({
		importMeta,
		argv: ['foo', '--foo-bar', '-u', 'cat', '--', 'unicorn', 'cake'],
		help: `
			Usage
			  foo <input>
		`,
		flags: {
			unicorn: {shortFlag: 'u'},
			meow: {default: 'dog'},
			'--': true,
		},
	});

	t.like(cli, {
		input: ['foo'],
		flags: {
			fooBar: true,
			meow: 'dog',
			unicorn: 'cat',
			'--': ['unicorn', 'cake'],
		},
		pkg: {
			name: 'meow',
		},
		help: indentString('\nCLI app helper\n\nUsage\n  foo <input>\n', 2),
	});
});

test('spawn cli and test input', async t => {
	const {stdout} = await spawnFixture(['-u', 'cat']);
	t.is(stdout, 'unicorn\nmeow\ncamelCaseOption');
});

test('spawn cli and test input flag', async t => {
	const {stdout} = await spawnFixture(['--camel-case-option', 'bar']);
	t.is(stdout, 'bar');
});

// TODO: what is this test name???
test('accept help and options', t => {
	const cli = meow({
		importMeta,
		argv: ['-f'],
		flags: {
			foo: {
				type: 'boolean',
				shortFlag: 'f',
			},
		},
	});

	t.like(cli.flags, {
		foo: true,
	});
});

test('disable autoVersion/autoHelp if `cli.input.length > 0`', t => {
	t.is(meow({importMeta, argv: ['bar', '--version']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--help']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--version', '--help']}).input.at(0), 'bar');
});
