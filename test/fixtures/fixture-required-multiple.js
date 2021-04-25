#!/usr/bin/env node
import meow from '../../index.js';

const cli = meow({
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
