#!/usr/bin/env node
import meow from '../../index.js';

const cli = meow({
	description: 'Custom description',
	help: `
		Usage
		  foo <input>
  `,
	allowUnknownFlags: false,
	flags: {
		foo: {
			type: 'string'
		}
	}
});

console.log(cli.flags.foo);
