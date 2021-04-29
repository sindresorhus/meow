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
	flags: {
		test: {
			type: 'number',
			alias: 't',
			isRequired: true,
			isMultiple: true
		}
	}
});

console.log(cli.flags.test);
