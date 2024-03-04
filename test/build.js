import test from 'ava';
import meow from '../build/index.js';
import {_verifyCli, meowVersion} from './_utils.js';

const verifyCli = _verifyCli('build.js');

test('main', t => {
	const cli = meow(`
		Usage
		  foo <input>
	`, {
		importMeta: import.meta,
		argv: 'foo --foo-bar --u cat -- unicorn cake'.split(' '),
		flags: {
			unicorn: {
				shortFlag: 'u',
			},
			meow: {
				default: 'dog',
			},
			'--': true,
		},
	});

	t.like(cli, {
		input: ['foo'],
		flags: {
			fooBar: true,
			meow: 'dog',
			unicorn: 'cat',
			'--': [
				'unicorn',
				'cake',
			],
		},
		pkg: {
			name: 'meow',
		},
		help: '\n  CLI app helper\n\n  Usage\n    foo <input>\n',
	});
});

test('spawn cli and show version', verifyCli, {
	args: '--version',
	expected: meowVersion,
});
