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
			shortFlag: 'h',
			type: 'boolean',
		},
		version: {
			shortFlag: 'v',
			type: 'boolean',
		},
	},
});

console.log(cli.flags.help);
