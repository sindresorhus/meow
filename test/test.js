import test from 'ava';
import indentString from 'indent-string';
import meow from '../source/index.js';
import {_verifyCli, stripIndentTrim} from './_utils.js';

const importMeta = import.meta;
const verifyCli = _verifyCli();

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

test('spawn cli and test input', verifyCli, {
	args: '-u cat',
	expected: stripIndentTrim`
		unicorn
		meow
		camelCaseOption
	`,
});

test('spawn cli and test input flag', verifyCli, {
	args: '--camel-case-option bar',
	expected: 'bar',
});

test('disable autoVersion/autoHelp if `cli.input.length > 0`', t => {
	t.is(meow({importMeta, argv: ['bar', '--version']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--help']}).input.at(0), 'bar');
	t.is(meow({importMeta, argv: ['bar', '--version', '--help']}).input.at(0), 'bar');
});
