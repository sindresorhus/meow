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
		foo: {
			type: 'string',
		},
	},
});

export const expectedHelp = `
  Custom description

  Usage
    foo <input>

`;

console.log(cli.flags.foo);
