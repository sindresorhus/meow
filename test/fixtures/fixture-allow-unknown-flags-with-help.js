#!/usr/bin/env node
import meow from '../../index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	allowUnknownFlags: false,
	flags: {
		help: {
			alias: 'h',
			type: 'boolean',
		},
		version: {
			alias: 'v',
			type: 'boolean',
		},
	},
});

console.log(cli.flags.help);
