#!/usr/bin/env node
import meow from '../../index.js';

const cli = meow({
	importMeta: import.meta,
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	preferNestedFlags: true,
	flags: {
		foo: {
			type: 'string',
		},
	},
});

console.log(cli.flags.foo);
