#!/usr/bin/env node
import meow from '../../index.js';

const subcommand = options => meow({
	...options,
	description: 'Subcommand description',
	help: `
		Unicorn command
		Usage:
			foo unicorn <input>
	`,
	flags: {
		unicorn: {alias: 'u', isRequired: true},
	},
});

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
			foo unicorn <input>
	`,
	commands: {
		unicorn: subcommand,
	},
	flags: {
		test: {
			type: 'number',
			alias: 't',
			isRequired: () => false,
			isMultiple: true,
		},
	},
});

console.log(JSON.stringify(cli));
