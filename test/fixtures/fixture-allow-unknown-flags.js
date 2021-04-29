#!/usr/bin/env node
import path from 'node:path';
import meow from '../../index.js';

const cli = meow({
	packagePath: path.join(import.meta.url, '../..'),
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
